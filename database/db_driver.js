/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const mongoose = require('mongoose')
const log4js = require('log4js')

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'log/db_driver.log' }
  },
  categories: {
    default: { appenders: ['out', 'app'], level: 'debug' }
  }
})

const logger = log4js.getLogger()

module.exports = function (mongoUrl, mongoOptions) {
  mongoose.Promise = require('bluebird')
  mongoose.connect(mongoUrl, mongoOptions)

  var connection = mongoose.connection

  connection.on('error', function (err) {
    throw err
  })
}
