import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILog } from '../../../../../../database/models/log';
import { Observable, Subject } from 'rxjs';
import { ObservableSearchService } from 'lacuna-mat-table';

const apiRoute = '/api/logs';

@Injectable({
  providedIn: 'root'
})
export class LogsService implements ObservableSearchService {
  private changedSubject: Subject<any> = new Subject<any>();

  changed: Observable<string> = this.changedSubject.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  list(): Observable<ILog[]> {
    return this.http.get<ILog[]>(`${apiRoute}`);
  }
}
