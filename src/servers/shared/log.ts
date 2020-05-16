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

const logger = getLogger();

async function createLog(
  message: string,
  level: LogLevel,
  taskId?: string
): Promise<ILog> {
  const log = new Log({
    log: message,
    date: Date.now(),
    level: level,
    taskId,
  });
  await log.save();
  return log;
}

export async function trace(message: any, taskId?: string): Promise<void> {
  logger.trace(message);
  await createLog(message, LogLevel.Trace, taskId);
}

export async function debug(message: any, taskId?: string): Promise<void> {
  logger.debug(message);
  await createLog(message, LogLevel.Debug, taskId);
}

export async function info(message: any, taskId?: string): Promise<void> {
  logger.info(message);
  await createLog(message, LogLevel.Info, taskId);
}

export async function warn(message: any, taskId?: string): Promise<void> {
  logger.warn(message);
  await createLog(message, LogLevel.Warn, taskId);
}

export async function error(message: any, taskId?: string): Promise<void> {
  logger.error(message);
  await createLog(message, LogLevel.Error, taskId);
}

export async function fatal(message: any, taskId?: string): Promise<void> {
  logger.fatal(message);
  await createLog(message, LogLevel.Fatal, taskId);
}

export default { trace, debug, info, warn, error, fatal };
