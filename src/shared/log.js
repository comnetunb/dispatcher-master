/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const log4js = require('log4js');

const Log = databaseRequire('models/log');

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'log/log.log' }
  },
  categories: {
    default: { appenders: ['out', 'app'], level: 'debug' }
  }
});

const logger = log4js.getLogger();

module.exports.getAll = () => {
  const logFilter = { session: Log.SessionId };

  return Log.find(logFilter).sort({ date: -1 });
};

module.exports.getAllFromDate = (date) => {
  const logFilter = {
    session: Log.SessionId,
    date: {
      $gt: date
    }
  };

  return Log.find(logFilter).sort({ date: -1 });
};

module.exports.trace = (message) => {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Trace });

  log.save();

  logger.trace(message);
};

module.exports.debug = (message) => {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Debug });

  log.save();

  logger.debug(message);
};

module.exports.info = (message) => {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Info });

  log.save();

  logger.info(message);
};

module.exports.warn = (message) => {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Warn });

  log.save();

  logger.warn(message);
};

module.exports.error = (message) => {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Error });

  log.save();

  logger.error(message);
};

module.exports.fatal = (message) => {
  const log = new Log({ log: message, date: Date.now(), level: Log.Level.Fatal });

  log.save();

  logger.fatal(message);
};
