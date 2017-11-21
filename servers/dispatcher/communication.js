////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const ip = require( 'ip' );
const net = require( 'net' );
const EventEmitter = require( 'events' );

const config = rootRequire( 'servers/shared/configuration' ).getConfiguration();
const workerManager = rootRequire( 'servers/shared/worker_manager' );
const simulationUtils = rootRequire( 'servers/shared/simulation_utils' );
const log = rootRequire( 'servers/shared/log' );
const mailer = rootRequire( 'servers/shared/mailer' );

// Schemas
const SimulationInstance = rootRequire( 'database/models/simulation_instance' );
const Simulation = rootRequire( 'database/models/simulation' );
const SimulationGroup = rootRequire( 'database/models/simulation_group' );

// Pdus
const factory = protocolRequire( 'dwp/factory' );
const resourceRequest = protocolRequire( 'dwp/pdu/resource_request' );
const simulationRequest = protocolRequire( 'dwp/pdu/simulation_request' );
const simulationResponse = protocolRequire( 'dwp/pdu/simulation_response' );
const reportRequest = protocolRequire( 'dwp/pdu/report_request' );
const reportResponse = protocolRequire( 'dwp/pdu/report_response' );
const simulationTerminateRequest = protocolRequire( 'dwp/pdu/simulation_terminate_request' );

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

   server.on( 'connection', function ( worker ) {

      // Creates a buffer for each worker
      var buffer = '';

      requestWorkerReport( worker );

      // Emit to UDP discovery in order to clean its cache
      event.emit( 'new_worker', worker.remoteAddress );

      log.info( worker.remoteAddress + ':' + worker.remotePort + ' connected' );

      worker.once( 'close', function () {

         removeWorker( worker );

         const simulationInstanceFilter = { worker: worker.remoteAddress };

         var promise = SimulationInstance.find( simulationInstanceFilter, '_id' );

         promise.then( function ( simulationInstances ) {

            simulationInstances.forEach( function ( simulationInstanceId ) {
               updateSimulationInstanceById( simulationInstanceId );
            } );

         } )

            .catch( function ( e ) {
               log.error( e );
            } )

         log.warn( 'Worker ' + worker.remoteAddress + ' left the pool' );

         if ( workerPool.length === 0 ) {
            log.warn( 'There are no workers left' );
            return;
         }
      } );

      worker.on( 'data', function ( data ) {
         // Treat chunk data
         buffer += data;

         var packet;
         try {
            do {
               packet = factory.expose( buffer );
               buffer = factory.remove( buffer );
               treat( packet, worker );
            } while ( buffer.length !== 0 )

         } catch ( e ) {
            return;
         }
      } );

      worker.on( 'error', function () { } );
   } );

   // Open worker
   server.listen( 16180, '0.0.0.0', function () {
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
      populate: { path: '_binary _document _simulationGroup _simulationGroup.name' },
      options: { sort: { '_simulationGroup.priority': -1 } }
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

         simulationInstance.state = SimulationInstance.State.Executing;
         simulationInstance.worker = availableWorkers[idx].address;
         simulationInstance.startTime = Date.now();

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

            const simulationGroupName = simulationInstance._simulation._simulationGroup.name;

            log.info( 'Dispatched simulation instance with load ' + simulationInstance.load + ' from group ' + log.italic( simulationGroupName ) + ' to ' + workerAddress );

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

/**
 * Needs to know if new worker has any executing instance
 * from previous time
 */

function requestWorkerReport( worker ) {

   reportRequest.format()

   worker.write( reportRequest.format() );
}

function removeWorker( worker ) {

   workerManager.remove( worker.remoteAddress );

   const idx = workerPool.indexOf( worker );

   if ( idx > -1 ) {
      workerPool.splice( idx, 1 );
   }
}

function treat( data, worker ) {

   var object = JSON.parse( data.toString() );

   try {
      factory.validate( object );
   } catch ( err ) {
      return log.error( err );
   }

   switch ( object.Id ) {

      case factory.Id.ResourceResponse:

         const update = { cpu: object.cpu, memory: object.memory };

         workerManager.update( worker.remoteAddress, update );

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
               log.error( err + '\nJSON:' + JSON.stringify( output ) );
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
               endTime: Date.now(),
               $unset: { 'worker': 1 }
            }

            var promise = SimulationInstance.findByIdAndUpdate( simulationId, simulationInstanceUpdate, { new: true } ).exec();

            promise.then( function ( simulationInstance ) {

               simulationUtils.updateSimulationInstanceDurationMean( simulationInstance, function ( simulation ) {

                  const duration = simulationInstance.endTime - simulationInstance.startTime;
                  const workerCur = workerManager.get( worker.remoteAddress );

                  var ratio = ( simulation.instanceDurationMean / duration ) - 1;

                  if ( workerCur === {} ) {
                     return;
                  }

                  if ( workerCur.performance.ratio !== undefined ) {
                     ratio = ( ratio + workerCur.performance.ratio ) / 2;
                  }

                  var level;

                  if ( ratio > config.workerPerformance.threshold ) {
                     level = 'Fast';
                  } else if ( ratio < -config.workerPerformance.threshold ) {
                     level = 'Slow';
                  } else {
                     level = 'Medium';
                  }

                  const workerUpdate = {
                     performance: {
                        ratio: ratio,
                        level: level
                     }
                  }

                  workerManager.update( workerCur.address, workerUpdate );
               } );

               Simulation.findById( simulationInstance._simulation ).select( '_simulationGroup' ).exec()
                  .then( function ( simulationGroupId ) {
                     simulationUtils.estimateSimulationGroupEndTime( simulationGroupId._simulationGroup );
                  } );

               log.info( 'Worker ' + worker.remoteAddress + ' has finished one simulation instance' );

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
                        const totalTime = ( endTime - simulationGroup.startTime ); // seconds

                        var elapsedTime = new Date( totalTime );
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
               updateWorkerRunningInstances( worker.remoteAddress )
            } );
         }

         break;

      case factory.Id.ReportResponse:

         // Insert new worker to the pool
         addWorker( worker );

         workerManager.update( worker, { status: object.report.status } )

         const executingSimulationInstances = object.report;

         executingSimulationInstances.forEach( function ( executingSimulationInstance ) {

            var promise = SimulationInstance.findById( executingSimulationInstance.id );

            promise.then( function ( simulationInstance ) {

               if ( ( simulationInstance.state === SimulationInstance.State.Canceled ) ||
                  ( simulationInstance.state === SimulationInstance.State.Finished ) ) {

                  worker.write( simulationTerminateRequest.format( { SimulationId: executingSimulationInstance.id } ) );
                  return;
               }

               var previousWorkerAddress = '';

               if ( ( simulationInstance.worker !== undefined ) && ( worker.remoteAddress !== simulationInstance.worker ) ) {

                  if ( simulationInstance.startTime > executingSimulationInstance.startTime ) {

                     for ( var idx = 0; idx < workerPool.length; ++idx ) {
                        if ( workerPool[idx].remoteAddress === simulationInstance.worker ) {
                           workerPool[idx].write( simulationTerminateRequest.format( { SimulationId: executingSimulationInstance.id } ) );
                           previousWorkerAddress = workerPool[idx].remoteAddress;
                           break;
                        }
                     }

                  } else {

                     worker.write( simulationTerminateRequest.format( { SimulationId: executingSimulationInstance.id } ) );
                     return;

                  }
               }

               simulationInstance.state = SimulationInstance.State.Executing;
               simulationInstance.worker = worker.remoteAddress;
               simulationInstance.startTime = executingSimulationInstance.startTime;

               simulationInstance.save( function () {

                  updateWorkerRunningInstances( simulationInstance.worker );

                  if ( previousWorkerAddress !== '' ) {
                     updateWorkerRunningInstances( previousWorkerAddress );
                  }

               } );
            } )

               .catch( function ( e ) {
                  log.error( e );
               } );
         } );

         break;

      default:
         return log.error( 'Invalid message received from ' + worker.remoteAddress );
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
      simulationInstance.startTime = undefined;

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

   // <Workaround>
   {
      const simulationInstancePopulate = {
         path: '_simulation',
         select: '_simulationGroup',
         populate: { path: '_simulationGroup' }
      };

      const simulationInstanceFilter = { state: SimulationInstance.State.Executing };

      var promise = SimulationInstance.find( simulationInstanceFilter ).populate( simulationInstancePopulate );

      promise.then( function ( simulationInstances ) {

         simulationInstances.forEach( function ( simulationInstance ) {

            const simulationGroupState = simulationInstance._simulation._simulationGroup.state;

            if ( simulationGroupState !== SimulationGroup.State.Executing ) {
               simulationInstance.state = SimulationInstance.State.Canceled;
               simulationInstance.save();
            }

         } );
      } )

         .catch( function ( e ) {
            log.error( e );
         } );
   }
   // </Workaround>

   // Clean all simulations that were executing when dispatcher died
   const simulationInstanceFilter = { state: SimulationInstance.State.Executing };
   const simulationInstanceUpdate = { state: SimulationInstance.State.Pending, $unset: { worker: 1 } };

   var promise = SimulationInstance.update( simulationInstanceFilter, simulationInstanceUpdate, { multi: true } ).exec();

   // Treat all errors
   promise.catch( function ( err ) {
      log.error( err );
   } );
}