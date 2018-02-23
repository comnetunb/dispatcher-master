
const communicationEvent = rootRequire('servers/dispatcher/communication').event
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const log = rootRequire('servers/shared/log')

const factory = protocolRequire('dwp/factory')

const performTaskResponseHandler = rootRequire('servers/dispatcher/dwp_handler/handler/perform_task_response_handler')
const reportHandler = rootRequire('servers/dispatcher/dwp_handler/handler/report_handler')
const taskResultHandler = rootRequire('servers/dispatcher/dwp_handler/handler/task_result_handler')
const terminateTaskResponseHandler = rootRequire('servers/dispatcher/dwp_handler/handler/terminate_task_response_handler')

const Worker = rootRequire('database/models/worker')

communicationEvent.on('new_connection', function (connection) {

  const filter = { address: connection.remoteAddress, port: connection.remotePort }

  Worker
    .findOne(filter)
    .then(function (worker) {
      if (!worker) {
        // Worker doesn't exist. Insert it
        const newWorker = new Worker({
          address: socket.remoteAddress,
          port: socket.remotePort
        })
        return newWorker.save()
      }
      return worker
    }).then(function (worker) {
      connection.id = worker._id
      connectionManager.add(connection)
    }).catch(function (e) {
      log.fatal(e)
    })

})

module.exports.treat = function (packet, socket) {

  const pdu = JSON.parse(packet.toString())

  try {
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
    }).catch(function (e) {
      log.fatal(e);
    })
}

function chooseHandler(pdu, worker) {
  switch (pdu.id) {
    case Id.REPORT:
      performTaskResponseHandler.execute(pdu, worker)
      break

    case Id.PERFORM_TASK_RESPONSE:
      reportHandler.execute(pdu, worker)
      break

    case Id.TASK_RESULT:
      taskResultHandler.execute(pdu, worker)
      break

    case Id.TERMINATE_TASK_RESPONSE:
      terminateTaskResponseHandler.execute(pdu, worker)
      break
  }
}