import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFilesUserComponent } from './upload-files-user.component';

describe('UploadFilesUserComponent', () => {
  let component: UploadFilesUserComponent;
  let fixture: ComponentFixture<UploadFilesUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadFilesUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFilesUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
