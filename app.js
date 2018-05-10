/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

global.rootRequire = function (name) {
  return require(__dirname + '/' + name)
}

global.protocolRequire = function (name) {
  return require(__dirname + '/../protocol/' + name)
}

global.dispatcherRequire = function (name) {
  return require(__dirname + '/servers/dispatcher/' + name)
}

global.webServerRequire = function (name) {
  return require(__dirname + '/servers/web/' + name)
}

global.databaseRequire = function (name) {
  return require(__dirname + '/database/' + name)
}

const webServer = rootRequire('servers/web/service')
const dbDriver = rootRequire('database/db_driver')
const dispatcher = rootRequire('servers/dispatcher/dispatcher')

// Setup Database Driver
dbDriver()
  .then(function () {
    // Initialize dispatcher
    dispatcher()

    // Initialize WEB Server
    webServer()
  })
  .catch(function (e) {
    console.log(e)
  })
