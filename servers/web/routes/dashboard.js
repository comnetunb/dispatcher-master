////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const router = require( '../router' );
const workerManager = require( '../../shared/worker_manager' );

module.exports = function ( app ) {

   // dashboard
   app.get( '/dashboard/executing-simulation-groups', router.authenticationMiddleware(), function ( req, res ) {

      const options = { title: 'Dashboard' };

      res.render( 'dashboard/executing-simulation-groups', options );
   } );

   app.get( '/dashboard/finished-simulation-groups', router.authenticationMiddleware(), function ( req, res ) {

      const options = { title: 'Dashboard' };

      res.render( 'dashboard/finished-simulation-groups', options );
   } );

   app.get( '/dashboard/new-simulation-group', router.authenticationMiddleware(), function ( req, res ) {

      const options = { title: 'Dashboard' };

      res.render( 'dashboard/new-simulation-group', options );
   } );

   app.get( '/dashboard/workers', router.authenticationMiddleware(), function ( req, res ) {

      const options = { title: 'Dashboard' };

      res.render( 'dashboard/workers', options );
   } );

   app.get( '/dashboard/logs', function ( req, res ) {

      const options = { title: 'Dashboard' };

      res.render( 'dashboard/logs', options );
   } );

   app.get( '/workers', function ( req, res ) {

      const workers = workerManager.getAll();

      res.send( workers );
   } );

}