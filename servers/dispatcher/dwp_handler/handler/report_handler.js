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
    const update = { cpu: pdu.resource.cpu, memory: pdu.resource.memory }
    worker.findByIdAndUpdate(worker._id, update)
      .catch(function (e) {
        log.fatal(e)
      })
  }

  if (pdu.flags & flags.TASKS) {

    Promise.all(pdu.tasks.map(function (task) {
      // Find all Simulation Instances that came in report
      return SimulationInstance.findById(task.id)
    })).then(function (simulationInstances) {
      Promise.all(simulationInstances.map(function (simulationInstance) {
        if (!simulationInstance) {
          return
        }

        if (simulationInstance.isFinished() || simulationInstance.isCanceled()) {
          // If it was canceled or finished, terminate it
          connectionManager.send(worker._id, terminateTask.format({ taskId: simulationInstance.id }))
          return
        }


      })).then(function (simulationInstance) {

      })
    }).catch(function (e) {
      log.fatal(e)
    })
  }

  if (pdu.flags & flags.STATE) {
    const update = { state: pdu.state }
    workerManager.update(workerAddress, update)
  }

  if (pdu.flags & flags.ALIAS) {
    const update = { alias: pdu.alias }
    workerManager.update(workerAddress, update)
  }
}
