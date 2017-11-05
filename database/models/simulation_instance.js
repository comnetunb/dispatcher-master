////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const State = {
   Pending: 0,
   Executing: 1,
   Finished: 2,
   Canceled: 3,
}

const simulationInstanceSchema = Schema( {

   _simulation: {
      type: Schema.ObjectId,
      ref: 'Simulation',
      required: true
   },
   state: {
      type: Number,
      default: State.Pending
   },
   seed: {
      type: Number,
      required: true,
   },
   load: {
      type: Number,
      required: true,
   },
   worker: {
      type: String
   },
   result: {
      type: String
   }

});

simulationInstanceSchema.statics.State = State;

simulationInstanceSchema.index( { _simulation: 1, seed: 1, load: 1 }, { unique: true });

module.exports = mongoose.model( 'SimulationInstance', simulationInstanceSchema );