
import dgram from 'dgram';
import EventEmitter from 'events';
import * as communication from './communication';
import logger from '../shared/log';

// UDP socket which will receive workers requests
const defaultPort: number = 16180;
const socket = dgram.createSocket('udp4');

// List which is necessary for UDP lack of error treatment
const pendingList: string[] = [];

const event = new EventEmitter();

event.on('NewWorker', (workerInfo: dgram.RemoteInfo) => {
  logger.info(`Sending response to ${workerInfo.address}:${workerInfo.port}`);

  // Send response to worker
  let address = socket.address();
  if (typeof address !== 'string') {
    address = address.address;
  }
  socket.send(address, workerInfo.port, workerInfo.address);
  pendingList.push(workerInfo.address);
});

export function execute(): void {
  // Remove from local cache
  communication.event.on('new_connection', (connection) => {
    const idx = pendingList.indexOf(connection.remoteAddress);

    if (idx > -1) {
      pendingList.splice(idx, 1);
    }
  });

  socket.on('error', (err) => {
    logger.error(err.message);
    socket.close();
  });

  socket.on('message', (message, rinfo) => {
    if (message.indexOf('NewWorker') <= -1) {
      // Discard this message
      logger.error(`Invalid message! ${message} from ${rinfo.address}`);
      return;
    }

    if (pendingList.indexOf(rinfo.address) === -1) {
      // New worker identified
      event.emit('NewWorker', rinfo);
    }
  });

  socket.on('listening', () => {
    let address = socket.address();
    let port: number = defaultPort;
    if (typeof address !== 'string') {
      port = address.port;
      address = address.address;
    }
    logger.info(`UDP socket listening ${address}:${port}`);
  });

  socket.bind(defaultPort);
};
