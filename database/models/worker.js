/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const workerSchema = Schema({
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
  }

  _simulation: {
    type: Schema.ObjectId,
    ref: 'Simulation',
    required: true
  },
  state: {
    type: Number,
    default: State.Pending
  },
  seed: {
    type: Number,
    required: true
  },
  load: {
    type: Number,
    required: true
  },
  worker: {
    type: String
  },
  result: {
    type: String
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  }

})

simulationInstanceSchema.index({ address: 1, port: 1 }, { unique: true })

module.exports = mongoose.model('worker', workerSchema)
