/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const Level = {
  Trace: 0,
  Debug: 1,
  Info: 2,
  Warn: 3,
  Error: 4,
  Fatal: 5
};

const SessionId = mongoose.Types.ObjectId();

const logSchema = Schema({
  log: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  taskId: {
    type: Schema.ObjectId,
    ref: 'Task',
  },
  session: {
    type: Schema.Types.ObjectId,
    default: SessionId
  }
});

logSchema.statics.Level = Level;
logSchema.statics.SessionId = SessionId;

module.exports = mongoose.model('Log', logSchema);
