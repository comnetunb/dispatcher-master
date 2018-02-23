/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const getReport = protocolRequire('dwp/pdu/get_report')
const Flags = protocolRequire('dwp/common').Flags
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const communication = rootRequire('servers/dispatcher/communication')
const worker_discovery = rootRequire('servers/dispatcher/worker_discovery')
const log = rootRequire('servers/shared/log')

module.exports = function () {
  try {
    communication.execute()
    worker_discovery.execute()

    // Routines
    requestResource()
    dispatch()
  } catch (err) {
    log.error(err)
  }
}

function requestResource() {
  setInterval(function () {
    connectionManager.getAll().forEach(function (connection) {
      connection.write(getReport.format({ flags: Flags.RESOURCE }))
    })
  }, config.requestResourceInterval * 1000)
}

function dispatch() {
  setInterval(function () {
    batchDispatch()
  }, config.dispatchInterval * 1000)
}

/**
 * Retrieve number of workers that fit in cpu and memory threshold.
 * With this number (n) in hands, make a top 'n' select of pending simulation instances
 * and dispatch it to all those workers
 */

function batchDispatch() {
  const availableWorkers = Worker.getAvailables(config.cpu.threshold, config.memory.threshold)

  if (!availableWorkers) {
    return
  }

  const simulationInstanceFilter = { state: SimulationInstance.State.Pending }
  const simulationInstancePopulate = {
    path: '_simulation',
    select: '_binary _document _simulationGroup',
    populate: { path: '_binary _document _simulationGroup _simulationGroup.name' },
    options: { sort: { '_simulationGroup.priority': -1 } }
  }

  SimulationInstance.find(simulationInstanceFilter)
    .populate(simulationInstancePopulate)
    .sort({ seed: -1, load: 1 })
    .limit(availableWorkers.length)
    .then(function (simulationInstances) {
      if (!simulationInstances) {
        // No simulations are pending
        return
      }

      return simulationInstances.forEach(function (simulationInstance, idx) {
        simulationInstance.state = SimulationInstance.State.Executing
        simulationInstance.worker = availableWorkers[idx].address
        simulationInstance.startTime = Date.now()

        var promise = simulationInstance.save()

        return promise.then(function (updatedSimulationInstance) {
          const workerAddress = updatedSimulationInstance.worker

          workerManager.update(workerAddress, { cpu: undefined, memory: undefined })

          var worker

          for (var workerInstance in workerPool) {
            if (workerPool[workerInstance].remoteAddress === workerAddress) {
              worker = workerPool[workerInstance]
              break
            }
          }

          const pdu = simulationRequest.format({ Data: updatedSimulationInstance })

          worker.write(pdu)

          const simulationGroupName = simulationInstance._simulation._simulationGroup.name

          log.info('Dispatched simulation instance with load ' + simulationInstance.load + ' from group ' + log.italic(simulationGroupName) + ' to ' + workerAddress)

          updateWorkerRunningInstances(workerAddress)
        })
      })
    }).catch(function (err) {
      log.error(err)
    })
}
