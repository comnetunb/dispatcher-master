import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private statusSubject: BehaviorSubject<string>;
  public status: Observable<string>;

  constructor() { }

  ngOnInit() {
    this.statusSubject = new BehaviorSubject<string>(null);
    this.status = this.statusSubject.asObservable();
  }

  allowed() {
    this.statusSubject.next(null);
  }

  pending() {
    this.statusSubject.next('pending');
  }

  rejected() {
    this.statusSubject.next('rejected');
  }

}
