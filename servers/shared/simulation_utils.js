////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const SimulationGroup = require( '../../database/models/simulation_group' );
const Simulation = require( '../../database/models/simulation' );
const SimulationInstance = require( '../../database/models/simulation_instance' );

module.exports.estimateSimulationGroupEndTime = function estimateSimulationGroupEndTime ( simulationGroupId ) {

   const simulationFilter = { _simulationGroup: simulationGroupId };

   var promise = Simulation.find( simulationFilter ).select( 'id' ).exec();

   promise.then( function ( simulationIds ) {

      const simulationInstanceFilter = {
         _simulation: { $in: simulationIds },
         state: SimulationInstance.State.Finished
      };

      return SimulationInstance.find( simulationInstanceFilter ).select( 'startTime endTime' ).sort( 'startTime' ).exec();
   } )

      .then( function ( simulationInstancesTime ) {

         if ( simulationInstancesTime.length < 2 ) {
            return;
         }

         var simulationInstanceDurationMean = 0;
         var simulationInstanceDispatchMean = 0;
         var remainingInstances = 500;

         for ( var idx = 1; idx < simulationInstancesTime.length; ++idx ) {

            simulationInstanceDurationMean +=
               simulationInstancesTime[idx].endTime.getTime() -
               simulationInstancesTime[idx].startTime.getTime();

            simulationInstanceDispatchMean +=
               simulationInstancesTime[idx].startTime.getTime() -
               simulationInstancesTime[idx - 1].startTime.getTime();
         }

         simulationInstanceDurationMean /= simulationInstancesTime.length;
         simulationInstanceDispatchMean /= simulationInstancesTime.length - 1;

         var estimatedTime = new Date( Date.now() + ( remainingInstances * ( simulationInstanceDurationMean + simulationInstanceDispatchMean ) ) );

         console.log( estimatedTime );
      } )

      .catch( function ( err ) {

      } );


}