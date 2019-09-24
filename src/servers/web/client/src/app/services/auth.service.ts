import { Injectable } from '@angular/core';
import User, { IUser } from '../../../../../../database/models/user';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

const apiRoute = '/api/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private currentUserSubject: BehaviorSubject<IUser>;
  public currentUser: Observable<IUser>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<IUser>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): IUser {
    return this.currentUserSubject.value;
  }

  refresh() {
    console.log('top');
    console.log(`${apiRoute}/signed_in`);

    const sub = this.http.get<IUser>(`${apiRoute}/signed_in`).subscribe((user) => {
      if (user == null) return;
      // store user details and jwt token in local storage to keep user logged in between page refreshes
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      sub.unsubscribe();
    });
  }

  login(username: string, password: string) {
    return this.http.post<IUser>(`${apiRoute}/sign_in`, { username, password })
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.router.navigate(['/']);
      }));
  }

  logout() {
    this.http.post(`${apiRoute}/sign_out`, {}, { responseType: 'text' }).subscribe(() => {
      // remove user from local storage and set current user to null
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/']);
    });
  }
}
