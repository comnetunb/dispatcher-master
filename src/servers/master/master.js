/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */
const dispatcherProtocol = require('dispatcher-protocol');

// Master Related
const connectionManager = rootRequire('servers/master/connection_manager');
const communication = rootRequire('servers/master/communication');
const workerDiscovery = rootRequire('servers/master/worker_discovery');

// Shared Related
const log = rootRequire('servers/shared/log');
const config = rootRequire('servers/shared/configuration').getConfiguration();
const interfaceManagerEvent = rootRequire('servers/shared/interface_manager').event;

// Database Related
const Task = databaseRequire('models/task');
const Worker = rootRequire('database/models/worker');

// Protocol Related
const { Flags } = dispatcherProtocol.common;
const { getReport, performTask, performCommand } = dispatcherProtocol.pdu;

module.exports = () => {
  try {
    cleanUp()
      .then(() => {
        // After cleanUp, start all services
        communication.execute();
        workerDiscovery.execute();

        // Routines
        requestResourceRoutine();
        batchDispatchRoutine();
      });
  } catch (e) {
    log.fatal(e);
  }
};

function requestResourceRoutine() {
  requestResource();
  setInterval(() => {
    requestResource();
  }, config.requestResourceInterval * 1000);
}

function requestResource() {
  connectionManager.getAll().forEach((connection) => {
    connectionManager.send(connection.id, getReport.format({ flags: Flags.RESOURCE }));
  });
}

function batchDispatchRoutine() {
  batchDispatch();
  setInterval(() => {
    batchDispatch();
  }, config.dispatchInterval * 1000);
}

/**
 * Retrieve number of workers that fit in cpu and memory threshold. With this
 * number (n) in hands, make a top 'n' select of pending tasks and dispatch it
 * to all those workers
 */

function batchDispatch() {
  Worker
    .getAvailables(config.cpu.threshold, config.memory.threshold)
    .then((availableWorkers) => {
      if (!availableWorkers || !availableWorkers.length) {
        return;
      }

      const taskFilter = {
        state: Task.State.PENDING
      };

      const taskPopulate = {
        path: '_taskSet',
        select: '_runnable name _files',
        populate: { path: '_runnable _files' },
        options: { sort: { '_taskSet.priority': -1 } }
      };

      Task
        .find(taskFilter)
        .populate(taskPopulate)
        .sort({ precedence: 1 })
        .limit(availableWorkers.length)
        .then((tasks) => {
          if (!tasks) {
            // No tasks are pending
            return;
          }

          tasks
            .forEach((task, index) => {
              task.state = Task.State.SENT;
              task.worker = availableWorkers[index].uuid;
              task.startTime = new Date();

              return task
                .save()
                .then(() => {
                  const files = task._taskSet._files;
                  files.push(task._taskSet._runnable);

                  const pdu = performTask.format({
                    task: { id: task._id },
                    commandLine: task.commandLine,
                    files
                  });

                  connectionManager.send(availableWorkers[index].uuid, pdu);

                  const taskSetName = task._taskSet.name;

                  log.info(`Dispatched task with precedence ${task.precedence} (${task._id}) from set `
                    + `${taskSetName} to ${availableWorkers[index].address}`, task._id);

                  // If after X seconds it is still 'Sent', return it to its default state
                  setTimeout(() => {
                    return Task
                      .findById(task._id)
                      .then((taskRefreshed) => {
                        if (!taskRefreshed) {
                          throw String('Task not found!');
                        }

                        if (taskRefreshed.isSent()) {
                          log.warn(`Timeout from worker ${availableWorkers[index].address}:${availableWorkers[index].port}`, task._id);
                          return Task.updateToDefaultState(taskRefreshed._id);
                        }
                        return undefined;
                      });
                  }, 10000);
                });
            });
        })
        .catch((err) => {
          log.error(err);
        });
    });
}

function cleanUp() {
  // Clean all tasks
  const taskFilter = {
    $or: [
      { state: Task.State.SENT },
      { state: Task.State.EXECUTING }
    ]
  };

  const taskUpdate = {
    state: Task.State.PENDING,
    $unset: { worker: 1, startTime: 1 }
  };

  const promises = [];

  promises
    .push(Task
      .update(taskFilter, taskUpdate, { multi: true }));

  // Remove all workers since it is the master startup
  promises.push(Worker.remove({}));

  return Promise.all(promises);
}

// TODO: use uuid instead of address
interfaceManagerEvent.on('worker_command', (address, command) => {
  const workerFilter = { address };

  Worker
    .findOne(workerFilter)
    .then((worker) => {
      if (!worker) {
        throw String('Worker not found');
      }

      connectionManager.send(worker.uuid, performCommand.format({ command }));

      const flags = Flags.STATE | Flags.TASKS;

      connectionManager.send(worker.uuid, getReport.format({ flags }));
    })
    .catch((e) => {
      log.fatal(e);
    });
});
