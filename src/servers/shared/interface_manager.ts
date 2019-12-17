import { Command } from 'dispatcher-protocol';
import EventEmitter from 'events';
import { IWorker } from '../../database/models/worker';

export const event = new EventEmitter();

export function pauseWorker(workerId: string): void {
  event.emit('worker_command', workerId, Command.Pause);
};

export function resumeWorker(workerId: string): void {
  event.emit('worker_command', workerId, Command.Resume);
};

export function stopWorker(workerId: string): void {
  event.emit('worker_command', workerId, Command.Stop);
};
