import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksetDetailsComponent } from './taskset-details.component';

describe('TasksetDetailsComponent', () => {
  let component: TasksetDetailsComponent;
  let fixture: ComponentFixture<TasksetDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksetDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
