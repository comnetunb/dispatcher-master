import uuidv1 from 'uuid/v1';

import * as net from 'net';
import _ from 'lodash';
import EventEmitter from 'events';
import * as connectionManager from './connection_manager';
import * as dwpManager from './dwp_handler/manager';
import logger from '../shared/log';
import { ExposeFirstPDU, RemoveFirstPDU, GetReport, ProtocolType, EncapsulatePDU } from 'dispatcher-protocol';

import http from 'http';
import io from 'socket.io';
import { socketIOAuth } from './authentication';

const httpServer = http.createServer();
const server = io(httpServer);

export const event = new EventEmitter();

const postAuthenticate = (socket: io.Socket, data: any) => {
  let buffer = '';

  // Ask everything
  const getReport: GetReport = {
    type: ProtocolType.GetReport,
    alias: true,
    resources: true,
    tasks: true,
    state: true,
    supportedLanguages: true,
  }

  connectionManager.send(socket.worker._id, EncapsulatePDU(getReport));

  socket.on('data', (data: Buffer): void => {
    // Treat chunk data
    buffer += data;

    let packet;
    try {
      do {
        // This may throw an exception
        packet = ExposeFirstPDU(buffer);

        // This may throw an exception
        buffer = RemoveFirstPDU(buffer);

        dwpManager.treat(packet, socket);
      } while (buffer.length !== 0);
    } catch (e) {
      // It is normal to end up here
      // Do not treat exception!
    }
  });
}

export function execute(): void {

  socketIOAuth(server, postAuthenticate);
  // Open worker
  httpServer.listen(16180, '0.0.0.0', () => {
    let addressInfo = httpServer.address() as net.AddressInfo;
    if (addressInfo.port) {
      logger.info(`TCP server listening on ${addressInfo.address}:${addressInfo.port}`);
    } else {
      logger.info(`TCP server listening on ${httpServer.address() as string}`);
    }
  });
};

export function findSocket(workerId: string): io.Socket {
  _.each(server.nsps, (nsp) => {
    _.each(nsp.connected, (socket) => {
      if (socket.worker.id === workerId) return socket;
    });
  });
  return null;
}
