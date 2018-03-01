
// Protocol Related
const ReturnCode = protocolRequire('dwp/pdu/task_result').ReturnCode

// Database Related
const SimulationInstance = rootRequire('database/models/simulation_instance')
const Simulation = rootRequire('database/models/simulation')
const SimulationGroup = rootRequire('database/models/simulation_group')

// Shared Related
const mailer = rootRequire('servers/shared/mailer')
const log = rootRequire('servers/shared/log')

module.exports.execute = function (pdu, worker) {
  if (pdu.code === ReturnCode.SUCCESS) {
    // Succeded
    try {
      JSON.parse(pdu.output)
    } catch (e) {
      log.fatal(e + '\nJSON: ' + pdu.output)
    }

    var simulationInstanceUpdate = {
      result: pdu.output,
      state: SimulationInstance.State.Finished,
      endTime: Date.now(),
      $unset: { worker: 1 }
    }

    SimulationInstance
      .findByIdAndUpdate(pdu.task.id, simulationInstanceUpdate, { new: true })
      .then(function (simulationInstance) {
        log.info('Worker ' + worker.address + ':' + worker.port + ' has finished simulation instance ' + simulationInstance._id)

        return cascadeConclusion(simulationInstance._simulation)
      }).then(function () {
        return worker.updateRunningInstances()
      }).catch(function (e) {
        log.fatal(e)
      })
  } else {
    // Failed
    log.fatal(pdu.task.id + ' executed with failure: ' + pdu.output)

    SimulationInstance
      .updateToDefaultState(pdu.task.id)
      .then(function () {
        return worker.updateRunningInstances()
      }).catch(function (e) {
        log.fatal(e)
      })
  }
}

function cascadeConclusion (simulationGroupId) {
  return SimulationInstance
    .countActive(simulationGroupId)
    .then(function (count) {
      if (count > 0) {
        return null
      }
      // All SimulationInstances are done
      const simulationUpdate = { state: Simulation.State.Finished }

      return Simulation
        .findByIdAndUpdate(simulationGroupId, simulationUpdate)
    }).then(function (simulation) {
      if (!simulation) {
        return
      }

      return Simulation
        .countActive(simulation._simulationGroup)
        .then(function (count) {
          if (count > 0) {
            return null
          }
          // All Simulations are done
          return finishSimulationGroup(simulation._simulationGroup)
        })
    }).catch(function (e) {
      log.fatal(e)
    })
}

function finishSimulationGroup (simulationGroupId) {
  const simulationGroupUpdate = { state: SimulationGroup.State.Finished, endTime: Date.now() }

  return SimulationGroup
    .findByIdAndUpdate(simulationGroupId, simulationGroupUpdate, { new: true })
    .populate('_user')
    .then(function (simulationGroup) {
      sendSimulationGroupConclusionEmail(simulationGroup)
    }).catch(function (e) {
      log.fatal(e)
    })
}

function sendSimulationGroupConclusionEmail (simulationGroup) {
  const to = simulationGroup._user.email
  const subject = 'Simulation group "' + simulationGroup.name + '" has finished'
  const text =
    'Start time: ' + simulationGroup.startTime +
    '\nEnd time: ' + simulationGroup.endTime +
    '\nPriority: ' + simulationGroup.priority +
    '\nSeed amount: ' + simulationGroup.seedAmount +
    '\nMinimum load: ' + simulationGroup.load.minimum +
    '\nMaximum load: ' + simulationGroup.load.maximum +
    '\nStep: ' + simulationGroup.load.step

  mailer.sendMail(to, subject, text)
}
