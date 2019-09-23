import uuidv1 from 'uuid/v1';

import * as net from 'net';
import EventEmitter from 'events';
import * as connectionManager from './connection_manager';
import * as dwpManager from './dwp_handler/manager';
import logger from '../shared/log';
import { ExposeFirstPDU, RemoveFirstPDU, GetReport, ProtocolType, EncapsulatePDU } from 'dispatcher-protocol';
import { IdentifiedSocket } from './connection_manager';
import Task from '../../database/models/task';
import Worker, { IWorker } from '../../database/models/worker';

export const event = new EventEmitter();

// TCP socket in which all the master-workers communication will be accomplished
const server = net.createServer();

export function execute(): void {
  server.on('connection', (connection: IdentifiedSocket): void => {
    // Creates a buffer for each connection
    let buffer = '';

    event.emit('new_connection', connection);

    connection.once('close', (): void => {
      event.emit('closed_connection', connection);
    });

    connection.on('data', (data: Buffer): void => {
      // Treat chunk data
      buffer += data;

      let packet;
      try {
        do {
          // This may throw an exception
          packet = ExposeFirstPDU(buffer);

          // This may throw an exception
          buffer = RemoveFirstPDU(buffer);

          dwpManager.treat(packet, connection);
        } while (buffer.length !== 0);
      } catch (e) {
        // It is normal to end up here
        // Do not treat exception!
      }
    });

    connection.on('error', (error) => {
      logger.error(error.message);
    });
  });

  // Open worker
  server.listen(16180, '0.0.0.0', () => {
    let addressInfo = server.address() as net.AddressInfo;
    if (addressInfo.port) {
      logger.info(`TCP server listening on ${addressInfo.address}:${addressInfo.port}`);
    } else {
      logger.info(`TCP server listening on ${server.address() as string}`);
    }
  });
};

event.on('new_connection', async (connection: IdentifiedSocket) => {
  let worker = new Worker({
    address: connection.remoteAddress,
    port: connection.remotePort,
    uuid: uuidv1()
  });

  try {
    worker = await worker.save();
    connectionManager.add(worker.uuid, connection);

    // Ask everything
    const getReport: GetReport = {
      type: ProtocolType.GetReport,
      alias: true,
      resources: true,
      tasks: true,
      state: true,
      supportedLanguages: true,
    }

    connectionManager.send(worker.uuid, EncapsulatePDU(getReport));
  } catch (err) {
    logger.error(err);
  }
});

event.on('closed_connection', (connection: IdentifiedSocket) => {
  connectionManager.remove(connection.id);

  const taskFilter = { worker: connection.id };

  Task
    .find(taskFilter)
    .then((tasks) => {
      tasks.map((task) => {
        return task.updateToDefaultState();
      });
    })
    .catch((error) => {
      logger.fatal(error);
    });

  Worker
    .find({ uuid: connection.id })
    .remove()
    .catch((error) => {
      logger.fatal(error);
    });
});
