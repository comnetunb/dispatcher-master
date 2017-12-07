////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

var fs = require( 'fs' );

var configuration = {};

load();

module.exports.getConfiguration = function () {

   if ( Object.keys( configuration ).length === 0 ) {
      load();
   }

   return configuration;
}

function load() {

   try {
      configuration = JSON.parse( fs.readFileSync( __dirname + '/../config/config.json', 'utf8' ).replace( /^\uFEFF/, '' ) );
   } catch ( err ) {

   }

   treatDefaultValues();
}

function treatDefaultValues() {

   if ( configuration.cpu === undefined ) {
      configuration.cpu = {};
   }

   if ( configuration.memory === undefined ) {
      configuration.memory = {};
   }

   if ( configuration.workerPerformance === undefined ) {
      configuration.workerPerformance = {};
   }

   if ( configuration.transporter === undefined ) {
      configuration.transporter = {};
      configuration.transporter.auth = {};
   }

   // Prevent user's stupidity
   if ( configuration.cpu.threshold === undefined || typeof configuration.cpu.threshold === 'string' ) {
      configuration.cpu.threshold = 0.5;
   } else if ( configuration.cpu.threshold > 1 ) {
      configuration.cpu.threshold = 1;
   } else if ( configuration.cpu.threshold < 0 ) {
      configuration.cpu.threshold = 0;
   }

   if ( configuration.memory.threshold === undefined || typeof configuration.memory.threshold === 'string' ) {
      configuration.memory.threshold = 0.5;
   } else if ( configuration.memory.threshold > 1 ) {
      configuration.memory.threshold = 1;
   } else if ( configuration.memory.threshold < 0 ) {
      configuration.memory.threshold = 0;
   }

   if ( configuration.workerPerformance.threshold === undefined || typeof configuration.workerPerformance.threshold === 'string' ) {
      configuration.workerPerformance.threshold = 0.25;
   } else if ( configuration.workerPerformance.threshold > 1 ) {
      configuration.workerPerformance.threshold = 1;
   } else if ( configuration.workerPerformance.threshold < 0 ) {
      configuration.workerPerformance.threshold = 0;
   }

   if ( configuration.requestResourceInterval === undefined || typeof configuration.requestResourceInterval === 'string' ) {
      configuration.requestResourceInterval = 1;
   } else if ( configuration.requestResourceInterval < 1 ) {
      configuration.requestResourceInterval = 1;
   }

   if ( configuration.dispatchInterval === undefined || typeof configuration.dispatchInterval === 'string' ) {
      configuration.dispatchInterval = 3;
   } else if ( configuration.dispatchInterval < 3 ) {
      configuration.dispatchInterval = 3;
   }
}