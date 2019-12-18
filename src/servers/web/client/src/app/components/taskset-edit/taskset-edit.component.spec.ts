import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksetEditComponent } from './taskset-edit.component';

describe('TasksetEditComponent', () => {
  let component: TasksetEditComponent;
  let fixture: ComponentFixture<TasksetEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksetEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
