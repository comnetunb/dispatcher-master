////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const SimulationGroup = require( '../../../database/models/simulation_group' );
const Simulation = require( '../../../database/models/simulation' );
const SimulationInstance = require( '../../../database/models/simulation_instance' );

const router = require( '../router' );

module.exports = function ( app ) {

   // Simulations
   app.get( '/simulation_group', router.authenticationMiddleware(), ( req, res ) => {

      SimulationGroup.find( {
         _user: req.user.id,
      }, ( err, simulationGroups ) => {
         res.render( 'simulation_group', {
            title: 'Simulations',
            active: 'simulations',
            simulationGroups: simulationGroups
         } );
      } );

   } );


   // APIs
   app.get( '/api/get_simulation_group', ( req, res ) => {

      SimulationGroup.find( { _user: req.user.id },
         ( err, simulationGroups ) => {

            if ( err ) {
               return console.log( err );
            }

            res.send( simulationGroups );
         } );

   } );

}