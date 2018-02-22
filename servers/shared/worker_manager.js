/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const config = rootRequire('servers/shared/configuration').getConfiguration()
const WorkerState = protocolRequire('dwp/common').WorkerState

var workers = []

module.exports.add = function add (workerAddress) {
  for (var idx = 0; idx < workers.length; ++idx) {
    const worker = workers[idx]

    if (worker.address !== workerAddress) {
      continue
    }

    return
  }

  workers.push({
    address: workerAddress,
    runningInstances: 0,
    state: WorkerState.EXECUTING,
    cpu: undefined,
    memory: undefined,
    lastResource: {
      cpu: undefined,
      memory: undefined
    },
    performance: {
      ratio: undefined,
      level: 'Undefined'
    },
    alias: undefined
  })
}

module.exports.update = function update (workerAddress, update) {
  for (var idx = 0; idx < workers.length; ++idx) {
    var worker = workers[idx]

    if (worker.address !== workerAddress) {
      continue
    }

    for (var key in update) {
      worker[key] = update[key]
    }

    if (worker.cpu !== undefined) {
      worker.lastResource.cpu = worker.cpu
    }

    if (worker.memory !== undefined) {
      worker.lastResource.memory = worker.memory
    }

    break
  }
}

module.exports.get = function get (workerAddress) {
  for (var idx = 0; idx < workers.length; ++idx) {
    const worker = workers[idx]

    if (worker.address !== workerAddress) {
      continue
    }

    return worker
  }

  return null
}

module.exports.getAll = function () {
  var workersSubset = []

  for (var idx = 0; idx < workers.length; ++idx) {
    const worker = workers[idx]

    if (worker.lastResource.cpu === undefined || worker.lastResource.memory === undefined) {
      continue
    }

    workersSubset.push(worker)
  }

  return workersSubset
}

module.exports.getAvailables = function (cpuThreshold, memoryThreshold) {
  var availableWorkers = []

  for (var idx = 0; idx < workers.length; ++idx) {
    const worker = workers[idx]

    if (worker.cpu === undefined || worker.memory === undefined) {
      continue
    }

    if ((worker.cpu >= cpuThreshold) && (worker.memory >= memoryThreshold) && (worker.state === WorkerState.Executing)) {
      availableWorkers.push(worker)
    }
  }

  return availableWorkers
}

module.exports.remove = function remove (workerAddress) {
  for (var idx = 0; idx < workers.length; ++idx) {
    var worker = workers[idx]

    if (worker.address !== workerAddress) {
      continue
    }

    workers.splice(idx, 1)
    break
  }
}
