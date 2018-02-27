/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WorkerState = protocolRequire('dwp/common').WorkerState

const SimulationInstance = rootRequire('database/models/simulation_instance')

const State = {
  EXECUTING: WorkerState.EXECUTING,
  PAUSED: WorkerState.PAUSED
}

const workerSchema = Schema({

  address: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true
  },
  // Internal id
  uuid: {
    type: String,
    required: true
  },
  runningInstances: {
    type: Number,
    default: 0
  },
  state: {
    type: Number
  },
  resource: {
    outdated: {
      type: Boolean,
      default: true
    },
    cpu: Number,
    memory: Number
  },
  performance: {
    ratio: Number,
    level: {
      type: String,
      default: 'Undefined'
    }
  },
  alias: {
    type: String
  }
})

workerSchema.statics.getAvailables = function (cpuThreshold, memoryThreshold) {
  const filter = {
    'resource.outdated': false,
    'resource.cpu': { $gt: cpuThreshold },
    'resource.memory': { $gt: memoryThreshold },
    'state': State.EXECUTING
  }

  return this
    .find(filter)
    .then(function (availableWorkers) {
      return availableWorkers
    })
}

workerSchema.statics.State = State

workerSchema.methods.updateRunningInstances = function () {
  const worker = this
  return SimulationInstance
    .count({ worker: worker.uuid })
    .then(function (count) {
      worker.runningInstances = count
      return worker.save()
    })
}

workerSchema.index({ address: 1, port: 1 }, { unique: true })

const model = mongoose.model('worker', workerSchema)

module.exports = model
