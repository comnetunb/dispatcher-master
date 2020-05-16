import { Injectable } from '@angular/core';
import { SearchService } from 'lacuna-mat-table';
import { ITask } from '../../../../../../database/models/task';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

const apiRoute = '/api/tasks';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(private http: HttpClient) {}

  dataSource(tasksetId: string): SearchService<ITask> {
    return {
      list: (): Observable<ITask[]> => {
        return this.getFromTaskset(tasksetId);
      },
    };
  }

  getFromTaskset(
    tasksetId: string,
    filterSuccessful: boolean = false
  ): Observable<ITask[]> {
    const query = {
      filterSuccessful: filterSuccessful.toString(),
    };
    return this.http.get<ITask[]>(`${apiRoute}/from-taskset/${tasksetId}`, {
      params: query,
    });
  }

  getSuccessfulFromTaskset(tasksetId: string): Observable<ITask[]> {
    return this.http.get<ITask[]>(`${apiRoute}/from-taskset/${tasksetId}`);
  }

  discard(taskId: string): Observable<ITask> {
    return this.http.post<ITask>(`${apiRoute}/${taskId}/discard`, null);
  }

  cancel(taskId: string): Observable<ITask> {
    return this.http.post<ITask>(`${apiRoute}/${taskId}/cancel`, null);
  }
}
