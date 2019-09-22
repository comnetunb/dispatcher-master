/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const uuidv1 = require('uuid/v1');
const dispatcherProtocol = require('dispatcher-protocol');

// Shared Related
const log = rootRequire('servers/shared/log');

// Master Related
const communicationEvent = rootRequire('servers/master/communication').event;
const connectionManager = rootRequire('servers/master/connection_manager');
const performTaskResponseHandler = rootRequire('servers/master/dwp_handler/handler/perform_task_response_handler');
const reportHandler = rootRequire('servers/master/dwp_handler/handler/report_handler');
const taskResultHandler = rootRequire('servers/master/dwp_handler/handler/task_result_handler');
const terminateTaskResponseHandler = rootRequire('servers/master/dwp_handler/handler/terminate_task_response_handler');
const languageHandler = rootRequire('servers/master/dwp_handler/handler/language_handler');

// Database Related
const Task = rootRequire('database/models/task');
const Worker = rootRequire('database/models/worker');

// Protocol Related
const { factory } = dispatcherProtocol;
const { Flags } = dispatcherProtocol.common;
const { getReport } = dispatcherProtocol.pdu;

communicationEvent.on('new_connection', (connection) => {
  const worker = new Worker({
    address: connection.remoteAddress,
    port: connection.remotePort,
    uuid: uuidv1()
  });

  worker
    .save()
    .then((newWorker) => {
      connectionManager.add(newWorker.uuid, connection);

      // Ask everything
      const flags = (Flags.RESOURCE | Flags.TASKS | Flags.STATE | Flags.ALIAS);

      connectionManager.send(newWorker.uuid, getReport.format({ flags }));
    })
    .catch((e) => {
      log.fatal(e);
    });
});

communicationEvent.on('closed_connection', (connection) => {
  connectionManager.remove(connection.id);

  const taskFilter = { worker: connection.id };

  Task
    .find(taskFilter, '_id')
    .then((taskIds) => {
      taskIds.map((taskId) => {
        return Task.updateToDefaultState(taskId);
      });
    })
    .catch((e) => {
      log.fatal(e);
    });

  Worker
    .find({ uuid: connection.id })
    .remove()
    .catch((e) => {
      log.fatal(e);
    });
});

module.exports.treat = (packet, socket) => {
  let pdu = '';

  try {
    pdu = JSON.parse(packet.toString());
    factory.validate(pdu);
  } catch (e) {
    return log.fatal(e);
  }

  const filter = { address: socket.remoteAddress, port: socket.remotePort };

  return Worker
    .findOne(filter)
    .then((worker) => {
      if (!worker) {
        throw String('Worker not found');
      }

      chooseHandler(pdu, worker);
    })
    .catch((e) => {
      log.fatal(e);
    });
};

function chooseHandler(pdu, worker) {
  switch (pdu.header.id) {
    case factory.Id.REPORT:
      reportHandler.execute(pdu, worker);
      break;

    case factory.Id.PERFORM_TASK_RESPONSE:
      performTaskResponseHandler.execute(pdu, worker);
      break;

    case factory.Id.TASK_RESULT:
      taskResultHandler.execute(pdu, worker);
      break;

    case factory.Id.TERMINATE_TASK_RESPONSE:
      terminateTaskResponseHandler.execute(pdu, worker);
      break;

    case factory.Id.GET_LANGUAGE_COMMAND:
      languageHandler.getCommands(pdu, worker);
      break;

    default:
  }
}
