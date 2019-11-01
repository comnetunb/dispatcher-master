import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../../../../../../database/models/user';
import { RegisterUserRequest } from '../api/register-user-request';
import { LoginResponse } from '../api/login-response';
import { EditUserRequest } from '../api/edit-user-request';
import { SearchService } from 'lacuna-mat-table';

const apiRoute = '/api/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  registerUser(info: RegisterUserRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${apiRoute}/sign_up`, info);
  }

  editUser(userId: string, info: EditUserRequest): Observable<IUser> {
    return this.http.post<IUser>(`${apiRoute}/edit/${userId}`, info);
  }

  manageUser(userId: string, allow: boolean): Observable<IUser> {
    let params = new HttpParams();
    params = params.append('allow', allow ? 'true' : 'false');
    return this.http.post<IUser>(`${apiRoute}/manage/${userId}`, null, {
      params,
      responseType: 'text' as 'json',
    });
  }

  getUser(userId: string): Observable<IUser> {
    return this.http.get<IUser>(`${apiRoute}/${userId}`);
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

  dataSource(status: string): SearchService<IUser> {
    switch (status) {
      case 'pending':
        return {
          list: () => this.getAllPendingUsers(),
        };
      case 'rejected':
        return {
          list: () => this.getAllDisallowedUsers(),
        };
      default:
        return {
          list: () => this.getAllAllowedUsers(),
        };
    }
  }
}
