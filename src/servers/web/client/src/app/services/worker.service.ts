import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IWorker } from '../../../../../../database/models/worker';

const apiRoute = '/api/workers'

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  constructor(
    private http: HttpClient
  ) { }


  list(): Observable<IWorker[]> {
    return this.http.get<IWorker[]>(`${apiRoute}`);
  }

  pause(id: string): Observable<IWorker> {
    return this.http.post<IWorker>(`${apiRoute}/${id}/pause`, {});
  }

  resume(id: string): Observable<IWorker> {
    return this.http.post<IWorker>(`${apiRoute}/${id}/resume`, {});
  }

  stop(id: string): Observable<IWorker> {
    return this.http.post<IWorker>(`${apiRoute}/${id}/stop`, {});
  }

}
