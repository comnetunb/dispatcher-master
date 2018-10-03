/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const { SlaveState } = protocolRequire('dwp/common'); // eslint-disable-line no-undef

const Task = rootRequire('database/models/task'); // eslint-disable-line no-undef

const State = {
  EXECUTING: SlaveState.EXECUTING,
  PAUSED: SlaveState.PAUSED
};

const slaveSchema = Schema({
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
});

slaveSchema.statics.getAvailables = function (cpuThreshold, memoryThreshold) { // eslint-disable-line
  const filter = {
    'resource.outdated': false,
    'resource.cpu': { $gt: cpuThreshold },
    'resource.memory': { $gt: memoryThreshold },
    'state': State.EXECUTING // eslint-disable-line quote-props
  };

  return this
    .find(filter)
    .then((availableSlaves) => {
      return availableSlaves;
    });
};

slaveSchema.statics.State = State;

slaveSchema.methods.updateRunningInstances = function () { // eslint-disable-line func-names
  const slave = this;
  return Task
    .count({ slave: slave.uuid })
    .then((count) => {
      slave.runningInstances = count;
      return slave.save();
    });
};

slaveSchema.index({ address: 1, port: 1 }, { unique: true });

const model = mongoose.model('slave', slaveSchema);

module.exports = model;
