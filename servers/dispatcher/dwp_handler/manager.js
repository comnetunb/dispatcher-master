
const communicationEvent = rootRequire('servers/dispatcher/communication').event
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const log = rootRequire('servers/shared/log')

const factory = protocolRequire('dwp/factory')

const performTaskResponseHandler = protocolRequire('dwp/pdu/perform_task_response_handler')
const reportHandler = protocolRequire('dwp/pdu/report_handler')
const taskResultHandler = protocolRequire('dwp/pdu/task_result_handler')
const terminateTaskResponseHandler = protocolRequire('dwp/pdu/terminate_task_response_handler')

const Worker = rootRequire('database/models/worker')

communicationEvent.on('new_connection', function (connection) {

  const filter = { address: connection.remoteAddress, port: connection.remotePort }

  Worker
    .findOne(filter)
    .then(function (worker) {
      if (!worker) {
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

/**
  * Treats a DWP PDU received from a worker
  * @param packet A valid DWP PDU string.
  * @param socket Socket from worker that sent the PDU.
  */

module.exports.treat = function (packet, socket) {

  const pdu = JSON.parse(packet.toString())

  try {
    factory.validate(pdu)
  } catch (err) {
    return log.fatal(err)
  }

  const filter = { address: socket.remoteAddress, port: socket.remotePort }

  Worker
    .findOne(filter)
    .then(function (worker) {
      if (!worker) {
        throw 'worker not found'
      }

      chooseHandler(worker)
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