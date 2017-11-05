////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const ip = require( 'ip' );
const net = require( 'net' );
const factory = require( '../../../protocol/dwp/factory' );
const mailer = require( '../shared/mailer' );
const EventEmitter = require( 'events' );

const config = require( '../shared/configuration' ).getConfiguration();
const workerManager = require( '../shared/worker_manager' );

// Schemas
const SimulationInstance = require( '../../database/models/simulation_instance' );
const Simulation = require( '../../database/models/simulation' );
const SimulationGroup = require( '../../database/models/simulation_group' );

// Pdus
const resourceRequest = require( '../../../protocol/dwp/pdu/resource_request' );
const simulationRequest = require( '../../../protocol/dwp/pdu/simulation_request' );
const simulationResponse = require( '../../../protocol/dwp/pdu/simulation_response' );
const simulationTerminateRequest = require( '../../../protocol/dwp/pdu/simulation_terminate_request' );

const log = require( '../../database/models/log' );

// TCP socket in which all the dispatcher-workers communication will be accomplished
const server = net.createServer();

// Store workers socket information in this array
var workerPool = [];

var event = new EventEmitter();
module.exports.event = event;

module.exports.execute = function () {

   cleanUp();

   requestResource();

   dispatch();

   server.on( 'connection', ( socket ) => {

      // Creates a buffer for each worker
      var buffer = '';

      // Insert new worker to the pool
      addWorker( socket );

      // Emit to UDP discovery
      event.emit( 'new_worker', socket.remoteAddress );

      log.info( socket.remoteAddress + ':' + socket.remotePort + ' connected' );

      socket.once( 'close', () => {

         removeWorker( socket );

         const simulationInstanceFilter = { worker: socket.remoteAddress };

         var promise = SimulationInstance.find( simulationInstanceFilter, '_id' );

         promise.then( function ( simulationInstances ) {

            simulationInstances.forEach( function ( simulationInstanceId ) {
               updateSimulationInstanceById( simulationInstanceId );
            } );

         } )

            .catch( function ( e ) {
               log.error( e );
            } )

         log.warn( 'Worker ' + socket.remoteAddress + ' left the pool' );

         if ( workerPool.length === 0 ) {
            log.warn( 'There are no workers left' );
            return;
         }
      } );

      socket.on( 'data', ( data ) => {
         // Treat chunk data
         buffer += data;

         var packet;
         try {
            do {
               packet = factory.expose( buffer );
               buffer = factory.remove( buffer );
               treat( packet, socket );
            } while ( buffer.length !== 0 )

         } catch ( e ) {
            return;
         }
      } );

      socket.on( 'error', () => { } );
   } );

   // Open Socket
   server.listen( 16180, '0.0.0.0', () => {
      log.info( 'TCP server listening ' + server.address().address + ':' + server.address().port );
   } );
}

function requestResource() {

   setInterval( function () {

      for ( var idx = 0; idx < workerPool.length; ++idx ) {
         workerPool[idx].write( resourceRequest.format() );
      }

   }, config.requestResourceInterval * 1000 )
}

function dispatch() {

   setInterval( function () {

      batchDispatch();

   }, config.dispatchInterval * 1000 );

}

/**
 * Retrieve number of workers that fit in cpu and memory threshold.
 * With this number (n) in hands, make a top 'n' select of pending simulation instances
 * and dispatch it to all those workers
 */

function batchDispatch() {

   const availableWorkers = workerManager.getAvailables( config.cpu.threshold, config.memory.threshold );

   if ( !availableWorkers.length ) {
      return;
   }

   const simulationInstanceFilter = { 'state': SimulationInstance.State.Pending };
   const simulationInstancePopulate = {
      path: '_simulation',
      select: '_binary _document _simulationGroup',
      populate: { path: '_binary _document _simulationGroup' },
      options: { sort: { '_simulationgroup.priority': -1 } }
   };

   const promise = SimulationInstance.find( simulationInstanceFilter )
      .populate( simulationInstancePopulate )
      .sort( { seed: -1, load: 1 } )
      .limit( availableWorkers.length )
      .exec();

   promise.then( function ( simulationInstances ) {

      if ( simulationInstances === null ) {
         // No simulations are pending
         return;
      }

      return simulationInstances.forEach( function ( simulationInstance, idx ) {

         simulationInstance.set( { 'state': SimulationInstance.State.Executing, 'worker': availableWorkers[idx].address } );

         var promise = simulationInstance.save();

         return promise.then( function ( updatedSimulationInstance ) {

            const workerAddress = updatedSimulationInstance.worker;

            workerManager.update( workerAddress, { cpu: undefined, memory: undefined } );

            var worker;

            for ( var workerInstance in workerPool ) {
               if ( workerPool[workerInstance].remoteAddress === workerAddress ) {
                  worker = workerPool[workerInstance];
                  break;
               }
            }

            const pdu = simulationRequest.format( { Data: updatedSimulationInstance } );

            worker.write( pdu );

            log.info( 'Dispatched simulation to ' + workerAddress );


            updateWorkerRunningInstances( workerAddress );
         } )
      } );
   } )

      .catch( function ( err ) {
         log.error( err );
      } );
}

function addWorker( worker ) {

   workerManager.add( worker.remoteAddress );

   workerPool.push( worker );
}

function removeWorker( worker ) {

   workerManager.remove( worker.remoteAddress );

   const idx = workerPool.indexOf( worker );

   if ( idx > -1 ) {
      workerPool.splice( idx, 1 );
   }
}

function treat( data, socket ) {

   var object = JSON.parse( data.toString() );

   try {
      factory.validate( object );
   } catch ( err ) {
      return log.error( err );
   }

   switch ( object.Id ) {

      case factory.Id.ResourceResponse:

         const update = { cpu: object.cpu, memory: object.memory };

         workerManager.update( socket.remoteAddress, update );

         break;

      case factory.Id.SimulationResponse:

         if ( object.Result === simulationResponse.Result.Success ) {

            const simulationId = object.SimulationId;
            var output = object.Output;

            try {
               output = JSON.parse( output );
               object.Output = JSON.stringify( output );
            } catch ( err ) {
               // If an error occurred, update it to finished anyways
               // No need to keep trying executing this simulation
               log.error( err );
            }

            var promise_i = SimulationInstance.findById( object.SimulationId ).exec();

            promise_i.then( function ( simulationInstance ) {

               if ( simulationInstance === null ) {
                  return;
               }

               updateWorkerRunningInstances( simulationInstance.worker );
            } )

               .catch( function ( err ) {
                  log.error( err );
               } );

            // Update simulationInstance to finished
            var simulationInstanceUpdate = {
               result: object.Output,
               state: SimulationInstance.State.Finished,
               $unset: { 'worker': 1 }
            }

            var promise = SimulationInstance.findByIdAndUpdate( simulationId, simulationInstanceUpdate ).exec();

            promise.then( function ( simulationInstance ) {

               log.info( 'Worker ' + socket.remoteAddress + ' has finished one simulation instance' );

               // Count how many simulationInstances are pending or executing
               const condition = {
                  _simulation: simulationInstance._simulation,
                  $or: [{ state: SimulationInstance.State.Pending },
                  { state: SimulationInstance.State.Executing }]
               }

               var promise = SimulationInstance.count( condition ).exec();

               return promise.then( function ( count ) {

                  // If they are all finished, update simulation to finished too
                  if ( count > 0 ) {
                     return;
                  }

                  const id = simulationInstance._simulation;
                  const simulationUpdate = { state: Simulation.State.Finished };

                  return Simulation.findByIdAndUpdate( id, simulationUpdate )
               } )
            } )

               .then( function ( simulation ) {

                  if ( simulation === undefined ) {
                     return;
                  }

                  // Count how many simulations are executing
                  const condition = {
                     _simulationGroup: simulation._simulationGroup,
                     state: Simulation.State.Executing
                  };

                  var promise = Simulation.count( condition ).exec();

                  return promise.then( function ( count ) {

                     // If they are all finished, update simulationGroup to finished too
                     if ( count > 0 ) {
                        return;
                     }

                     const id = simulation._simulationGroup;
                     const simulationGroupUpdate = { state: SimulationGroup.State.Finished, endTime: Date.now() };

                     var promise = SimulationGroup.findByIdAndUpdate( id, simulationGroupUpdate ).populate( '_user' ).exec();

                     return promise.then( function ( simulationGroup ) {

                        const endTime = new Date( simulationGroupUpdate.endTime );
                        const totalTime = ( endTime - simulationGroup.startTime ) / 1000; // seconds

                        var elapsedTime = new Date( totalTime * 1000 );
                        var hh = elapsedTime.getUTCHours();
                        var mm = elapsedTime.getUTCMinutes();
                        var ss = elapsedTime.getSeconds();

                        var days = elapsedTime.getUTCDay();

                        if ( hh < 10 ) { hh = "0" + hh; }
                        if ( mm < 10 ) { mm = "0" + mm; }
                        if ( ss < 10 ) { ss = "0" + ss; }
                        // This formats your string to HH:MM:SS
                        var t = days + " " + hh + ":" + mm + ":" + ss;

                        const to = simulationGroup._user.email;
                        const subject = 'Simulation Group ' + simulationGroup.name + ' has finished';
                        const text = 'Start time: ' + simulationGroup.startTime +
                           '\nEnd time: ' + endTime +
                           '\nElapsed time: ' + t +
                           '\nPriority: ' + simulationGroup.priority +
                           '\nSeed amount: ' + simulationGroup.seedAmount +
                           '\nMinimum load: ' + simulationGroup.load.minimum +
                           '\nMaximum load: ' + simulationGroup.load.maximum +
                           '\nStep: ' + simulationGroup.load.step;

                        mailer.sendMail( to, subject, text );
                     } );
                  } );
               } )

               // Treat all errors
               .catch( function ( err ) {
                  log.error( err );
               } );

         } else {

            log.error( object.SimulationId + ' executed with Failure ' + object.ErrorMessage );

            updateSimulationInstanceById( object.SimulationId, function () {
               updateWorkerRunningInstances( socket.remoteAddress )
            } );
         }

         break;

      default:
         return log.error( 'Invalid message received from ' + socket.remoteAddress );
   }
}

function updateWorkerRunningInstances( workerAddress ) {

   var promise = SimulationInstance.count( { worker: workerAddress } ).exec();

   promise.then( function ( count ) {
      workerManager.update( workerAddress, { runningInstances: count } );
   } )

      // Treat all errors
      .catch( function ( err ) {
         log.error( err );
      } );
}

/**
 * Treats scenarios where SimulationGroup was canceled but this
 * simulationInstance was running on a worker that left the pool
 * or an error occurred meanwhile
 */

function updateSimulationInstanceById( simulationInstanceId, callback ) {

   const simulationInstancePopulate = {
      path: '_simulation',
      select: '_simulationGroup',
      populate: { path: '_simulationGroup' }
   };

   var promise = SimulationInstance.findById( simulationInstanceId ).populate( simulationInstancePopulate );

   promise.then( function ( simulationInstance ) {

      const simulationGroupState = simulationInstance._simulation._simulationGroup.state;

      simulationInstance.worker = undefined;

      if ( simulationGroupState === SimulationGroup.State.Executing ) {
         simulationInstance.state = SimulationInstance.State.Pending;
      } else {
         simulationInstance.state = SimulationInstance.State.Canceled;
      }

      simulationInstance.save( callback );
   } )

      .catch( function ( e ) {
         log.error( e );
      } );

}

function cleanUp() {

   // Clean all simulations that were executing when dispatcher died
   const simulationInstanceFilter = { state: SimulationInstance.State.Executing };
   const simulationInstanceUpdate = { state: SimulationInstance.State.Pending, $unset: { worker: 1 } };

   var promise = SimulationInstance.update( simulationInstanceFilter, simulationInstanceUpdate, { multi: true } ).exec();

   // Treat all errors
   promise.catch( function ( err ) {
      log.error( err );
   } );
}