////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const nodemailer = require( 'nodemailer' );
const config = rootRequire( 'servers/shared/configuration' ).getConfiguration();
const log = rootRequire( 'servers/shared/log' );

var transporter = nodemailer.createTransport( {
   service: config.transporter.service,
   auth: {
      user: config.transporter.auth.user,
      pass: config.transporter.auth.pass
   }
} );

module.exports.sendMail = function ( to, subject, text ) {

   var mailOptions = {
      from: config.transporter.auth.user,
      to: to,
      subject: subject,
      text: text
   };

   transporter.sendMail( mailOptions, function ( error, info ) {
      if ( error ) {
         log.error( error );
      }
   } );
}