import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { IFile } from '../../../../../../database/models/file';
import { Observable } from 'rxjs';

const apiRoute = '/api/files'

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(
    private http: HttpClient
  ) { }

  upload(body: FormData): Observable<HttpEvent<IFile>> {
    let params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    const req = new HttpRequest('POST', `${apiRoute}/upload`, body, options);
    return this.http.request(req);
  }
}
