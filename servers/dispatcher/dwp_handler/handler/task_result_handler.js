
const ReturnCode = protocolRequire('dwp/pdu/task_result').ReturnCode
const SimulationInstance = rootRequire('database/models/simulation_instance')
const Simulation = rootRequire('database/models/simulation')
const SimulationGroup = rootRequire('database/models/simulation_group')
const mailer = rootRequire('servers/shared/mailer')

module.exports.execute = function (pdu, worker) {
  if (pdu.code === ReturnCode.SUCCESS) {
    // Succeded
    try {
      JSON.parse(pdu.output)
    } catch (err) {
      log.error(err + '\nJSON: ' + pdu.output)
    }

    var simulationInstanceUpdate = {
      result: pdu.output,
      state: SimulationInstance.State.Finished,
      endTime: Date.now(),
      $unset: { '_worker': 1 }
    }

    SimulationInstance
      .findByIdAndUpdate(pdu.task.id, simulationInstanceUpdate, { new: true })
      .then(function (simulationInstance) {
        log.info('Worker ' + worker.address + ':' + worker.port + ' has finished simulation instance ' + simulationInstance._id)

        verifyCascadeConclusion(simulationInstance._simulation)

      }).catch(function (e) {
        log.fatal(e)
      })

  } else {
    // Failed
    log.error(pdu.task.id + ' executed with failure: ' + pdu.output)

    SimulationInstance
      .updateToSafeState(pdu.task.id)
      .then(function () {
        worker.updateRunningInstances()
      }).catch(function (e) {
        log.fatal(e)
      })

    updateSimulationInstanceById(object.SimulationId, function () {
      updateWorkerRunningInstances(worker.remoteAddress)
    })
  }
}

function verifyCascadeConclusion(simulationGroupId) {
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
        throw 'An error occurred while updating simulation'
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
    })
}

function finishSimulationGroup(simulationGroupId) {
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

function sendSimulationGroupConclusionEmail(simulationGroup) {
  var elapsedTime = new Date(simulationGroup.endTime - simulationGroup.startTime)

  var hh = elapsedTime.getUTCHours()
  var mm = elapsedTime.getUTCMinutes()
  var ss = elapsedTime.getSeconds()

  var dd = elapsedTime.getUTCDay()

  if (hh < 10) { hh = '0' + hh }
  if (mm < 10) { mm = '0' + mm }
  if (ss < 10) { ss = '0' + ss }

  // This formats your string to DD HH:MM:SS
  var t = dd + ' ' + hh + ':' + mm + ':' + ss

  const to = simulationGroup._user.email
  const subject = 'Simulation Group "' + simulationGroup.name + '" has finished'
  const text =
    'Start time: ' + simulationGroup.startTime +
    '\nEnd time: ' + endTime +
    '\nElapsed time: ' + t +
    '\nPriority: ' + simulationGroup.priority +
    '\nSeed amount: ' + simulationGroup.seedAmount +
    '\nMinimum load: ' + simulationGroup.load.minimum +
    '\nMaximum load: ' + simulationGroup.load.maximum +
    '\nStep: ' + simulationGroup.load.step

  mailer.sendMail(to, subject, text)
}