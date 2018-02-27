// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
// Interface Manager
//
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

/*
 * This module is responsible for every
 * direct communication between the interface
 * and the dispatcher.
 * This communication is done through Events
 */

const EventEmitter = require('events')

var event = new EventEmitter()

module.exports.event = event

module.exports.newSimulationGroup = function (simulationGroup, simulators, configurationFiles, useSameSimulator) {
  // data.files
  // data.user
  // data.seedAmount
  // data.simulationGroup.name
  // data.simulationGroup.seedAmount
  // data.simulationGroup.load.minimum
  // data.simulationGroup.load.maximum
  // data.simulationGroup.load.seed

}
