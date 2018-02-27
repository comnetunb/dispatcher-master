/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SimulationGroup = rootRequire('database/models/simulation_group')

const State = {
  Pending: 0,
  Executing: 1,
  Finished: 2,
  Canceled: 3,
  Sent: 4
}

const simulationInstanceSchema = Schema({

  _simulation: {
    type: Schema.ObjectId,
    ref: 'Simulation',
    required: true
  },
  worker: {
    type: String
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

simulationInstanceSchema.statics.State = State

// Active = Pending or Executing
simulationInstanceSchema.statics.countActive = function (simulationId) {
  const condition = {
    _simulation: simulationId,
    $or: [{ state: State.Pending },
    { state: State.Sent },
    { state: State.Executing }]
  }

  return model.count(condition)
}

simulationInstanceSchema.statics.updateToDefaultState = function (simulationInstanceId) {
  const simulationInstancePopulate = {
    path: '_simulation',
    select: '_simulationGroup',
    populate: { path: '_simulationGroup' }
  }

  return model
    .findById(simulationInstanceId)
    .populate(simulationInstancePopulate)
    .then(function (simulationInstance) {
      const simulationGroupState = simulationInstance._simulation._simulationGroup.state

      simulationInstance.worker = undefined
      simulationInstance.startTime = undefined

      if (simulationGroupState === SimulationGroup.State.Executing) {
        simulationInstance.state = State.Pending
      } else {
        simulationInstance.state = State.Canceled
      }

      return simulationInstance.save()
    })
}

simulationInstanceSchema.methods.isPending = function () {
  return this.state === State.Pending
}

simulationInstanceSchema.methods.isSent = function () {
  return this.state === State.Sent
}

simulationInstanceSchema.methods.isExecuting = function () {
  return this.state === State.Executing
}

simulationInstanceSchema.methods.isFinished = function () {
  return this.state === State.Finished
}

simulationInstanceSchema.methods.isCanceled = function () {
  return this.state === State.Canceled
}

simulationInstanceSchema.index({ _simulation: 1, seed: 1, load: 1 }, { unique: true })

const model = mongoose.model('SimulationInstance', simulationInstanceSchema)

module.exports = model
