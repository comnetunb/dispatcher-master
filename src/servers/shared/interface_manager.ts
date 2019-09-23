import { Command } from 'dispatcher-protocol';
import EventEmitter from 'events';

export const event = new EventEmitter();

export function pauseWorker(address: string): void {
  event.emit('worker_command', address, Command.Pause);
};

export function resumeWorker(address: string): void {
  event.emit('worker_command', address, Command.Resume);
};

export function stopWorker(address: string): void {
  event.emit('worker_command', address, Command.Stop);
};
