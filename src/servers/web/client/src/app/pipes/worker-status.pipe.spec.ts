import { WorkerStatusPipe } from './worker-status.pipe';

describe('WorkerStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new WorkerStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
