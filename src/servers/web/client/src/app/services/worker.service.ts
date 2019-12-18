import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IWorker } from '../../../../../../database/models/worker';
import { SearchService } from 'lacuna-mat-table';
import { WorkerCreateRequest } from '../api/worker-create-request';
import { WorkerEditRequest } from '../api/worker-edit-request';

const apiRoute = '/api/workers'

@Injectable({
  providedIn: 'root'
})
export class WorkerService implements SearchService<IWorker> {

  constructor(
    private http: HttpClient
  ) { }

  list(): Observable<IWorker[]> {
    return this.http.get<IWorker[]>(`${apiRoute}`);
  }

  get(workerId: string): Observable<IWorker> {
    return this.http.get<IWorker>(`${apiRoute}/${workerId}`);
  }

  edit(workerId: string, request: WorkerEditRequest): Observable<IWorker> {
    return this.http.put<IWorker>(`${apiRoute}/${workerId}`, request);
  }

  listOnline(): Observable<IWorker[]> {
    return this.http.get<IWorker[]>(`${apiRoute}/online`);
  }

  create(request: WorkerCreateRequest): Observable<IWorker> {
    return this.http.post<IWorker>(`${apiRoute}`, request);
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
