/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const binarySchema = Schema({
  _user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: Buffer,
    required: true
  }
})

// binarySchema.idx({ _user: 1, name: 1}, { unique: true });

module.exports = mongoose.model('Binary', binarySchema)
