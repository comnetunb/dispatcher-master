import webServer from "./servers/web/service";
import dbDriver from "./database/db_driver";
import master from "./servers/master/master";
import logger from "./servers/shared/log";

// Setup Database Driver
dbDriver()
  .then(() => {
    // Initialize master
    master();

    // Initialize WEB Server
    webServer();

    return null;
  })
  .catch((e) => {
    logger.error(e);
  });
