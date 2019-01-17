/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

global.dispatcherRequire = (name) => {
  return require(`${__dirname}/src/server/dispatcher/${name}`);
};

global.apiRequire = (name) => {
  return require(`${__dirname}/src/server/web/api/${name}`);
};

global.webRequire = (name) => {
  return require(`${__dirname}/src/server/web/${name}`);
};

global.sharedRequire = (name) => {
  return require(`${__dirname}/src/shared/${name}`);
};

global.databaseRequire = (name) => {
  return require(`${__dirname}/src/database/${name}`);
};

const dbDriver = databaseRequire('driver');
const dispatcher = dispatcherRequire('index');
const web = webRequire('index');

// Setup Database Driver
dbDriver()
  .then(() => {
    // Initialize dispatcher
    dispatcher();

    web.start();
  })
  .catch((e) => {
    console.log(e); // eslint-disable-line
  });
