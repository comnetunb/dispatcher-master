////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const router = rootRequire( 'servers/web/router' );
const log = rootRequire( 'servers/shared/log' );

module.exports = function ( app ) {

   app.get( '/api/log/get_all', router.authenticationMiddleware(), function ( req, res ) {

      const promise = log.getAllLogs();

      promise.then( function ( logs ) {

         if ( logs === null ) {
            throw 'Failed to get logs';
         }

         res.send( logs.reverse() );
      } )
         .catch( function ( e ) {
            log.error( e );
            res.sendStatus( 500 );
         } );

   } );

}