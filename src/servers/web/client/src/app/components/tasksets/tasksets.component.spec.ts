import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksetsComponent } from './tasksets.component';

describe('TasksetsComponent', () => {
  let component: TasksetsComponent;
  let fixture: ComponentFixture<TasksetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TasksetsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
