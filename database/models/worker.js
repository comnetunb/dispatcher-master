/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const SimulationInstance = rootRequire('database/models/simulation_instance')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const workerSchema = Schema({

  address: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true
  },
  runningInstances: {
    type: Number,
    default: 0
  },
  state: {
    type: Number
  },
  lastResource: {
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

const model = mongoose.model('worker', workerSchema)

workerSchema.methods.getAvailables = function (cpuThreshold, memoryThreshold) {
  const filter = { cpu: { $gt: cpuThreshold }, memory: { $gt: memoryThreshold } }

  return model
    .find(filter)
    .then(function (availableWorkers) {
      return availableWorkers
    }).catch(function (e) {

    })
}

workerSchema.methods.updateRunningInstances = function () {
  return SimulationInstance
    .count({ _worker: this._id })
    .then(function (count) {
      this.runningInstances = count
      return this.save
    })
}

workerSchema.index({ address: 1, port: 1 }, { unique: true })

module.exports = model
