import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerCardComponent } from './worker-card.component';

describe('WorkerCardComponent', () => {
  let component: WorkerCardComponent;
  let fixture: ComponentFixture<WorkerCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
