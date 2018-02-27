/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const log4js = require('log4js')
const traceback = require('traceback')

const Log = rootRequire('database/models/log')

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'log/log.log' }
  },
  categories: {
    default: { appenders: ['out', 'app'], level: 'debug' }
  }
})

const logger = log4js.getLogger()

module.exports.getAllLogs = function () {
  const logFilter = { 'session': Log.SessionId }

  return Log.find(logFilter).limit(500).sort({ date: -1 }).exec()
}

module.exports.trace = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Trace })

  log.save()

  logger.trace(message)
}

module.exports.debug = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Debug })

  log.save()

  logger.debug(message)
}

module.exports.info = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Info })

  log.save()

  logger.info(message)
}

module.exports.warn = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Warn })

  log.save()

  logger.warn(message)
}

module.exports.error = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Error })

  log.save()

  logger.error(message)
}

module.exports.fatal = function (message) {
  // const tb = traceback()[1];

  // message = bold('[ ' + tb.file + ' - ' + tb.method + ':' + tb.line + ' ] ') + message

  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Fatal })

  log.save()

  logger.fatal(message)
}

module.exports.bold = function bold (text) {
  return tag(text, 'b')
}

module.exports.italic = function italic (text) {
  return tag(text, 'i')
}

function tag (text, attribute) {
  return '<' + attribute + '>' + text + '</' + attribute + '>'
}
