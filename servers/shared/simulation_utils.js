/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const SimulationGroup = rootRequire('database/models/simulation_group')
const Simulation = rootRequire('database/models/simulation')
const SimulationInstance = rootRequire('database/models/simulation_instance')
const log = rootRequire('servers/shared/log')

module.exports.estimateSimulationGroupEndTime = function estimateSimulationGroupEndTime (simulationGroupId) {
  const simulationFilter = { _simulationGroup: simulationGroupId }

  var promise = Simulation.find(simulationFilter).select('id').exec()

  promise.then(function (simulationIds) {
    const simulationInstanceFilter = {
      _simulation: { $in: simulationIds },
      state: SimulationInstance.State.Finished,
      startTime: { $exists: true },
      endTime: { $exists: true }
    }

    var promise = SimulationInstance.find(simulationInstanceFilter).select('startTime endTime').sort('startTime').exec()

    promise.then(function (simulationInstancesTime) {
      if (simulationInstancesTime.length < 2) {
            // Can't estimate
        return
      }

      var simulationInstanceDurationMean = 0
      var simulationInstanceDispatchMean = 0

      for (var idx = 1; idx < simulationInstancesTime.length; ++idx) {
        simulationInstanceDurationMean +=
               simulationInstancesTime[idx].endTime.getTime() -
               simulationInstancesTime[idx].startTime.getTime()

        simulationInstanceDispatchMean +=
               simulationInstancesTime[idx].startTime.getTime() -
               simulationInstancesTime[idx - 1].startTime.getTime()
      }

      simulationInstanceDurationMean /= simulationInstancesTime.length
      simulationInstanceDispatchMean /= simulationInstancesTime.length - 1

      const simulationInstanceFilter = {
        _simulation: { $in: simulationIds },
        $or: [{ state: SimulationInstance.State.Pending },
            { state: SimulationInstance.State.Executing }]
      }

      var promise = SimulationInstance.find(simulationInstanceFilter).exec()

      promise.then(function (remainingInstances) {
        var estimatedEndTime = 0

        for (var remainingInstance in remainingInstances) {
          if (remainingInstances[remainingInstance].state == SimulationInstance.State.Pending) {
            estimatedEndTime += simulationInstanceDurationMean + simulationInstanceDispatchMean
            continue
          }

          if (remainingInstances[remainingInstance].startTime === undefined) {
            continue
          }

          estimatedEndTime += simulationInstanceDurationMean - (Date.now() - remainingInstances[remainingInstance].startTime)
        }

        estimatedEndTime = new Date(Date.now() + estimatedEndTime)

        const simulationGroupUpdate = { estimatedEndTime: estimatedEndTime }

        return SimulationGroup.findByIdAndUpdate(simulationGroupId, simulationGroupUpdate).exec()
      })
    })
  })

      .catch(function (err) {
        log.error(err)
      })
}

module.exports.updateSimulationInstanceDurationMean = function (simulationInstance, callback) {
  const simulationInstanceFilter = {
    _simulation: simulationInstance._simulation,
    startTime: { $exists: true },
    endTime: { $exists: true }
  }

  var promise = SimulationInstance.find(simulationInstanceFilter).exec()

  promise.then(function (simulationInstances) {
    var instanceDurationMean = 0

    for (var idx = 0; idx < simulationInstances.length; ++idx) {
      if (simulationInstances.length < 3) {
        return
      }

      instanceDurationMean += simulationInstances[idx].endTime - simulationInstances[idx].startTime
    }

    instanceDurationMean /= simulationInstances.length

    const simulationUpdate = { instanceDurationMean: instanceDurationMean }

    var promise = Simulation.findByIdAndUpdate(simulationInstance._simulation, simulationUpdate, { new: true }).exec()

    promise.then(callback)
  })

      .catch(function (err) {
        log.error(err)
      })
}

/**
* Converts a JavaScript Object Notation (JSON) string into an object.
* @param simulationGroupId Id of the group to be exported.
* @param callback Callback to be called after finishing compressing simulation group.
*/

module.exports.zip = function (simulationGroupId, callback) {
  const promise = Simulation.find({ _simulationGroup: simulationGroupId }).select('_id').exec()

  promise.then(function (simulationIds) {
    if (simulationIds === null) {
      throw 'Simulations not found!'
    }

    const simulationInstanceFilter = { _simulation: { $in: simulationIds }, result: { $ne: null } }
    const simulationInstancePopulate = { path: '_simulation', select: 'name' }

      // All SimulationInstances from this SimulationGroup
    return SimulationInstance.find(simulationInstanceFilter).populate(simulationInstancePopulate).exec()
  }).then(function (simulationInstances) {
    var simulationGroupResults = []

    loop:
      for (var simulationInstance in simulationInstances) {
        const simulationId = simulationInstances[simulationInstance]._simulation._id
        const simulationName = simulationInstances[simulationInstance]._simulation.name
        const simulationInstanceSeed = simulationInstances[simulationInstance].seed
        const simulationInstanceResult = JSON.parse(simulationInstances[simulationInstance].result)

        for (var simulationGroupResult in simulationGroupResults) {
            // Verify if simulation is already in map
          if (simulationGroupResults[simulationGroupResult]._simulation === simulationId) {
               // Simulation is already in map
            for (var resultBySeed in simulationGroupResults[simulationGroupResult].resultsBySeed) {
                  // Iterate over all set of results of this simulation
              if (simulationGroupResults[simulationGroupResult].resultsBySeed[resultBySeed].seed === simulationInstanceSeed) {
                     // Agregate to seed results
                simulationGroupResults[simulationGroupResult].resultsBySeed[resultBySeed].result.push(simulationInstanceResult)
                continue loop
              }
            }

               // New seed
            simulationGroupResults[simulationGroupResult].resultsBySeed.push({ seed: simulationInstanceSeed, result: [simulationInstanceResult] })
            continue loop
          }
        }

         // Push new simulation to the map
        var simulationGroupResult = {}

        simulationGroupResult._simulation = simulationId
        simulationGroupResult.name = simulationName
        simulationGroupResult.resultsBySeed = [{ seed: simulationInstanceSeed, result: [simulationInstanceResult] }]

        simulationGroupResults.push(simulationGroupResult)
      }

      // Ok. Now we have all results organized in a map. Zip it now!

    var dirsToZip = []
    var promises = []

    const tmpDir = __dirname + '/../../temp/'
    for (var simulationGroupResult in simulationGroupResults) {
      const dirName = tmpDir + path.parse(simulationGroupResults[simulationGroupResult].name).name

      dirsToZip.push(dirName)

      const resultsBySeed = simulationGroupResults[simulationGroupResult].resultsBySeed

      for (var resultBySeed in resultsBySeed) {
        const filePath = dirName + '/seed_' + resultsBySeed[resultBySeed].seed + '.csv'

        var promise = new Promise(function (resolve, reject) {
          json2csv.json2csv(resultsBySeed[resultBySeed].result, function (err, csv) {
            if (err) {
              throw err
            } else {
              return writeFile(filePath, csv, function (err) {
                if (err) {
                  throw err
                }

                resolve(filePath)
              })
            }
          })
        })

        promises.push(promise)
      }
    }

    return Promise.all(promises).then(function () {
      var promise = SimulationGroup.findById(simulationGroupId).exec()

      promise.then(function (simulationGroup) {
        const zipPath = tmpDir + simulationGroup.name + '.zip'
        var output = fs.createWriteStream(zipPath)
        var archive = archiver('zip')

        output.on('close', function () {
          res.download(zipPath)

          for (var dirToZip in dirsToZip) {
            rimraf(dirsToZip[dirToZip], (err) => {
              if (err) {
                throw err
              }
            })
          }

          rimraf(zipPath, (err) => {
            if (err) {
              throw err
            }
          })
        })

        archive.on('error', function (err) {
          throw err
        })

        archive.pipe(output)

        for (var dirToZip in dirsToZip) {
          archive.directory(dirsToZip[dirToZip], path.parse(dirsToZip[dirToZip]).name, { date: new Date() })
        }

        archive.finalize()
      })
    })
  }).catch(function (e) {
    log.error(e)
    res.sendStatus(500)
  })
}
