/*
 * This module is responsible for every
 * direct communication between the interface
 * and the dispatcher.
 * This communication is done through Events
 */

const Command = protocolRequire('dwp/pdu/perform_command').Command

const EventEmitter = require('events')

var event = new EventEmitter()

module.exports.event = event

module.exports.pauseWorker = function (address) {
  event.emit('worker_command', address, Command.PAUSE)
}

module.exports.resumeWorker = function (address) {
  event.emit('worker_command', address, Command.RESUME)
}

module.exports.stopWorker = function (address) {
  event.emit('worker_command', address, Command.STOP)
}