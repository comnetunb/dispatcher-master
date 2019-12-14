import logger from '../shared/log';
import * as net from 'net';
import { worker } from 'cluster';
import { findSocket } from './communication';
import { IOptions } from 'minimatch';
import io from 'socket.io';
import Worker, { IWorker } from '../../database/models/worker';
import { PDU, CommandData, PDUHeader, ProtocolVersion } from 'dispatcher-protocol';

export async function getAll(): Promise<IWorker[]> {
  return await Worker.find({
    'status.online': true,
  });
}

export function send(workerId: string, data: CommandData): void {
  const socket = findSocket(workerId);
  if (socket === null) {
    throw new Error('Connection not found');
  }

  let header: PDUHeader = {
    ts: new Date(),
    v: ProtocolVersion,
  }

  let packet: PDU = {
    header,
    data,
  }

  socket.emit('data', packet);
};
