////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const SimulationGroup = rootRequire( 'database/models/simulation_group' );
const Simulation = rootRequire( 'database/models/simulation' );
const SimulationInstance = rootRequire( 'database/models/simulation_instance' );
const log = rootRequire( 'servers/shared/log' );

module.exports.estimateSimulationGroupEndTime = function estimateSimulationGroupEndTime( simulationGroupId ) {

   const simulationFilter = { _simulationGroup: simulationGroupId };

   var promise = Simulation.find( simulationFilter ).select( 'id' ).exec();

   promise.then( function ( simulationIds ) {

      const simulationInstanceFilter = {
         _simulation: { $in: simulationIds },
         state: SimulationInstance.State.Finished,
         startTime: { $exists: true },
         endTime: { $exists: true }
      };

      var promise = SimulationInstance.find( simulationInstanceFilter ).select( 'startTime endTime' ).sort( 'startTime' ).exec();

      promise.then( function ( simulationInstancesTime ) {

         if ( simulationInstancesTime.length < 2 ) {
            // Can't estimate
            return;
         }

         var simulationInstanceDurationMean = 0;
         var simulationInstanceDispatchMean = 0;

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

         const simulationInstanceFilter = {
            _simulation: { $in: simulationIds },
            $or: [{ state: SimulationInstance.State.Pending },
            { state: SimulationInstance.State.Executing }]
         };

         var promise = SimulationInstance.find( simulationInstanceFilter ).exec();

         promise.then( function ( remainingInstances ) {

            var estimatedEndTime = 0;

            for ( var remainingInstance in remainingInstances ) {

               if ( remainingInstances[remainingInstance].state == SimulationInstance.State.Pending ) {
                  estimatedEndTime += simulationInstanceDurationMean + simulationInstanceDispatchMean;
                  continue
               }

               if ( remainingInstances[remainingInstance].startTime === undefined ) {
                  continue;
               }

               estimatedEndTime += simulationInstanceDurationMean - ( Date.now() - remainingInstances[remainingInstance].startTime );
            }

            estimatedEndTime = new Date( Date.now() + estimatedEndTime );

            const simulationGroupUpdate = { estimatedEndTime: estimatedEndTime };

            return SimulationGroup.findByIdAndUpdate( simulationGroupId, simulationGroupUpdate ).exec();
         } )
      } )
   } )

      .catch( function ( err ) {
         log.error( err );
      } );
}

module.exports.updateSimulationInstanceDurationMean = function ( simulationInstance, callback ) {

   const simulationInstanceFilter = {
      _simulation: simulationInstance._simulation,
      startTime: { $exists: true },
      endTime: { $exists: true }
   };

   var promise = SimulationInstance.find( simulationInstanceFilter ).exec();

   promise.then( function ( simulationInstances ) {

      var instanceDurationMean = 0;

      for ( var idx = 0; idx < simulationInstances.length; ++idx ) {

         if ( simulationInstances.length < 3 ) {
            return;
         }

         instanceDurationMean += simulationInstances[idx].endTime - simulationInstances[idx].startTime;
      }

      instanceDurationMean /= simulationInstances.length;

      const simulationUpdate = { instanceDurationMean: instanceDurationMean };

      var promise = Simulation.findByIdAndUpdate( simulationInstance._simulation, simulationUpdate, { new: true } ).exec();

      promise.then( callback );
   } )

      .catch( function ( err ) {
         log.error( err );
      } );
}