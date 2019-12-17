import uuidv1 from 'uuid/v1';

import * as net from 'net';
import _ from 'lodash';
import EventEmitter from 'events';
import * as connectionManager from './connection_manager';
import * as dwpManager from './dwp_handler/manager';
import logger from '../shared/log';
import { ExposeFirstPDU, RemoveFirstPDU, GetReport, ProtocolType, EncapsulatePDU, PDU } from 'dispatcher-protocol';

import http from 'http';
import io from 'socket.io';
import { socketIOAuth } from './authentication';
import Worker, { IWorker } from '../../database/models/worker';

const httpServer = http.createServer();
const server = io(httpServer);

export const event = new EventEmitter();

const postAuthenticate = (socket: io.Socket, data: any) => {
  // Ask everything
  const getReport: GetReport = {
    type: ProtocolType.GetReport,
    alias: true,
    resources: true,
    tasks: true,
    state: true,
    supportedLanguages: true,
  }

  connectionManager.send(socket.worker._id, getReport);

  socket.on('data', (data: PDU): void => {
    try {
      dwpManager.treat(data, socket);
    } catch (e) {
      logger.error(data);
      // It is normal to end up here
      // Do not treat exception!
    }
  });
}

export async function execute(): Promise<void> {

  await Worker.resetAllConnections();

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

export function findSocket(workerId: any): io.Socket {
  let socket: io.Socket = null;
  _.each(server.nsps, (nsp) => {
    _.each(nsp.connected, (s) => {
      if (s.worker._id.toString() == workerId.toString()) {
        socket = s;
      }
    });
  });

  return socket;
}
