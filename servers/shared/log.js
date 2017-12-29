////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const Log = rootRequire( 'database/models/log' );

module.exports.getAllLogs = function () {

   const logFilter = { 'session': Log.SessionId };

   return Log.find( logFilter ).limit( 500 ).sort( { date: -1 } ).exec();
}

module.exports.trace = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Log.Level.Trace } );

   log.save();
}

module.exports.debug = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Log.Level.Debug } );

   log.save();

}

module.exports.info = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Log.Level.Info } );

   log.save();
}

module.exports.warn = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Log.Level.Warn } );

   log.save();
}

module.exports.error = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Log.Level.Error } );

   log.save();
}

module.exports.fatal = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Log.Level.Fatal } );

   log.save();
}