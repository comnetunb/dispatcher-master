import logger from '../shared/log';
import * as net from 'net';
import { worker } from 'cluster';

export interface IdentifiedSocket extends net.Socket {
  id?: string;
}

const connections: Map<string, IdentifiedSocket> = new Map<string, IdentifiedSocket>();

export function add(workerUuid: string, connection: IdentifiedSocket): void {
  connection.id = workerUuid;
  connections.set(workerUuid, connection);
  logger.info(`${connection.remoteAddress}:${connection.remotePort} connected`);
};

export function remove(workerUuid: string): void {
  if (connections.has(workerUuid)) {
    const connection = connections.get(workerUuid);
    connections.delete(workerUuid);
    logger.warn(`${connection.remoteAddress}:${connection.remotePort} left the pool`);

    if (Object.keys(connections).length === 0) {
      logger.warn('There are no connections left');
    }
  }
};

export function get(workerUuid: string): IdentifiedSocket {
  if (connections.has(workerUuid)) {
    return connections.get(workerUuid);
  }

  return null;
};

export function getAll(): Map<string, IdentifiedSocket> {
  return connections;
};

export function send(workerUuid: string, packet: string): void {
  const socket = get(workerUuid);
  if (socket === null) {
    throw new Error('Connection not found');
  }

  socket.write(packet);
};
