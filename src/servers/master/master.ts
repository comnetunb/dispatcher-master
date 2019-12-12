import logger from '../shared/log';
import * as fs from 'fs';
import * as communication from './communication';
import * as connectionManager from './connection_manager';
import { event as interfaceManagerEvent } from '../shared/interface_manager';
import Task, { ITask } from '../../database/models/task';
import Configuration, { IConfiguration } from '../../database/models/configuration';
import Worker from '../../database/models/worker';
import { GetReport, ProtocolType, EncapsulatePDU, PerformTask, Command, PerformCommand } from 'dispatcher-protocol';
import { OperationState } from '../../api/enums';
import { IFile } from '../../database/models/file';
import { ProtocolFile } from 'dispatcher-protocol';

export = async (): Promise<void> => {
  try {
    await cleanUp();

    // After cleanUp, start all services
    communication.execute();

    // Routines
    await requestResourceRoutine();
    await batchDispatchRoutine();
  } catch (e) {
    logger.fatal(e);
  }
};

async function requestResourceRoutine(): Promise<void> {
  requestResourceFromAllWorkers();
  let config = await Configuration.get();
  setInterval(() => {
    requestResourceFromAllWorkers();
  }, config.requestResourceInterval);
}

function requestResourceFromAllWorkers(): void {
  const getResource: GetReport = {
    type: ProtocolType.GetReport,
    resources: true,
    tasks: false,
    state: false,
    supportedLanguages: false,
    alias: false,
  };

  connectionManager.getAll().forEach((connection) => {
    connectionManager.send(connection.id, EncapsulatePDU(getResource));
  });
}

async function batchDispatchRoutine(): Promise<void> {
  let config = await Configuration.get();
  setInterval(() => {
    try {
      batchDispatch();
    } catch (err) {
      logger.error(`Could not batch dispatch tasks: ${err}`);
    }
  }, config.dispatchInterval);
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
    let task = tasks[i];
    task.state = OperationState.Sent;
    task.worker = availableWorkers[i].uuid;
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
    connectionManager.send(availableWorkers[i].uuid, EncapsulatePDU(pdu));

    const taskSetName = task._taskSet.name;

    logger.info(`Dispatched task with precedence ${task.precedence} (${task._id}) from set `
      + `${taskSetName} to ${availableWorkers[i].address}`, task._id);

    setTimeout(async () => {
      const taskRefreshed = await Task.findById(task._id);
      if (!taskRefreshed) {
        throw String('Task not found!');
      }

      if (taskRefreshed.isSent()) {
        logger.warn(`Timeout from worker ${availableWorkers[i].address}:${availableWorkers[i].port}`, task._id);
        taskRefreshed.updateToDefaultState();
      }
    }, 10000);
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
      .update(taskFilter, taskUpdate, { multi: true }));

  // Remove all workers since it is the master startup
  promises.push(Worker.remove({}));

  await Promise.all(promises);
}

// TODO: use uuid instead of address
interfaceManagerEvent.on('worker_command', (address: string, command: Command) => {
  const workerFilter = { address };

  Worker
    .findOne(workerFilter)
    .then((worker) => {
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

      connectionManager.send(worker.uuid, EncapsulatePDU(performCommand));
      connectionManager.send(worker.uuid, EncapsulatePDU(getReport));
    })
    .catch((error) => {
      logger.fatal(error);
    });
});
