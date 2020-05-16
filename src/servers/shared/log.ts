import { configure, getLogger } from "log4js";
import Log, { ILog } from "../../database/models/log";
import { LogLevel } from "../../api/enums";

configure({
  appenders: {
    out: { type: "stdout" },
    app: { type: "file", filename: "log/log.log" },
  },
  categories: {
    default: { appenders: ["out", "app"], level: "debug" },
  },
});

const _logger = getLogger();

function saveLog(message: string, level: LogLevel, taskId?: string): void {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: level,
    taskId,
  });
  log.save().catch(() => {});
}

class Logger {
  trace(message: any, taskId?: string): void {
    _logger.trace(message);
    saveLog(message, LogLevel.Trace, taskId);
  }

  debug(message: any, taskId?: string): void {
    _logger.debug(message);
    saveLog(message, LogLevel.Debug, taskId);
  }

  info(message: any, taskId?: string): void {
    _logger.info(message);
    saveLog(message, LogLevel.Info, taskId);
  }

  warn(message: any, taskId?: string): void {
    _logger.warn(message);
    saveLog(message, LogLevel.Warn, taskId);
  }

  error(message: any, taskId?: string): void {
    _logger.error(message);
    saveLog(message, LogLevel.Error, taskId);
  }

  fatal(message: any, taskId?: string): void {
    _logger.fatal(message);
    saveLog(message, LogLevel.Fatal, taskId);
  }
}

export default new Logger();
