/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

global.rootRequire = (name) => {
  return require(`${__dirname}/${name}`);
};

global.masterRequire = (name) => {
  return require(`${__dirname}/servers/master/${name}`);
};

global.webServerRequire = (name) => {
  return require(`${__dirname}/servers/web/${name}`);
};

global.databaseRequire = (name) => {
  return require(`${__dirname}/database/${name}`);
};

// const webServer = rootRequire('servers/web/service'); // eslint-disable-line
const dbDriver = rootRequire('database/db_driver'); // eslint-disable-line
const master = rootRequire('servers/master/master'); // eslint-disable-line
const api = rootRequire('api/api');

// Setup Database Driver
dbDriver()
  .then(() => {
    // Initialize master
    master();

    // Initialize WEB Server
    // webServer();

    api();
  })
  .catch((e) => {
    console.log(e); // eslint-disable-line
  });

