import { LogLevelPipe } from './log-level.pipe';

describe('LogLevelPipe', () => {
  it('create an instance', () => {
    const pipe = new LogLevelPipe();
    expect(pipe).toBeTruthy();
  });
});
