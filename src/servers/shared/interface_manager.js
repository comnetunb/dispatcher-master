/*
 * This module is responsible for every
 * direct communication between the interface
 * and the master.
 * This communication is done through Events
 */

const dispatcherProtocol = require('dispatcher-protocol');

const { Command } = dispatcherProtocol.pdu.performCommand;

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
