import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksetCreateComponent } from './taskset-create.component';

describe('TasksetCreateComponent', () => {
  let component: TasksetCreateComponent;
  let fixture: ComponentFixture<TasksetCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksetCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksetCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
