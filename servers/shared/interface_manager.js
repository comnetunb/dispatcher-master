/*
 * This module is responsible for every
 * direct communication between the interface
 * and the dispatcher.
 * This communication is done through Events
 */

const { Command } = protocolRequire('dwp/pdu/perform_command');

const EventEmitter = require('events');

const event = new EventEmitter();

module.exports.event = event;

module.exports.pauseWorker = (address) => {
  event.emit('worker_command', address, Command.PAUSE);
};

module.exports.resumeWorker = (address) => {
  event.emit('worker_command', address, Command.RESUME);
};

module.exports.stopWorker = (address) => {
  event.emit('worker_command', address, Command.STOP);
};
