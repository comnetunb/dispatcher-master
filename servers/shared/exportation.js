

/**
* Converts a JavaScript Object Notation (JSON) string into an object.
* @param simulationGroupId Id of the group to be exported.
* @param callback Callback to be called after finishing compressing simulation group.
*/

module.exports.zip = function ( simulationGroupId ) {

   const simulationGroupId = req.params.id;

   var promise = Simulation.find( { _simulationGroup: simulationGroupId } ).select( '_id' ).exec();

   promise.then( function ( simulationIds ) {

      if ( simulationIds === null ) {
         throw 'Simulations not found!';
      }

      const simulationInstanceFilter = { _simulation: { $in: simulationIds }, result: { $ne: null } };
      const simulationInstancePopulate = { path: '_simulation', select: 'name' };

      return SimulationInstance.find( simulationInstanceFilter ).populate( simulationInstancePopulate ).exec();
   } )

      .then( function ( simulationInstances ) {

         if ( simulationInstances === null ) {
            throw 'Simulation Instances not found!';
         }

         var simulationGroupResults = [];

         loop:
         for ( var simulationInstance in simulationInstances ) {

            const simulationId = simulationInstances[simulationInstance]._simulation._id;
            const simulationName = simulationInstances[simulationInstance]._simulation.name;
            const simulationInstanceSeed = simulationInstances[simulationInstance].seed;
            const simulationInstanceResult = JSON.parse( simulationInstances[simulationInstance].result );

            if ( simulationGroupResults.length === 0 ) {

               var simulationGroupResult = {};

               simulationGroupResult._simulation = simulationId;
               simulationGroupResult.name = simulationName;
               simulationGroupResult.resultsBySeed = [{ seed: simulationInstanceSeed, result: [simulationInstanceResult] }];

               simulationGroupResults.push( simulationGroupResult );

            } else {

               for ( var simulationGroupResult in simulationGroupResults ) {

                  // Simulation is already in map
                  if ( simulationGroupResults[simulationGroupResult]._simulation === simulationId ) {

                     // Iterate over all set of results of this simulation
                     for ( var resultBySeed in simulationGroupResults[simulationGroupResult].resultsBySeed ) {

                        if ( simulationGroupResults[simulationGroupResult].resultsBySeed[resultBySeed].seed === simulationInstanceSeed ) {

                           simulationGroupResults[simulationGroupResult].resultsBySeed[resultBySeed].result.push( simulationInstanceResult );
                           continue loop;
                        }
                     }

                     simulationGroupResults[simulationGroupResult].resultsBySeed.push( { seed: simulationInstanceSeed, result: [simulationInstanceResult] } );
                     continue loop;
                  }
               }

               var simulationGroupResult = {};

               simulationGroupResult._simulation = simulationId;
               simulationGroupResult.name = simulationName;
               simulationGroupResult.resultsBySeed = [{ seed: simulationInstanceSeed, result: [simulationInstanceResult] }];

               simulationGroupResults.push( simulationGroupResult );
            }
         }

         var dirsToZip = [];

         var promises = [];

         const tmpDir = __dirname + '/../../temp/'
         for ( var simulationGroupResult in simulationGroupResults ) {

            const dirName = tmpDir + path.parse( simulationGroupResults[simulationGroupResult].name ).name;

            dirsToZip.push( dirName );

            const resultsBySeed = simulationGroupResults[simulationGroupResult].resultsBySeed;

            for ( var resultBySeed in resultsBySeed ) {

               const filePath = dirName + '/seed_' + resultsBySeed[resultBySeed].seed + '.csv';

               var promise = new Promise( function ( resolve, reject ) {
                  json2csv.json2csv( resultsBySeed[resultBySeed].result, function ( err, csv ) {

                     if ( err ) {
                        throw err;
                     } else {
                        return writeFile( filePath, csv, function ( err ) {
                           if ( err ) {
                              throw err;
                           }

                           resolve( filePath )
                        } );
                     }
                  } );
               } );

               promises.push( promise );
            }
         }

         return Promise.all( promises ).then( function () {

            var promise = SimulationGroup.findById( simulationGroupId ).exec();

            promise.then( function ( simulationGroup ) {

               const zipPath = tmpDir + simulationGroup.name + '.zip'
               var output = fs.createWriteStream( zipPath );
               var archive = archiver( 'zip' );

               output.on( 'close', function () {
                  res.download( zipPath );

                  for ( var dirToZip in dirsToZip ) {
                     rimraf( dirsToZip[dirToZip], ( err ) => {

                        if ( err ) {
                           throw err;
                        }
                     } );
                  }

                  rimraf( zipPath, ( err ) => {

                     if ( err ) {
                        throw err;
                     }
                  } );
               } );

               archive.on( 'error', function ( err ) {
                  throw err;
               } );

               archive.pipe( output );

               for ( var dirToZip in dirsToZip ) {
                  archive.directory( dirsToZip[dirToZip], path.parse( dirsToZip[dirToZip] ).name, { date: new Date() } );
               }

               archive.finalize();
            } )
         } )
      } )

      .catch( function ( e ) {
         log.error( e );
         res.sendStatus( 500 );
      } );
}
