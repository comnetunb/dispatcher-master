import { TestBed, async, inject } from '@angular/core/testing';

import { AllowedGuard } from './allowed.guard';

describe('AllowedGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllowedGuard]
    });
  });

  it('should ...', inject([AllowedGuard], (guard: AllowedGuard) => {
    expect(guard).toBeTruthy();
  }));
});
