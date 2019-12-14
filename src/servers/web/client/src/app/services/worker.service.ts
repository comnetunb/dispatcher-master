import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IWorker } from '../../../../../../database/models/worker';
import { SearchService } from 'lacuna-mat-table';

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


  listOnline(): Observable<IWorker[]> {
    return this.http.get<IWorker[]>(`${apiRoute}/online`);
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
