import { Injectable } from '@angular/core';
import { SearchService } from 'lacuna-mat-table';
import { ITask } from '../../../../../../database/models/task';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const apiRoute = '/api/tasks';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(
    private http: HttpClient
  ) { }

  dataSource(tasksetId: string): SearchService<ITask> {
    return {
      list: (): Observable<ITask[]> => {
        return this.http.get<ITask[]>(`${apiRoute}/${tasksetId}`);
      }
    }
  }
}
