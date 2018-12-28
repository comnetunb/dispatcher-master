/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */


const dispatcherProtocol = require('dispatcher-protocol');

const connectionManager = rootRequire('servers/master/connection_manager');

const Task = rootRequire('database/models/task');

const log = rootRequire('servers/shared/log');

const flags = dispatcherProtocol.common.Flags;
const { terminateTask } = dispatcherProtocol.pdu;

module.exports.execute = (pdu, slave) => {
  if (pdu.flags & flags.RESOURCE) {
    slave.resource.outdated = false;
    slave.resource.cpu = pdu.resource.cpu;
    slave.resource.memory = pdu.resource.memory;
  }

  if (pdu.flags & flags.TASKS) {
    Promise.all(pdu.tasks.map((taskReceived) => {
      // Go through all tasks
      return Task
        .findById(taskReceived.id)
        .then((task) => {
          if (!task) {
            return;
          }

          if (task.isFinished() || task.isCanceled()) {
            // It was canceled or finished. Terminate it
            connectionManager.send(slave.uuid, terminateTask.format({ taskId: taskReceived.id }));
            return;
          }

          if (task.slave) {
            // There is a slave executing this instance already
            if (task.startTime < taskReceived.startTime) {
              // Evaluating by the time they started, the 'older' slave will finish faster
              connectionManager.send(slave.uuid, terminateTask.format({ taskId: taskReceived.id })); // eslint-disable-line
              return;
            }

            // Evaluating by the time they started, the 'newer' slave will finish faster
            connectionManager.send(task.slave, terminateTask.format({ taskId: taskReceived.id }));
          }

          // Associate this instance to this slave
          task.slave = slave.uuid;
          task.save();
        });
    }))
      .then(() => {
        const taskFilter = { slave: slave.uuid };

        return Task
          .find(taskFilter)
          .then((tasks) => {
            if (tasks === null) {
              return;
            }

            Promise
              .all(tasks
                .map((task) => {
                  for (const taskReceived in pdu.tasks) { // eslint-disable-line
                    if (pdu.tasks[taskReceived].id === task._id) {
                      return undefined;
                    }
                  }
                  return Task.updateToDefaultState(task._id);
                }));
          });
      })
      .then(() => {
        slave.updateRunningInstances();
      })
      .catch((e) => {
        log.fatal(e);
      });
  }

  if (pdu.flags & flags.STATE) {
    slave.state = pdu.state;
  }

  if (pdu.flags & flags.ALIAS) {
    slave.alias = pdu.alias;
  }

  slave
    .save()
    .catch((e) => {
      log.fatal(e);
    });
};
