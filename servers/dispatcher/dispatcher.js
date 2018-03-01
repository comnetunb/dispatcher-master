/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

// Dispatcher Related
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const communication = rootRequire('servers/dispatcher/communication')
const worker_discovery = rootRequire('servers/dispatcher/worker_discovery')

// Shared Related
const log = rootRequire('servers/shared/log')
const config = rootRequire('servers/shared/configuration').getConfiguration()
const interfaceManagerEvent = rootRequire('servers/shared/interface_manager').event

// Database Related
const SimulationInstance = rootRequire('database/models/simulation_instance')
const Worker = rootRequire('database/models/worker')

// Protocol Related
const Flags = protocolRequire('dwp/common').Flags
const getReport = protocolRequire('dwp/pdu/get_report')
const performTask = protocolRequire('dwp/pdu/perform_task')
const performCommand = protocolRequire('dwp/pdu/perform_command')

module.exports = function () {
  try {
    cleanUp()
      .then(function () {
        // After cleanUp, start all services
        communication.execute()
        worker_discovery.execute()

        // Routines
        requestResourceRoutine()
        batchDispatchRoutine()
      })
  } catch (err) {
    log.fatal(err)
  }
}

function requestResourceRoutine() {
  requestResource()
  setInterval(function () {
    requestResource()
  }, config.requestResourceInterval * 1000)
}

function requestResource() {
  connectionManager.getAll().forEach(function (connection) {
    connectionManager.send(connection.id, getReport.format({ flags: Flags.RESOURCE }))
  })
}

function batchDispatchRoutine() {
  batchDispatch()
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
  Worker
    .getAvailables(config.cpu.threshold, config.memory.threshold)
    .then(function (availableWorkers) {
      if (!availableWorkers || !availableWorkers.length) {
        return
      }

      const simulationInstanceFilter = { state: SimulationInstance.State.Pending }
      const simulationInstancePopulate = {
        path: '_simulation',
        select: '_binary _document _simulationGroup',
        populate: { path: '_binary _document _simulationGroup _simulationGroup.name' },
        options: { sort: { '_simulationGroup.priority': -1 } }
      }

      SimulationInstance
        .find(simulationInstanceFilter)
        .populate(simulationInstancePopulate)
        .sort({ seed: -1, load: 1 })
        .limit(availableWorkers.length)
        .then(function (simulationInstances) {
          if (!simulationInstances) {
            // No simulations are pending
            return
          }

          simulationInstances
            .forEach(function (simulationInstance, index) {
              simulationInstance.state = SimulationInstance.State.Sent
              simulationInstance.worker = availableWorkers[index].uuid

              return simulationInstance
                .save()
                .then(function () {

                  // <TODO>: Do it in a way to be generic (from user's input)
                  const file = 'java'
                  const arguments = [
                    '-jar',
                    simulationInstance._simulation._binary.name,
                    simulationInstance._simulation._document.name,
                    simulationInstance.seed,
                    simulationInstance.load,
                    simulationInstance.load,
                    1
                  ]

                  const files = [
                    simulationInstance._simulation._binary,
                    simulationInstance._simulation._document
                  ]
                  // </TODO>

                  const pdu = performTask.format({
                    taskId: simulationInstance._id,
                    exec: {
                      file: file,
                      arguments: arguments
                    },
                    files: files
                  })

                  connectionManager.send(availableWorkers[index].uuid, pdu)

                  const simulationGroupName = simulationInstance._simulation._simulationGroup.name
                  log.info('Dispatched simulation instance with load '
                    + simulationInstance.load
                    + ' from group '
                    + log.italic(simulationGroupName)
                    + ' to '
                    + availableWorkers[index].address)

                  // If after X seconds it is still 'Sent', return it to its default state
                  setTimeout(function () {
                    return SimulationInstance
                      .findById(simulationInstance._id)
                      .then(function (simulationInstanceRefreshed) {
                        if (!simulationInstanceRefreshed) {
                          throw 'SimulationInstance not found!'
                        }

                        if (simulationInstanceRefreshed.isSent()) {
                          log.warn('Timeout from worker ' + availableWorkers[index].address + ':' + availableWorkers[index].port)
                          return SimulationInstance.updateToDefaultState(simulationInstanceRefreshed._id)
                        }
                      })
                  }, 10000)
                })
            })
        }).catch(function (err) {
          log.error(err)
        })
    })
}

function cleanUp() {
  // Clean all simulation instances
  const simulationInstanceFilter = {
    $or: [{ state: SimulationInstance.State.Sent },
    { state: SimulationInstance.State.Executing }]
  }

  const simulationInstanceUpdate = {
    state: SimulationInstance.State.Pending,
    $unset: { worker: 1, startTime: 1 }
  }

  var promises = []

  promises.push(SimulationInstance
    .update(simulationInstanceFilter, simulationInstanceUpdate, { multi: true }))

  // Remove all workers since it is the dispatcher startup
  promises.push(Worker
    .remove({}))

  return Promise.all(promises)
}

// TODO: use uuid instead of address
interfaceManagerEvent.on('worker_command', function (address, command) {
  const workerFilter = { address: address }

  Worker
    .findOne(workerFilter)
    .then(function (worker) {
      if (!worker) {
        throw 'Worker not found'
      }

      connectionManager.send(worker.uuid, performCommand.format({ command: command }))

      const flags = Flags.STATE | Flags.TASKS

      connectionManager.send(worker.uuid, getReport.format({ flags: flags }))
    }).catch(function (e) {
      log.fatal(e)
    })
})