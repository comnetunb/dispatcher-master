/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const connectionManager = rootRequire('servers/dispatcher/connection_manager')

const SimulationInstance = rootRequire('database/models/simulation_instance')
const Simulation = rootRequire('database/models/simulation')
const SimulationGroup = rootRequire('database/models/simulation_group')

const log = rootRequire('servers/shared/log')

const flags = protocolRequire('dwp/common').Flags
const terminateTask = protocolRequire('dwp/pdu/terminate_task')

module.exports.execute = function (pdu, worker) {

  if (pdu.flags & flags.RESOURCE) {
    worker.cpu = pdu.resource.cpu
    worker.memory = pdu.resource.memory
    worker.save()
  }

  if (pdu.flags & flags.TASKS) {

    Promise.all(pdu.tasks.map(function (task) {
      // Go through all tasks
      return SimulationInstance
        .findById(task.id)
        .then(function (simulationInstance) {
          if (!simulationInstance) {
            return
          }

          if (simulationInstance.isFinished() || simulationInstance.isCanceled()) {
            // It was canceled or finished. Terminate it
            connectionManager.send(worker._id, terminateTask.format({ taskId: task.id }))
            return
          }

          if (simulationInstance._worker) {
            // There is a worker executing this instance already
            if (simulationInstance.startTime < task.startTime) {
              // Evaluating by the time they started, the 'older' worker will finish faster
              connectionManager.send(worker._id, terminateTask.format({ taskId: task.id }))
              return
            }

            // Evaluating by the time they started, the 'newer' worker will finish faster
            connectionManager.send(simulationInstance._worker, terminateTask.format({ taskId: task.id }))
          }

          // Associate this instance to this worker
          simulationInstance._worker = worker._id
          simulationInstance.save()
        })
    })).then(function () {
      // When all instances were set, update worker running instances
      worker.updateRunningInstances()
    }).catch(function (e) {
      log.fatal(e)
    })
  }

  if (pdu.flags & flags.STATE) {
    worker.state = pdu.state
    worker.save()
  }

  if (pdu.flags & flags.ALIAS) {
    worker.alias = pdu.alias
    worker.save()
  }
}
