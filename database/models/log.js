////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const Level = {
   Trace: 0,
   Debug: 1,
   Info: 2,
   Warn: 3,
   Error: 4,
   Fatal: 5
}

const sessionId = mongoose.Types.ObjectId();

module.exports.sessionId = sessionId;

const logSchema = Schema( {

   log: {
      type: String,
      required: true
   },
   date: {
      type: Date,
      required: true
   },
   level: {
      type: Number,
      required: true
   },
   session: {
      type: Schema.Types.ObjectId,
      default: sessionId
   }

} );

const Log = mongoose.model( 'Log', logSchema );

module.exports.getAllLogs = function () {

   const logFilter = { 'session': sessionId };

   return Log.find( logFilter ).limit( 500 ).sort( { date: -1 } ).exec();
}

module.exports.trace = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Level.Trace } );

   log.save();
}

module.exports.debug = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Level.Debug } );

   log.save();

}

module.exports.info = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Level.Info } );

   log.save();
}

module.exports.warn = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Level.Warn } );

   log.save();
}

module.exports.error = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Level.Error } );

   log.save();
}

module.exports.fatal = function ( message ) {

   const log = new Log( { log: message, date: Date.now(), level: Level.Fatal } );

   log.save();
}