import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogConfigFileComponent } from './dialog-config-file.component';

describe('DialogConfigFileComponent', () => {
  let component: DialogConfigFileComponent;
  let fixture: ComponentFixture<DialogConfigFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogConfigFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogConfigFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
