import logger from '../shared/log';
import * as net from 'net';
import { worker } from 'cluster';
import { findSocket } from './communication';
import { IOptions } from 'minimatch';
import io from 'socket.io';
import Worker, { IWorker } from '../../database/models/worker';

export async function getAll(): Promise<IWorker[]> {
  return await Worker.find({
    'status.online': true,
  });
}

export function send(workerId: string, packet: string): void {
  const socket = findSocket(workerId);
  if (socket === null) {
    throw new Error('Connection not found');
  }

  socket.write(packet);
};
