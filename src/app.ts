/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */
const globalAny: any = global;

globalAny.rootRequire = (name) => {
  return require(`${__dirname}/${name}`);
};

globalAny.masterRequire = (name) => {
  return require(`${__dirname}/servers/master/${name}`);
};

globalAny.webServerRequire = (name) => {
  return require(`${__dirname}/servers/web/${name}`);
};

globalAny.databaseRequire = (name) => {
  return require(`${__dirname}/database/${name}`);
};

import webServer from './servers/web/service';
import dbDriver from './database/db_driver';
import master from './servers/master/master';
import logger from './servers/shared/log';

// Setup Database Driver
dbDriver()
  .then(() => {
    // Initialize master
    master();

    // Initialize WEB Server
    webServer();
  })
  .catch((e) => {
    logger.error(e);
  });

