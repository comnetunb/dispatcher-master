////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const config = require( './configuration' ).getConfiguration();

var workers = [];

module.exports.add = function add( workerAddress ) {

   for ( var idx = 0; idx < workers.length; ++idx ) {

      const worker = workers[idx];

      if ( worker.address !== workerAddress ) {
         continue;
      }

      return;
   }

   workers.push( {
      address: workerAddress,
      runningInstances: 0,
      cpu: undefined,
      memory: undefined,
      lastResource: {
         cpu: undefined,
         memory: undefined
      }
   } );
}

module.exports.update = function update( workerAddress, update ) {

   for ( var idx = 0; idx < workers.length; ++idx ) {

      var worker = workers[idx];

      if ( worker.address !== workerAddress ) {
         continue;
      }

      for ( var key in update ) {
         worker[key] = update[key];
      }

      if ( worker.cpu !== undefined ) {
         worker.lastResource.cpu = worker.cpu;
      }

      if ( worker.memory !== undefined ) {
         worker.lastResource.memory = worker.memory;
      }

      break;
   }
}

module.exports.get = function get( workerAddress ) {

   for ( var idx = 0; idx < workers.length; ++idx ) {

      const worker = workers[idx];

      if ( worker.address !== workerAddress ) {
         continue;
      }

      return worker;
   }

   return {};
}

module.exports.getAll = function () {

   var workersSubset = [];

   for ( var idx = 0; idx < workers.length; ++idx ) {

      const worker = workers[idx];

      if ( worker.lastResource.cpu === undefined || worker.lastResource.memory === undefined ) {
         continue;
      }

      workersSubset.push( worker );
   }

   return workersSubset;
}

module.exports.getAvailables = function ( cpuThreshold, memoryThreshold ) {

   var availableWorkers = [];

   for ( var idx = 0; idx < workers.length; ++idx ) {

      const worker = workers[idx];

      if ( worker.cpu === undefined || worker.memory === undefined ) {
         continue;
      }

      // @TODO: Workaround until requestResource has date information in it
      if ( worker.runningInstances > 5 ) {
         continue;
      }

      if ( ( worker.cpu >= cpuThreshold ) && ( worker.memory >= memoryThreshold ) ) {
         availableWorkers.push( worker );
      }
   }

   return availableWorkers;
}

module.exports.remove = function remove( workerAddress ) {

   for ( var idx = 0; idx < workers.length; ++idx ) {

      var worker = workers[idx];

      if ( worker.address !== workerAddress ) {
         continue;
      }

      workers.splice( idx, 1 );
      break;
   }
}