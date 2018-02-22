/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const Log = rootRequire('database/models/log')

const traceback = require('traceback');

module.exports.getAllLogs = function () {
  const logFilter = { 'session': Log.SessionId }

  return Log.find(logFilter).limit(500).sort({ date: -1 }).exec()
}

module.exports.trace = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Trace })

  log.save()
}

module.exports.debug = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Debug })

  log.save()
}

module.exports.info = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Info })

  log.save()
}

module.exports.warn = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Warn })

  log.save()
}

module.exports.error = function (message) {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Error })

  log.save()
}

module.exports.fatal = function (message) {
  const tb = traceback()[1];

  message = bold('[ ' + tb.file + ' - ' + tb.method + ':' + tb.line + ' ] ') + message

  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Fatal })

  log.save()
}

module.exports.bold = function bold(text) {
  return tag(text, 'b')
}

module.exports.italic = function italic(text) {
  return tag(text, 'i')
}

function tag (text, attribute) {
  return '<' + attribute + '>' + text + '</' + attribute + '>'
}
