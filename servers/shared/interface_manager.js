/*
 * This module is responsible for every
 * direct communication between the interface
 * and the master.
 * This communication is done through Events
 */

const { Command } = protocolRequire('dwp/pdu/perform_command');

const EventEmitter = require('events');

const event = new EventEmitter();

module.exports.event = event;

module.exports.pauseSlave = (address) => {
  event.emit('slave_command', address, Command.PAUSE);
};

module.exports.resumeSlave = (address) => {
  event.emit('slave_command', address, Command.RESUME);
};

module.exports.stopSlave = (address) => {
  event.emit('slave_command', address, Command.STOP);
};
