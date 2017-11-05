////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const communication = require('./communication');
const worker_discovery = require( './worker_discovery' );

const log = require( '../../database/models/log' );

module.exports = function () {

   try {
      communication.execute();
      worker_discovery.execute();
   } catch (err) {
      log.error(err);
   }

}