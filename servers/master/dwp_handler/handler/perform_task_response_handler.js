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

module.exports.execute = (pdu, worker) => {
  if (pdu.code === performTaskResponse.ReturnCode.EXECUTING) {
    Task
      .findById(pdu.task.id)
      .then((task) => {
        if (!task) {
          throw String('Task not found');
        }

        if (task.worker !== worker.uuid) {
          // There is already a worker executing it
          connectionManager.send(worker.uuid, terminateTask.format({
            taskId: pdu.task.id
          }));
          return false;
        }

        task.worker = worker.uuid;
        task.state = Task.State.EXECUTING;
        task.save();

        return true;
      })
      .then((needsToUpdate) => {
        if (needsToUpdate) {
          worker.updateRunningInstances();
        }
      })
      .catch((e) => {
        log.fatal(e);
      });
  } else if (pdu.code === performTaskResponse.ReturnCode.DENIED) {
    log.warn(`Task was denied by worker ${worker.address}:${worker.port}`);
  } else {
    log.fatal(`Unknown return code ${pdu.code}`);
  }
};
