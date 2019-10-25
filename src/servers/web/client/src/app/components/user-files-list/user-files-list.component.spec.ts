import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFilesListComponent } from './user-files-list.component';

describe('UserFilesListComponent', () => {
  let component: UserFilesListComponent;
  let fixture: ComponentFixture<UserFilesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserFilesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
