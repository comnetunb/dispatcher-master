/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const log = rootRequire('servers/shared/log')

var connections = []

var add = function (id, connection) {
  connection.id = id
  connections.push(connection)

  log.info(log.bold(connection.remoteAddress + ':' + connection.remotePort) + ' connected')
}

var remove = function (id) {
  connections.forEach(function (connection, index, object) {
    if (connection.id === id) {
      object.splice(index, 1)

      log.warn(log.bold(connection.remoteAddress + ':' + connection.remotePort) + ' left the pool')

      if (!connections.length) {
        log.warn('There are no connections left')
      }
    }
  })
}

var get = function (id) {
  for (var index = 0; index < connections.length; ++index) {
    if (connections[index].id === id) {
      return connections[index]
    }
  }

  return null
}

var getAll = function () {
  return connections
}

var send = function (id, packet) {
  const socket = get(id)

  if (!socket) {
    throw 'connection not found'
  }

  socket.write(packet)
}

module.exports = {
  add: add,
  remove: remove,
  get: get,
  getAll: getAll,
  send: send
}
