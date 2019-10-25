import { ReadableSizePipe } from './readable-size.pipe';

describe('ReadableSizePipe', () => {
  it('create an instance', () => {
    const pipe = new ReadableSizePipe();
    expect(pipe).toBeTruthy();
  });
});
