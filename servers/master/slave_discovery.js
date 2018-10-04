/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const dgram = require('dgram');
const EventEmitter = require('events');

const communication = rootRequire('servers/master/communication');
const log = rootRequire('servers/shared/log');

// UDP socket which will receive slaves requests
const socket = dgram.createSocket('udp4');

// List which is necessary for UDP lack of error treatment
const pendingList = [];

const event = new EventEmitter();

event.on('event', (slaveInfo) => {
  log.info(`Sending response to ${slaveInfo.address}:${slaveInfo.port}`);

  // Send response to slave
  socket.send(socket.address().address, slaveInfo.port, slaveInfo.address);

  pendingList.push(slaveInfo.address);
});

module.exports.execute = () => {
  // Remove from local cache
  communication.event.on('new_connection', (connection) => {
    const idx = pendingList.indexOf(connection.remoteAddress);

    if (idx > -1) {
      pendingList.splice(idx, 1);
    }
  });

  socket.on('error', (err) => {
    log.error(err.stack);
    socket.close();
  });

  socket.on('message', (message, rinfo) => {
    if (message.indexOf('NewSlave') <= -1) {
      // Discard this message
      log.error(`Invalid message! ${message} from ${rinfo.address}`);
      return;
    }

    if (pendingList.indexOf(rinfo.address) === -1) {
      // New slave identified
      event.emit('event', rinfo);
    }
  });

  socket.on('listening', () => {
    log.info(`UDP socket listening ${socket.address().address}:${socket.address().port}`);
  });

  socket.bind(16180);
};
