////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const communication = rootRequire( 'servers/dispatcher/communication' );
const worker_discovery = rootRequire( 'servers/dispatcher/worker_discovery' );
const log = rootRequire( 'servers/shared/log' );

module.exports = function () {

   try {
      communication.execute();
      worker_discovery.execute();
   } catch ( err ) {
      log.error( err );
   }

}