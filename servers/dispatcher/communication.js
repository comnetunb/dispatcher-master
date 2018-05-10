/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

// General
const net = require('net')
const EventEmitter = require('events')

var event = new EventEmitter()
module.exports.event = event

// Dispatcher Related
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const dwpManager = rootRequire('servers/dispatcher/dwp_handler/manager')

// Shared Related
const log = rootRequire('servers/shared/log')

// Protocol Related
const factory = protocolRequire('dwp/factory')

// TCP socket in which all the dispatcher-workers communication will be accomplished
const server = net.createServer()

module.exports.execute = function () {
  server.on('connection', function (connection) {
    // Creates a buffer for each connection
    var buffer = ''

    event.emit('new_connection', connection)

    connection.once('close', function () {
      event.emit('closed_connection', connection)
    })

    connection.on('data', function (data) {
      // Treat chunk data
      buffer += data

      var packet
      try {
        do {
          // This may throw an exception
          packet = factory.expose(buffer)

          // This may throw an exception
          buffer = factory.remove(buffer)

          dwpManager.treat(packet, connection)
        } while (buffer.length !== 0)
      } catch (e) {
        // It is normal to end up here
        // Do not treat exception!
      }
    })

    connection.on('error', function () { })
  })

  // Open worker
  server.listen(16180, '0.0.0.0', function () {
    log.info('TCP server listening ' + server.address().address + ':' + server.address().port)
  })
}
