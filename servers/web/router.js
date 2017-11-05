////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const passport = require( 'passport' );

const User = require( '../../database/models/user' )

// Routes
const home = require( './routes/home' );
const login = require( './routes/login' );
const dashboard = require( './routes/dashboard' );
const sign_up = require( './routes/sign_up' );
const simulation = require( './routes/simulation' );
const simulation_group = require( './routes/simulation_group' );

// APIs
const api_simulation_group = require( './apis/simulation_group' );
const api_log = require( './apis/log' )

module.exports.execute = function ( app ) {

   home( app );
   login( app );
   dashboard( app );
   sign_up( app );
   simulation( app );
   simulation_group( app );

   api_simulation_group( app );
   api_log( app );
}

passport.serializeUser(( user, done ) => {

   done( null, user.id );
} );

passport.deserializeUser(( id, done ) => {

   User.findById( id, ( err, user ) => {
      done( err, user );
   } );
} );

module.exports.authenticationMiddleware = function authenticationMiddleware() {

   return ( req, res, next ) => {

      if ( req.isAuthenticated() ) {
         return next();
      }

      res.redirect( '/' )
   }
}