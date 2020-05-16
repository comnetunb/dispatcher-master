import { IFile } from "../../database/models/file";
import fs from "fs";
import logger from "./log";

interface CacheValue {
  content: string;
  timeout: NodeJS.Timeout;
}

interface ContentCache {
  [key: string]: CacheValue;
}

const _ttl = 2000;
const _cache: ContentCache = {};

const refreshCache = (key: string) => {
  const value = _cache[key];

  clearTimeout(value.timeout);
  value.timeout = expiredTimeout(key);
};

const expiredTimeout = (key: string): NodeJS.Timeout => {
  return setTimeout(() => {
    logger.debug(`Cache for file ${key} has expired`);
    delete _cache[key];
  }, _ttl);
};

const setCache = (key: string, content: string) => {
  _cache[key] = {
    content,
    timeout: expiredTimeout(key),
  };
};

export const loadFile = (file: IFile): string => {
  const id = file._id;

  if (id in _cache) {
    refreshCache(id);
    return _cache[id].content;
  }

  logger.debug(
    `Loading file ${file.name} from path ${file.path} because it has not been cached under key ${id}`
  );

  const content = fs.readFileSync(file.path, { encoding: "base64" });
  setCache(id, content);
  return content;
};
