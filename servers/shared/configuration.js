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


   if ( configuration.cpu.weight === undefined || typeof configuration.cpu.weight === 'string' ) {
      configuration.cpu.weight = 1;
   } else if ( configuration.cpu.weight < 0 ) {
      configuration.cpu.weight = 1;
   }

   if ( configuration.memory.threshold === undefined || typeof configuration.memory.threshold === 'string' ) {
      configuration.memory.threshold = 0.5;
   } else if ( configuration.memory.threshold > 1 ) {
      configuration.memory.threshold = 1;
   } else if ( configuration.memory.threshold < 0 ) {
      configuration.memory.threshold = 0;
   }

   if ( configuration.memory.weight === undefined || typeof configuration.memory.weight === 'string' ) {
      configuration.memory.weight = 1;
   } else if ( configuration.memory.weight < 0 ) {
      configuration.memory.weight = 1;
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