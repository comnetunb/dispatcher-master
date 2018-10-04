/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

// Master Related
const connectionManager = rootRequire('servers/master/connection_manager');
const communication = rootRequire('servers/master/communication');
const slaveDiscovery = rootRequire('servers/master/slave_discovery');

// Shared Related
const log = rootRequire('servers/shared/log');
const config = rootRequire('servers/shared/configuration').getConfiguration();
const interfaceManagerEvent = rootRequire('servers/shared/interface_manager').event;

// Database Related
const Task = databaseRequire('models/task');
const Slave = rootRequire('database/models/slave');

// Protocol Related
const { Flags } = protocolRequire('dwp/common');
const getReport = protocolRequire('dwp/pdu/get_report');
const performTask = protocolRequire('dwp/pdu/perform_task');
const performCommand = protocolRequire('dwp/pdu/perform_command');

module.exports = () => {
  try {
    cleanUp()
      .then(() => {
        // After cleanUp, start all services
        communication.execute();
        slaveDiscovery.execute();

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
 * Retrieve number of slaves that fit in cpu and memory threshold. With this
 * number (n) in hands, make a top 'n' select of pending tasks and dispatch it
 * to all those slaves
 */

function batchDispatch() {
  Slave
    .getAvailables(config.cpu.threshold, config.memory.threshold)
    .then((availableSlaves) => {
      if (!availableSlaves || !availableSlaves.length) {
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
        .limit(availableSlaves.length)
        .then((tasks) => {
          if (!tasks) {
            // No tasks are pending
            return;
          }

          tasks
            .forEach((task, index) => {
              task.state = Task.State.SENT;
              task.slave = availableSlaves[index].uuid;

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

                  connectionManager.send(availableSlaves[index].uuid, pdu);

                  const taskSetName = task._taskSet.name;

                  log.info(`Dispatched task with precedence ${task.precedence} from set`
                    + `${taskSetName} to ${availableSlaves[index].address}`);

                  // If after X seconds it is still 'Sent', return it to its default state
                  setTimeout(() => {
                    return Task
                      .findById(task._id)
                      .then((taskRefreshed) => {
                        if (!taskRefreshed) {
                          throw String('Task not found!');
                        }

                        if (taskRefreshed.isSent()) {
                          log.warn(`Timeout from slave ${availableSlaves[index].address}:${availableSlaves[index].port}`);
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
    $unset: { slave: 1, startTime: 1 }
  };

  const promises = [];

  promises
    .push(Task
      .update(taskFilter, taskUpdate, { multi: true }));

  // Remove all slaves since it is the master startup
  promises.push(Slave.remove({}));

  return Promise.all(promises);
}

// TODO: use uuid instead of address
interfaceManagerEvent.on('slave_command', (address, command) => {
  const slaveFilter = { address };

  Slave
    .findOne(slaveFilter)
    .then((slave) => {
      if (!slave) {
        throw String('Slave not found');
      }

      connectionManager.send(slave.uuid, performCommand.format({ command }));

      const flags = Flags.STATE | Flags.TASKS;

      connectionManager.send(slave.uuid, getReport.format({ flags }));
    })
    .catch((e) => {
      log.fatal(e);
    });
});
