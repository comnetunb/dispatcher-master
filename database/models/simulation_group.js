/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const State = {
  Executing: 0,
  Finished: 1,
  Canceled: 2
}

const Priority = {
  Minimum: 0,
  Low: 1,
  Normal: 2,
  High: 3,
  Urgent: 4
}

const simulationGroupSchema = Schema({

  _user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  seedAmount: {
    type: Number,
    required: true
  },
  load: {
    minimum: Number,
    maximum: Number,
    step: Number
  },
  priority: {
    type: Number,
    default: Priority.Minimum
  },
  state: {
    type: Number,
    default: State.Executing
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  estimatedEndTime: {
    type: Date
  }

})

simulationGroupSchema.statics.State = State

module.exports = mongoose.model('SimulationGroup', simulationGroupSchema)
