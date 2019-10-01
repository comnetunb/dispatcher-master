import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../../../../../../database/models/user';
import { RegisterUserRequest } from '../api/register-user-request';

const apiRoute = '/api/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  registerUser(info: RegisterUserRequest): Observable<IUser> {
    return this.http.post<IUser>(`${apiRoute}/sign_up`, info);
  }

  getAllPendingUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${apiRoute}/pending`);
  }

  getAllAllowedUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${apiRoute}/allowed`);
  }

  getAllDisallowedUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${apiRoute}/disallowed`);
  }
}
