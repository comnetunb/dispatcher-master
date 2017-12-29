////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const log = rootRequire( 'servers/shared/log' );
const User = rootRequire( 'database/models/user' );

module.exports = function ( app ) {

   app.post( '/sign_up', ( req, res ) => {

      // Validation
      req.checkBody( 'name', 'Name must be between 4-50 characters long.' ).len( 4, 50 );
      req.checkBody( 'email', 'The email you entered is invalid, please try again.' ).isEmail();
      req.checkBody( 'password', 'Password must be between 8-100 characters long.' ).len( 8, 100 );
      //req.checkBody('password', 'Password must include one lowercase character, one uppercase character, a number, and a special character.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i');
      req.checkBody( 'passwordMatch', 'Passwords do not match, please try again.' ).equals( req.body.password );

      var promise = req.getValidationResult();

      promise.then( function ( result ) {

         if ( !result.isEmpty() ) {
            var errors = result.array().map( function ( elem ) {
               return elem.msg;
            } );

            req.flash( 'error', errors[0] );
            res.redirect( '/' );
         } else {

            const name = req.body.name;
            const email = req.body.email;
            const password = req.body.password;
            const passwordMatch = req.body.passwordMatch;

            // Encrypt password
            User.encryptPassword( password, function ( err, hash ) {

               if ( err ) {
                  req.flash( 'error', 'An internal error occurred. Please try again latter.' );
                  res.redirect( '/' );
               }

               const user = new User( { 'name': name, 'email': email, 'password': hash } );

               var promise = user.save();

               promise.then( function ( user ) {

                  req.login( user, ( err ) => {
                     if ( err ) {
                        console.log( err );
                        return;
                     }

                     res.redirect( '/dashboard/executing-simulation-groups' );
                  } );
               } )

               .catch( function ( err ) {

                  if ( err.code === 11000 ) {
                     // Unique conflict
                     req.flash( 'error', 'User already exists' );
                     res.redirect( '/' );
                  }
                  else {
                     log.error( err );
                     req.flash( 'error', 'An internal error occurred. Please try again latter.' );
                     res.redirect( '/' );
                  }
               } );
            } );
         }
      } )
   } );
}