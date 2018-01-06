////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

global.rootRequire = function ( name ) {
   return require( __dirname + '/' + name );
}

global.protocolRequire = function ( name ) {
   return require( __dirname + '/../protocol/' + name );
}

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const expressValidator = require( 'express-validator' );
const flash = require( 'connect-flash' );
const upload = require( 'express-fileupload' );

const User = rootRequire( 'database/models/user' );
const dispatcher = rootRequire( 'servers/dispatcher/dispatcher' );
const db_driver = rootRequire( 'database/db_driver' );
const router = rootRequire( 'servers/web/router' );

const app = express();

// Authentication
const session = require( 'express-session' );
const passport = require( 'passport' );
const LocalStrategy = require( 'passport-local' ).Strategy;
const MongoStore = require( 'connect-mongo' )( session );

const mongoUrl = 'mongodb://localhost/ons';
const mongoOptions = { useMongoClient: true };

app.use( express.static( __dirname + '/public' ) );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( expressValidator() );
app.use( flash() );
app.use( upload() );
app.use( session( {
   secret: '4df8jb1arc2r84g',
   resave: false,
   saveUninitialized: false,
   store: new MongoStore( {
      url: mongoUrl,
      collection: 'session'
   } )
} ) );

app.use( passport.initialize() );
app.use( passport.session() );

passport.use( new LocalStrategy(( email, password, done ) => {

   User.findOne( { email: email }, function ( err, user ) {

      if ( err ) {
         return done( err );
      }

      if ( !user ) {
         return done( null, false, { message: 'Incorrect username.' } );
      }

      if ( !user.validPassword( password ) ) {
         return done( null, false, { message: 'Incorrect password.' } );
      }

      return done( null, user );
   } );

} ) );

app.use( function ( req, res, next ) {
   res.locals.success_msg = req.flash( 'success_msg' );
   res.locals.error_msg = req.flash( 'error_msg' );
   res.locals.error = req.flash( 'error' );
   res.locals.isAuthenticated = req.isAuthenticated();
   next();
} );

// Setup Engine
app.set( 'view engine', 'ejs' );

// Setup Database Driver
db_driver( mongoUrl, mongoOptions );

// Initialize dispatcher
dispatcher();

// Call handler
router.execute( app );

// Listen requests
app.listen( 8080, '0.0.0.0' );