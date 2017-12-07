////////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
////////////////////////////////////////////////

const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const State = {
   Executing: 0,
   Finished: 1,
   Canceled: 2,
}

const simulationSchema = Schema( {

   _simulationGroup: {
      type: Schema.ObjectId,
      ref: 'SimulationGroup',
      required: true,
   },
   _binary: {
      type: Schema.ObjectId,
      ref: 'Binary',
      required: true,
   },
   _document: {
      type: Schema.ObjectId,
      ref: 'Document',
      required: true
   },
   name: {
      type: String,
      required: true
   },
   state: {
      type: Number,
      default: State.Executing
   },
   instanceDurationMean: {
      type: Number
   }

});

simulationSchema.statics.State = State;

module.exports = mongoose.model( 'Simulation', simulationSchema );