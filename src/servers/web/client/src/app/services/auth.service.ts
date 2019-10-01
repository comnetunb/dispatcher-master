import { Injectable } from '@angular/core';
import User, { IUser } from '../../../../../../database/models/user';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';
import { RegisterUserRequest } from '../api/register-user-request';

const apiRoute = '/api/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private currentUserSubject: BehaviorSubject<IUser>;
  public currentUser: Observable<IUser>;
  public redirectUrl: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {
    this.currentUserSubject = new BehaviorSubject<IUser>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): IUser {
    return this.currentUserSubject.value;
  }

  private storeUser(user: IUser) {
    if (user == null) return;

    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private eraseUser(): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  refresh() {
    const sub = this.http.get<IUser>(`${apiRoute}/signed_in`).subscribe((user) => {
      this.storeUser(user);
      sub.unsubscribe();
    });
  }

  register(request: RegisterUserRequest) {
    return this.userService.registerUser(request)
      .pipe(map(user => {
        this.storeUser(user);
        this.router.navigate(['/dashboard']);
      }));
  }

  login(username: string, password: string) {
    return this.http.post<IUser>(`${apiRoute}/sign_in`, { username, password })
      .pipe(map(user => {
        this.storeUser(user);
        this.router.navigate(['/dashboard']);
      }));
  }

  logout() {
    this.http.post(`${apiRoute}/sign_out`, {}, { responseType: 'text' }).subscribe(() => {
      this.eraseUser();
      this.router.navigate(['/']);
    });
  }
}
