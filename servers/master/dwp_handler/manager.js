/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

// General Requirements
const uuidv1 = require('uuid/v1');

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
const Slave = rootRequire('database/models/slave');

// Protocol Related
const factory = protocolRequire('dwp/factory');
const { Id } = protocolRequire('dwp/factory');
const { Flags } = protocolRequire('dwp/common');
const getReport = protocolRequire('dwp/pdu/get_report');

communicationEvent.on('new_connection', (connection) => {
  const slave = new Slave({
    address: connection.remoteAddress,
    port: connection.remotePort,
    uuid: uuidv1()
  });

  slave
    .save()
    .then((newSlave) => {
      connectionManager.add(newSlave.uuid, connection);

      // Ask everything
      const flags = (Flags.RESOURCE | Flags.TASKS | Flags.STATE | Flags.ALIAS);

      connectionManager.send(newSlave.uuid, getReport.format({ flags }));
    })
    .catch((e) => {
      log.fatal(e);
    });
});

communicationEvent.on('closed_connection', (connection) => {
  connectionManager.remove(connection.id);

  const taskFilter = { slave: connection.id };

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

  Slave
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

  return Slave
    .findOne(filter)
    .then((slave) => {
      if (!slave) {
        throw String('Slave not found');
      }

      chooseHandler(pdu, slave);
    })
    .catch((e) => {
      log.fatal(e);
    });
};

function chooseHandler(pdu, slave) {
  switch (pdu.header.id) {
    case Id.REPORT:
      reportHandler.execute(pdu, slave);
      break;

    case Id.PERFORM_TASK_RESPONSE:
      performTaskResponseHandler.execute(pdu, slave);
      break;

    case Id.TASK_RESULT:
      taskResultHandler.execute(pdu, slave);
      break;

    case Id.TERMINATE_TASK_RESPONSE:
      terminateTaskResponseHandler.execute(pdu, slave);
      break;

    case Id.GET_LANGUAGE_COMMAND:
      languageHandler.getCommands(pdu, slave);
      break;

    default:
  }
}
