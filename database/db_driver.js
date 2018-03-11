/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')

mongoose.connection.on('error', function (err) {
  throw err
})

const mongoUrl = 'mongodb://localhost/ons'
const mongoOptions = { useMongoClient: true }

module.exports = function () {
  mongoose.Promise = require('bluebird')
  return mongoose.connect(mongoUrl, mongoOptions)
}
