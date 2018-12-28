/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const dispatcherProtocol = require('dispatcher-protocol');

const log = rootRequire('servers/shared/log');
const connectionManager = rootRequire('servers/master/connection_manager');

const Task = rootRequire('database/models/task');

const { terminateTask, performTaskResponse } = dispatcherProtocol.pdu;

module.exports.execute = (pdu, slave) => {
  if (pdu.code === performTaskResponse.ReturnCode.EXECUTING) {
    Task
      .findById(pdu.task.id)
      .then((task) => {
        if (!task) {
          throw String('Task not found');
        }

        if (task.slave !== slave.uuid) {
          // There is already a slave executing it
          connectionManager.send(slave.uuid, terminateTask.format({
            taskId: pdu.task.id
          }));
          return false;
        }

        task.slave = slave.uuid;
        task.state = Task.State.EXECUTING;
        task.save();

        return true;
      })
      .then((needsToUpdate) => {
        if (needsToUpdate) {
          slave.updateRunningInstances();
        }
      })
      .catch((e) => {
        log.fatal(e);
      });
  } else if (pdu.code === performTaskResponse.ReturnCode.DENIED) {
    log.warn(`Task was denied by slave ${slave.address}:${slave.port}`);
  } else {
    log.fatal(`Unknown return code ${pdu.code}`);
  }
};
