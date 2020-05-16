import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IConfiguration } from '../../../../../../database/models/configuration';
import { LimitedServerConfiguration } from '../../../../api/server-configuration';
import { EditSettingsRequest } from '../../../../api/edit-settings-request';

const apiRoute = '/api/settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private http: HttpClient) {}

  get(): Observable<IConfiguration> {
    return this.http.get<IConfiguration>(`${apiRoute}`);
  }

  getServer(): Observable<LimitedServerConfiguration> {
    return this.http.get<LimitedServerConfiguration>(`${apiRoute}/server`);
  }

  set(settings: EditSettingsRequest): Observable<IConfiguration> {
    return this.http.post<IConfiguration>(`${apiRoute}`, settings);
  }
}
