/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const log4js = require('log4js');

const Log = rootRequire('database/models/log');
const Task = rootRequire('database/models/task');

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

module.exports.getAll = async (taskSetId) => {
  let logFilter;

  if (taskSetId) {
    // get all tasks pertaining to taskSet
    const taskList = await Task.find({ _taskSet: taskSetId }, '_id');
    const taskIds = taskList.map(task => task._id);
    logFilter = { taskId: { $in: taskIds } };
  } else {
    logFilter = { session: Log.SessionId };
  }

  return Log.find(logFilter).sort({ date: -1 });
};

module.exports.getAllFromDate = async (date, taskSetId) => {
  let logFilter;
  if (taskSetId) {
    const taskList = await Task.find({ _taskSet: taskSetId }, '_id');
    const taskIds = taskList.map(task => task._id);
    logFilter = { date: { $gt: date }, taskId: { $in: taskIds } };
  } else {
    logFilter = { date: { $gt: date }, session: Log.SessionId };
  }

  return Log.find(logFilter).sort({ date: -1 });
};

module.exports.trace = (message, taskId) => {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: Log.Level.Trace,
    taskId
  });

  log.save();

  logger.trace(message);
};

module.exports.debug = (message, taskId) => {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: Log.Level.Debug,
    taskId
  });

  log.save();

  logger.debug(message);
};

module.exports.info = (message, taskId) => {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: Log.Level.Info,
    taskId
  });

  log.save();

  logger.info(message);
};

module.exports.warn = (message, taskId) => {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: Log.Level.Warn,
    taskId
  });

  log.save();

  logger.warn(message);
};

module.exports.error = (message, taskId) => {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: Log.Level.Error,
    taskId
  });

  log.save();

  logger.error(message);
};

module.exports.fatal = (message, taskId) => {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: Log.Level.Fatal,
    taskId
  });

  log.save();

  logger.fatal(message);
};
