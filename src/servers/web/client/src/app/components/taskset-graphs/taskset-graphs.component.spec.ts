import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksetGraphsComponent } from './taskset-graphs.component';

describe('TasksetGraphsComponent', () => {
  let component: TasksetGraphsComponent;
  let fixture: ComponentFixture<TasksetGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksetGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksetGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
