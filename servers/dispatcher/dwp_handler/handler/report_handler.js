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
    worker.resource.outdated = false
    worker.resource.cpu = pdu.resource.cpu
    worker.resource.memory = pdu.resource.memory
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
            connectionManager.send(worker.uuid, terminateTask.format({ taskId: task.id }))
            return
          }

          if (simulationInstance.worker) {
            // There is a worker executing this instance already
            if (simulationInstance.startTime < task.startTime) {
              // Evaluating by the time they started, the 'older' worker will finish faster
              connectionManager.send(worker.uuid, terminateTask.format({ taskId: task.id }))
              return
            }

            // Evaluating by the time they started, the 'newer' worker will finish faster
            connectionManager.send(simulationInstance.worker, terminateTask.format({ taskId: task.id }))
          }

          // Associate this instance to this worker
          simulationInstance.worker = worker.uuid
          return simulationInstance
            .save()
        })
    })).then(function () {
      const simulationInstanceFilter = { worker: worker.uuid }

      return SimulationInstance
        .find(simulationInstanceFilter)
        .then(function (simulationInstances) {
          if (simulationInstances === null) {
            return
          }

          return Promise.all(simulationInstances
            .map(function (simulationInstance) {
              for (const task in pdu.tasks) {
                if (pdu.tasks[task].id === simulationInstance._id) {
                  return;
                }
              }

              return SimulationInstance.updateToDefaultState(simulationInstance._id)
            }))
        })
    }).then(function () {
      worker.updateRunningInstances()
    }).catch(function (e) {
      log.fatal(e)
    })
  }

  if (pdu.flags & flags.STATE) {
    worker.state = pdu.state
  }

  if (pdu.flags & flags.ALIAS) {
    worker.alias = pdu.alias
  }

  worker
    .save()
    .catch(function (err) {
      log.fatal(err)
    })
}
