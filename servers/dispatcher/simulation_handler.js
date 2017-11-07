////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const Simulation = require( '../../database/models/simulation' );
const SimulationInstance = require( '../../database/models/simulation_instance' );
const EventEmitter = require( 'events' );
const communication = require( './communication' );

const log = require( '../shared/log' );

const event = new EventEmitter();

module.exports.event = event;

event.on( 'new_simulation', ( id ) => {

   const simulationPopulate = { path: '_simulationGroup', select: 'seedAmount load' };

   var promise = Simulation.find( { _simulationGroup: id }).populate( simulationPopulate ).exec();

   promise.then( function ( simulations ) {

      var promises = [];

      for ( var idx = 0; idx < simulations.length; ++idx ) {

         const seedAmount = simulations[idx]._simulationGroup.seedAmount

         for ( var seed = 1; seed <= seedAmount; ++seed ) {

            var simulationInstances = [];

            const minimumLoad = simulations[idx]._simulationGroup.load.minimum;
            const maximumLoad = simulations[idx]._simulationGroup.load.maximum;
            const step = simulations[idx]._simulationGroup.load.step;

            for ( var load = minimumLoad; load <= maximumLoad; load += step ) {

               const simulationInstance = new SimulationInstance( {
                  _simulation: simulations[idx]._id,
                  seed: seed,
                  load: load
               });

               simulationInstances.push( simulationInstance );
            }

            promises.push( SimulationInstance.insertMany( simulationInstances ) );
         }
      }

      return Promise.all( promises );
   })

   .catch( function ( err ) {
      log.error( err );
   });
});