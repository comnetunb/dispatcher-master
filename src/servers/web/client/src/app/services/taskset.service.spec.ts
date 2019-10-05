import { TestBed } from '@angular/core/testing';

import { TasksetService } from './taskset.service';

describe('TasksetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TasksetService = TestBed.get(TasksetService);
    expect(service).toBeTruthy();
  });
});
