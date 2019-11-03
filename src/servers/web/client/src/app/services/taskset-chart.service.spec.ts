import { TestBed } from '@angular/core/testing';

import { TasksetChartService } from './taskset-chart.service';

describe('TasksetChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TasksetChartService = TestBed.get(TasksetChartService);
    expect(service).toBeTruthy();
  });
});
