////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

'use strict'

const router = require( '../router' );
const simulationHandler = require( '../../dispatcher/simulation_handler' )

const User = require( '../../../database/models/user' );
const Binary = require( '../../../database/models/binary' );
const Document = require( '../../../database/models/document' );
const SimulationGroup = require( '../../../database/models/simulation_group' )
const Simulation = require( '../../../database/models/simulation' );
const SimulationInstance = require( '../../../database/models/simulation_instance' );

const log = require( '../../../database/models/log' );

module.exports = function ( app ) {

   app.get( '/simulation_group/:id', router.authenticationMiddleware(), ( req, res ) => {

      // @TODO: this is being done to fill simulation's page dropbox. Find a better way of doing this
      var simulationFilter = { _simulationGroup: req.params.id };

      var promise = Simulation.find( simulationFilter ).select( '_id' ).exec();

      promise.then( function ( simulationIds ) {

         const simulationInstanceFilter = { _simulation: { $in: simulationIds }, result: { $ne: null } };
         const simulationInstancePopulate = { path: '_simulation', select: 'name' };

         return SimulationInstance.find( simulationInstanceFilter ).populate( simulationInstancePopulate ).select( 'result _simulation -_id' ).exec();
      })

      .then( function ( simulationInstances ) {

         simulationInstances = JSON.stringify( simulationInstances )

         const options = { title: 'Simulation', active: 'simulation', results: simulationInstances };

         res.render( 'simulation', options );
      })

      .catch( function ( err ) {

         res.sendStatus( 400 );

      });
   });

   app.get( '/simulation/:id', ( req, res ) => {

      var simulationFilter = { _simulationGroup: req.params.id };

      var promise = Simulation.find( simulationFilter ).select( '_id' ).exec();

      promise.then( function ( simulationIds ) {

         const simulationInstanceFilter = { _simulation: { $in: simulationIds }, result: { $ne: null } };
         const simulationInstancePopulate = { path: '_simulation', select: 'name' };

         return SimulationInstance.find( simulationInstanceFilter )
            .populate( simulationInstancePopulate )
            .select( 'result _simulation -_id' )
            .exec();
      })

      .then( function ( simulationInstances ) {

         res.send( simulationInstances );

      })

      .catch( function ( err ) {

         res.sendStatus( 400 );

      });
   });

   app.post( '/simulation_group/:id', ( req, res ) => {

      res.redirect( '/simulation_group/' + req.params.id );

   });

   app.post( '/cancel', function ( req, res ) {

      const simulationFilter = { _simulationGroup: req.body._simulationGroup, state: Simulation.State.Executing };

      var promise = Simulation.find( simulationFilter ).select( '_id' ).exec();

      promise.then( function ( simulationIds ) {

         const simulationInstanceFilter = { _simulation: { $in: simulationIds } }
         const simulationInstanceUpdate = { state: SimulationInstance.State.Canceled };

         return SimulationInstance.update( simulationInstanceFilter, simulationInstanceUpdate, { multi: true }).exec();
      })

      .then( function () {

         const id = req.body._simulationGroup;
         const simulationGroupUpdate = { state: SimulationGroup.State.Finished, endTime: Date.now() };

         return SimulationGroup.findByIdAndUpdate( id, simulationGroupUpdate )
      })

      .then( function () {

         res.sendStatus( 200 );
      })

      .catch( function ( err ) {

         log.error( err );

         res.sendStatus( 400 );
      });
   });

   app.post( '/remove', ( req, res ) => {

      // TODO: Remove binaries and documents
      const simulationFilter = { _simulationGroup: req.body._simulationGroup };

      var promise = Simulation.find( simulationFilter ).select( 'id' ).exec();

      promise.then( function ( simulationIds ) {

         const simulationInstanceFilter = { _simulation: { $in: simulationIds } };

         return SimulationInstance.remove( simulationInstanceFilter );
      })

      .then( function () {

         return SimulationGroup.findByIdAndRemove( req.body._simulationGroup );
      })

      .then( function () {
         res.sendStatus( 200 );
      })

      .catch( function ( err ) {

         log.error( err );

         res.sendStatus( 400 );
      });
   });

   app.post( '/new_simulation', ( req, res ) => {

      if ( req.files === null ) {
         req.flash( 'error_msg', 'Files were not submitted!' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      var simulationNames = req.body.simulationName;
      var binaryFiles = req.files['simulator'];
      var documentFiles = req.files['configuration'];

      if ( simulationNames === undefined ) {
         req.flash( 'error_msg', 'Simulation name not set' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( binaryFiles === undefined ) {
         req.flash( 'error_msg', 'Binary not submitted' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( documentFiles === undefined ) {
         req.flash( 'error_msg', 'Document not submitted' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( !( simulationNames instanceof Array ) ) {
         simulationNames = [simulationNames];
      }

      if ( !( binaryFiles instanceof Array ) ) {
         binaryFiles = [binaryFiles];
      }

      if ( !( documentFiles instanceof Array ) ) {
         documentFiles = [documentFiles];
      }

      if ( req.body['sameSimulator'] !== 'on' ) {

         if ( ( simulationNames.length !== binaryFiles.length ) ||
            ( binaryFiles.length !== documentFiles.length ) ) {
            req.flash( 'error_msg', 'Simulation name, binary and document must be filled!' );
            res.redirect( 'dashboard/new-simulation-group' );
            return;
         }
      }

      if ( !req.body.simulationGroupName ) {
         req.flash( 'error_msg', 'Simulation group name not filled' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( !req.body.seedAmount ) {
         req.flash( 'error_msg', 'Seed amount not filled' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( !req.body.minLoad ) {
         req.flash( 'error_msg', 'Minimum load not filled' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( !req.body.maxLoad ) {
         req.flash( 'error_msg', 'Maximum load not filled' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( !req.body.step ) {
         req.flash( 'error_msg', 'Step not filled' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      const simulationGroupName = req.body.simulationGroupName;
      const seedAmount = Number( req.body.seedAmount );
      const minLoad = Number( req.body.minLoad );
      const maxLoad = Number( req.body.maxLoad );
      const step = Number( req.body.step );

      if ( minLoad > maxLoad ) {
         req.flash( 'error_msg', 'Minimum load must be lesser or equal to Maximum load' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      if ( seedAmount <= 0 ) {
         req.flash( 'error_msg', 'Seed amount must be greater than zero' );
         res.redirect( 'dashboard/new-simulation-group' );
         return;
      }

      var binaries = [];

      for ( var idx = 0; idx < binaryFiles.length; ++idx ) {

         const binary = new Binary( {
            _user: req.user.id,
            name: binaryFiles[idx].name,
            content: binaryFiles[idx].data
         });

         binaries.push( binary );
      }

      var documents = [];

      for ( var idx = 0; idx < documentFiles.length; ++idx ) {

         const document = new Document( {
            _user: req.user.id,
            name: documentFiles[idx].name,
            content: documentFiles[idx].data
         });

         documents.push( document );
      }

      const simulationGroup = new SimulationGroup( {
         _user: req.user.id,
         name: simulationGroupName,
         seedAmount: seedAmount,
         load: {
            minimum: minLoad,
            maximum: maxLoad,
            step: step
         }
      });

      var promise = simulationGroup.save();

      promise.then( function () {

         var promises = [];

         promises.push( Binary.insertMany( binaries ) );
         promises.push( Document.insertMany( documents ) );

         return Promise.all( promises );
      })

      .then( function ( results ) {

         const binaries = results[0];
         const documents = results[1];

         var simulations = [];

         for ( var idx = 0; idx < documents.length; ++idx ) {

            var binary = {};
            var simulationName = {};

            if ( req.body['sameSimulator'] === 'on' ) {
               binary = binaries[0];
               simulationName = documents[idx].name;
            } else {
               binary = binaries[idx];
               simulationName = simulationNames[idx];
            }

            const simulation = new Simulation( {
               _simulationGroup: simulationGroup.id,
               _binary: binary.id,
               _document: documents[idx].id,
               name: simulationName
            });

            simulations.push( simulation );
         }

         return Simulation.insertMany( simulations );
      })

      .then( function () {

         simulationHandler.event.emit( 'new_simulation', simulationGroup.id );

         res.redirect( 'dashboard/executing-simulation-groups' );
      })

      .catch( function ( err ) {
         req.flash( 'error_msg', JSON.stringify( err ) );
         res.redirect( 'dashboard/new-simulation-group' );
      });
   });

   app.post( '/cancel_new_simulation', ( req, res ) => {
      res.redirect( 'dashboard/executing-simulation-groups' );
   });
}