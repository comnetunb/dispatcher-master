/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

module.exports = function (pdu, workerAddress) {
  if (pdu.result === simulationResponse.Result.Success) {
    const simulationInstanceId = pdu.simulationInstanceId
    var output = pdu.output

    try {
      output = JSON.parse(output)
      pdu.output = JSON.stringify(output)
    } catch (err) {
         // If an error occurred, update it to finished anyways
         // No need to keep trying executing this simulation
      log.error(err + '\nJSON:' + JSON.stringify(output))
    }

      // Update simulationInstance to finished
    var simulationInstanceUpdate = {
      result: pdu.output,
      state: SimulationInstance.State.Finished,
      endTime: Date.now(),
      $unset: { 'worker': 1 }
    }

    var promise = SimulationInstance.findByIdAndUpdate(simulationId, simulationInstanceUpdate, { new: true }).exec()

    promise.then(function (simulationInstance) {
      updateWorkerRunningInstances(workerAddress)

      simulationUtils.updateSimulationInstanceDurationMean(simulationInstance, function (simulation) {
        const duration = simulationInstance.endTime - simulationInstance.startTime
        const workerCur = workerManager.get(workerAddress)

        var ratio = (simulation.instanceDurationMean / duration) - 1

        if (workerCur === {}) {
          return
        }

        if (workerCur.performance.ratio !== undefined) {
          ratio = (ratio + workerCur.performance.ratio) / 2
        }

        var level

        if (ratio > config.workerPerformance.threshold) {
          level = 'Fast'
        } else if (ratio < -config.workerPerformance.threshold) {
          level = 'Slow'
        } else {
          level = 'Medium'
        }

        const workerUpdate = {
          performance: {
            ratio: ratio,
            level: level
          }
        }

        workerManager.update(workerCur.address, workerUpdate)
      })

      Simulation.findById(simulationInstance._simulation).select('_simulationGroup').exec()
            .then(function (simulationGroupId) {
              simulationUtils.estimateSimulationGroupEndTime(simulationGroupId._simulationGroup)
            })

      log.info('Worker ' + worker.remoteAddress + ' has finished one simulation instance')

         // Count how many simulationInstances are pending or executing
      const condition = {
        _simulation: simulationInstance._simulation,
        $or: [{ state: SimulationInstance.State.Pending },
            { state: SimulationInstance.State.Executing }]
      }

      var promise = SimulationInstance.count(condition).exec()

      return promise.then(function (count) {
            // If they are all finished, update simulation to finished too
        if (count > 0) {
          return
        }

        const id = simulationInstance._simulation
        const simulationUpdate = { state: Simulation.State.Finished }

        return Simulation.findByIdAndUpdate(id, simulationUpdate)
      })
    })

         .then(function (simulation) {
           if (simulation === undefined) {
             return
           }

            // Count how many simulations are executing
           const condition = {
             _simulationGroup: simulation._simulationGroup,
             state: Simulation.State.Executing
           }

           var promise = Simulation.count(condition).exec()

           return promise.then(function (count) {
               // If they are all finished, update simulationGroup to finished too
             if (count > 0) {
               return
             }

             const id = simulation._simulationGroup
             const simulationGroupUpdate = { state: SimulationGroup.State.Finished, endTime: Date.now() }

             var promise = SimulationGroup.findByIdAndUpdate(id, simulationGroupUpdate).populate('_user').exec()

             return promise.then(function (simulationGroup) {
               const endTime = new Date(simulationGroupUpdate.endTime)
               const totalTime = (endTime - simulationGroup.startTime) // seconds

               var elapsedTime = new Date(totalTime)
               var hh = elapsedTime.getUTCHours()
               var mm = elapsedTime.getUTCMinutes()
               var ss = elapsedTime.getSeconds()

               var days = elapsedTime.getUTCDay()

               if (hh < 10) { hh = '0' + hh }
               if (mm < 10) { mm = '0' + mm }
               if (ss < 10) { ss = '0' + ss }
                  // This formats your string to HH:MM:SS
               var t = days + ' ' + hh + ':' + mm + ':' + ss

               const to = simulationGroup._user.email
               const subject = 'Simulation Group ' + simulationGroup.name + ' has finished'
               const text = 'Start time: ' + simulationGroup.startTime +
                     '\nEnd time: ' + endTime +
                     '\nElapsed time: ' + t +
                     '\nPriority: ' + simulationGroup.priority +
                     '\nSeed amount: ' + simulationGroup.seedAmount +
                     '\nMinimum load: ' + simulationGroup.load.minimum +
                     '\nMaximum load: ' + simulationGroup.load.maximum +
                     '\nStep: ' + simulationGroup.load.step

               mailer.sendMail(to, subject, text)
             })
           })
         })

         // Treat all errors
         .catch(function (err) {
           log.error(err)
         })
  } else {
    log.error(pdu.SimulationId + ' executed with Failure ' + pdu.ErrorMessage)

    updateSimulationInstanceById(pdu.SimulationId, function () {
      updateWorkerRunningInstances(worker.remoteAddress)
    })
  }
}
