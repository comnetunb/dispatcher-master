/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bcrypt = require('bcryptjs')

const userSchema = Schema({

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  }

})

const saltRounds = 10

userSchema.statics.encryptPassword = function (password, callback) {
  bcrypt.hash(password, saltRounds, callback)
}

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
