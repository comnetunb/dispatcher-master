import logger from '../shared/log';
import * as fs from 'fs';
import * as communication from './communication';
import * as connectionManager from './connection_manager';
import { event as interfaceManagerEvent } from '../shared/interface_manager';
import Task, { ITask } from '../../database/models/task';
import Configuration, { IConfiguration } from '../../database/models/configuration';
import Worker, { IWorker } from '../../database/models/worker';
import { GetReport, ProtocolType, EncapsulatePDU, PerformTask, Command, PerformCommand } from 'dispatcher-protocol';
import { OperationState } from '../../api/enums';
import { IFile } from '../../database/models/file';
import { ProtocolFile } from 'dispatcher-protocol';
import { request } from 'http';

let requestResourceInterval: NodeJS.Timeout;
let batchDispatchInterval: NodeJS.Timeout;

export default async (): Promise<void> => {
  try {
    await cleanUp();

    // After cleanUp, start all services
    communication.execute();

    // Routines
    await requestResourceRoutine();
    await batchDispatchRoutine();
  } catch (e) {
    let error: Error = e;
    logger.fatal(error.message);
  }
};

export async function startRoutines(): Promise<void> {
  if (requestResourceInterval) {
    clearInterval(requestResourceInterval);
    requestResourceInterval = null;
  }
  if (batchDispatchInterval) {
    clearInterval(batchDispatchInterval);
    requestResourceInterval = null;
  }

  await requestResourceRoutine();
  await batchDispatchRoutine();
}

async function requestResourceRoutine(): Promise<void> {
  let config = await Configuration.get();
  requestResourceInterval = setInterval(async () => {
    try {
      await requestResourceFromAllWorkers();
    } catch (err) {
      logger.error(`Could not request resources from workers: ${err}`);
    }
  }, config.requestResourceInterval * 1000);
}

async function batchDispatchRoutine(): Promise<void> {
  let config = await Configuration.get();
  batchDispatchInterval = setInterval(async () => {
    try {
      await batchDispatch();
    } catch (err) {
      logger.error(`Could not batch dispatch tasks: ${err}`);
    }
  }, config.dispatchInterval * 1000);
}

async function requestResourceFromAllWorkers(): Promise<void> {
  const getResource: GetReport = {
    type: ProtocolType.GetReport,
    resources: true,
    tasks: false,
    state: false,
    supportedLanguages: false,
    alias: false,
  };

  const workers = await connectionManager.getAll();
  workers.forEach(async (worker) => {
    try {
      await connectionManager.send(worker, getResource);
    } catch (err) {
      logger.error(`Could not send GetReport command to worker ${worker.name}: ${err}`);
    }
  });
}

/**
 * Retrieve number of workers that fit in cpu and memory threshold. With this
 * number (n) in hands, make a top 'n' select of pending tasks and dispatch it
 * to all those workers
 */

async function batchDispatch(): Promise<void> {
  let config = await Configuration.get();
  const availableWorkers = await Worker.getAvailables(config.cpuLimit, config.memoryLimit);
  if (!availableWorkers || !availableWorkers.length) {
    return;
  }

  const taskFilter = {
    state: OperationState.Pending,
  };

  const taskPopulate = {
    path: '_taskSet',
    select: '_runnable name _files',
    populate: { path: '_runnable _files' },
    options: { sort: { '_taskSet.priority': -1 } }
  };

  const tasks = await Task.find(taskFilter)
    .populate(taskPopulate)
    .sort({ precedence: 1 })
    .limit(availableWorkers.length);

  if (!tasks) {
    // No tasks are pending
    return;
  }

  const promises: Promise<ITask>[] = [];

  for (let i = 0; i < tasks.length; i += 1) {
    try {
      let task = tasks[i];
      task.state = OperationState.Sent;
      task.worker = availableWorkers[i]._id;
      task.startTime = new Date();

      await task.save();
      const files: IFile[] = task._taskSet._files;
      let pduFiles: ProtocolFile[] = [];
      for (let i = 0; i < files.length; i++) {
        let content = fs.readFileSync(files[i].path, { encoding: 'base64' });
        pduFiles.push({
          name: files[i].name,
          content,
        });
      }

      let runnableContent = fs.readFileSync(task._taskSet._runnable.path, { encoding: 'base64' });
      pduFiles.push({
        name: task._taskSet._runnable.name,
        content: runnableContent,
      });
      const pdu: PerformTask = {
        type: ProtocolType.PerformTask,
        commandLine: task.commandLine,
        task: {
          id: task.id,
        },
        files: pduFiles,
      };

      await connectionManager.send(availableWorkers[i], pdu);

      const taskSetName = task._taskSet.name;

      logger.info(`Dispatched task with precedence ${task.precedence} (${task._id}) from set `
        + `${taskSetName} to ${availableWorkers[i].status.remoteAddress}`, task._id);

      setTimeout(async () => {
        try {
          const taskRefreshed = await Task.findById(task._id);
          if (!taskRefreshed) {
            logger.error(`Could not find task with id ${task._id} that was just dispatched to worker ${availableWorkers[i].name}`);
            return;
          }

          if (taskRefreshed.isSent()) {
            logger.warn(`Timeout from worker ${availableWorkers[i].status.remoteAddress}`, task._id);
            await taskRefreshed.updateToDefaultState();
          }
        } catch (err) {
          logger.error(`Could not verify if worker ${availableWorkers[i].name} properly started task ${task._id}`);
        }
      }, 10000);
    } catch (err) {

    }
  };
}

async function cleanUp(): Promise<void> {
  // Clean all tasks
  const taskFilter = {
    $or: [
      { state: OperationState.Sent },
      { state: OperationState.Executing }
    ]
  };

  const taskUpdate = {
    state: OperationState.Pending,
    $unset: { worker: 1, startTime: 1 }
  };

  const promises = [];

  promises
    .push(Task
      .updateMany(taskFilter, taskUpdate, { multi: true }));

  await Promise.all(promises);
}

interfaceManagerEvent.on('worker_command', async (workerId: string, command: Command) => {
  try {
    const worker = await Worker.findById(workerId);
    if (!worker) {
      throw String('Worker not found');
    }

    const performCommand: PerformCommand = {
      type: ProtocolType.PerformCommand,
      command,
    };

    const getReport: GetReport = {
      type: ProtocolType.GetReport,
      state: true,
      tasks: true,
      alias: false,
      supportedLanguages: false,
      resources: false,
    };

    await connectionManager.send(worker, performCommand);
    await connectionManager.send(worker, getReport);
  } catch (err) {
    logger.fatal(`Could not execute command for worker with id ${workerId}: ${err}`);
  }
});
