/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const State = {
  Pending: 0,
  Executing: 1,
  Finished: 2,
  Canceled: 3
}

const simulationInstanceSchema = Schema({

  _simulation: {
    type: Schema.ObjectId,
    ref: 'Simulation',
    required: true
  },
  _worker: {
    type: Schema.ObjectId,
    ref: 'Worker'
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

const model = mongoose.model('SimulationInstance', simulationInstanceSchema)

simulationInstanceSchema.statics.State = State

// Active = Pending or Executing
simulationInstanceSchema.statics.countActive = function (simulationId) {
  const condition = {
    _simulation: simulationId,
    $or: [{ state: SimulationInstance.State.Pending },
    { state: SimulationInstance.State.Executing }]
  }

  return model.count(condition)
}

simulationInstanceSchema.statics.updateToSafeState = function (simulationInstanceId) {
  const simulationInstancePopulate = {
    path: '_simulation',
    select: '_simulationGroup',
    populate: { path: '_simulationGroup' }
  }

  model
    .findById(simulationInstanceId)
    .populate(simulationInstancePopulate)
    .then(function (simulationInstance) {
      const simulationGroupState = simulationInstance._simulation._simulationGroup.state

      simulationInstance.worker = undefined
      simulationInstance.startTime = undefined

      if (simulationGroupState === SimulationGroup.State.Executing) {
        simulationInstance.state = SimulationInstance.State.Pending
      } else {
        simulationInstance.state = SimulationInstance.State.Canceled
      }

      return simulationInstance.save()
    })
}

simulationInstanceSchema.methods.isPending = function () {
  return this.state === State.Pending
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

module.exports = model
