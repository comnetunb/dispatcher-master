/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

// General Requirements
const uuidv1 = require('uuid/v1')

// Shared Related
const log = rootRequire('servers/shared/log')

// Dispatcher Related
const communicationEvent = rootRequire('servers/dispatcher/communication').event
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const performTaskResponseHandler = rootRequire('servers/dispatcher/dwp_handler/handler/perform_task_response_handler')
const reportHandler = rootRequire('servers/dispatcher/dwp_handler/handler/report_handler')
const taskResultHandler = rootRequire('servers/dispatcher/dwp_handler/handler/task_result_handler')
const terminateTaskResponseHandler = rootRequire('servers/dispatcher/dwp_handler/handler/terminate_task_response_handler')
const languageHandler = rootRequire('servers/dispatcher/dwp_handler/handler/language_handler')

// Database Related
const Task = rootRequire('database/models/task')
const Worker = rootRequire('database/models/worker')

// Protocol Related
const factory = protocolRequire('dwp/factory')
const Id = protocolRequire('dwp/factory').Id
const Flags = protocolRequire('dwp/common').Flags
const getReport = protocolRequire('dwp/pdu/get_report')

communicationEvent.on('new_connection', function (connection) {
  const worker = new Worker({
    address: connection.remoteAddress,
    port: connection.remotePort,
    uuid: uuidv1()
  })

  worker
    .save()
    .then(function (worker) {
      connectionManager.add(worker.uuid, connection)

      // Ask everything
      const flags = (Flags.RESOURCE | Flags.TASKS | Flags.STATE | Flags.ALIAS)

      connectionManager.send(worker.uuid, getReport.format({ flags: flags }))
    })
    .catch(function (e) {
      log.fatal(e)
    })
})

communicationEvent.on('closed_connection', function (connection) {
  connectionManager.remove(connection.id)

  const taskFilter = { worker: connection.id }

  Task
    .find(taskFilter, '_id')
    .then((taskIds) => {
      taskIds.map((taskId) => {
        return Task.updateToDefaultState(taskId)
      })
    })
    .catch(function (e) {
      log.fatal(e)
    })

  Worker
    .find({ uuid: connection.id })
    .remove()
    .catch(function (e) {
      log.fatal(e)
    })
})

module.exports.treat = function (packet, socket) {
  var pdu = ''

  try {
    pdu = JSON.parse(packet.toString())
    factory.validate(pdu)
  } catch (e) {
    return log.fatal(e)
  }

  const filter = { address: socket.remoteAddress, port: socket.remotePort }

  Worker
    .findOne(filter)
    .then(function (worker) {
      if (!worker) {
        throw 'Worker not found'
      }

      chooseHandler(pdu, worker)
    })
    .catch(function (e) {
      log.fatal(e)
    })
}

function chooseHandler(pdu, worker) {
  switch (pdu.header.id) {
    case Id.REPORT:
      reportHandler.execute(pdu, worker)
      break

    case Id.PERFORM_TASK_RESPONSE:
      performTaskResponseHandler.execute(pdu, worker)
      break

    case Id.TASK_RESULT:
      taskResultHandler.execute(pdu, worker)
      break

    case Id.TERMINATE_TASK_RESPONSE:
      terminateTaskResponseHandler.execute(pdu, worker)
      break

    case Id.GET_LANGUAGE_COMMAND:
      languageHandler.getCommands(pdu, worker)
      break
  }
}
