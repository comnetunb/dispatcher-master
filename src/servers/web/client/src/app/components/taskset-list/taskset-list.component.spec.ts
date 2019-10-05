import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksetListComponent } from './taskset-list.component';

describe('TasksetListComponent', () => {
  let component: TasksetListComponent;
  let fixture: ComponentFixture<TasksetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
