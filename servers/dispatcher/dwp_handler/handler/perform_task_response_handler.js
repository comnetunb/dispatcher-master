/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const terminateTask = protocolRequire('dwp/pdu/terminate_task')
const ReturnCode = protocolRequire('dwp/pdu/perform_task_response').ReturnCode
const log = rootRequire('servers/shared/log')
const connectionManager = rootRequire('servers/dispatcher/connection_manager')

module.exports.execute = function (pdu, worker) {

  if (pdu.code === ReturnCode.EXECUTING) {
    SimulationInstance
      .findById(pdu.taskId)
      .then(function (simulationInstance) {
        if (!simulationInstance) {
          throw 'Simulation instance not found'
        }

        if (simulationInstance._worker) {
          // There is already a worker executing it
          connectionManager.send(worker._id, terminateTask.format({ taskId: pdu.taskId }))
          return false
        }

        simulationInstance._worker = worker._id
        simulationInstance.save()
        return true
      }).then(function (needsToUpdate) {
        if (needsToUpdate) {
          worker.updateRunningInstances()
        }
      }).catch(function (e) {
        log.fatal(e)
      })
  } else if (pdu.code === ReturnCode.DENIED) {
    log.warn('Simulation instance was denied by worker ' + worker.address + ':' + worker.port)
  } else {
    log.fatal('Unknown return code ' + pdu.code)
  }
}
