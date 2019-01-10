/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const log = sharedRequire('log');

const connections = [];

const add = (id, connection) => {
  connection.id = id;
  connections.push(connection);

  log.info(`${connection.remoteAddress}:${connection.remotePort} connected`);
};

const remove = (id) => {
  connections.forEach((connection, index, object) => {
    if (connection.id === id) {
      object.splice(index, 1);

      log.warn(`${connection.remoteAddress}:${connection.remotePort} left the pool`);

      if (!connections.length) {
        log.warn('There are no connections left');
      }
    }
  });
};

const get = (id) => {
  for (let index = 0; index < connections.length; index += 1) {
    if (connections[index].id === id) {
      return connections[index];
    }
  }

  return null;
};

const getAll = () => {
  return connections;
};

const send = (id, packet) => {
  const socket = get(id);

  if (!socket) {
    throw String('connection not found');
  }

  socket.write(packet);
};

module.exports = {
  add,
  remove,
  get,
  getAll,
  send
};
