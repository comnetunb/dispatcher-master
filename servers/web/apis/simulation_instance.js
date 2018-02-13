////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const EventEmitter = require( 'events' );

const event = new EventEmitter();

module.exports = function ( app ) {

   app.post( '/api/simulation_instance/pause', function ( req, res ) {
      event.emit( 'pause', req.body.address );
   } );

   app.post( '/api/simulation_instance/resume', function ( req, res ) {
      event.emit( 'resume', req.body.address );
   } );

   app.post( '/api/simulation_instance/stop', function ( req, res ) {
      event.emit( 'stop', req.body.address );
   } );
};

module.exports.event = event;