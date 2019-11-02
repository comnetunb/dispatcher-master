import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObservableSearchService } from 'lacuna-mat-table';
import { Subject, Observable } from 'rxjs';
import { INotification } from '../../../../../../database/models/notification';

const apiRoute = '/api/notifications'

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpClient
  ) { }

  all(): Observable<INotification[]> {
    return this.http.get<INotification[]>(`${apiRoute}`);
  }

  unread(): Observable<INotification[]> {
    return this.http.get<INotification[]>(`${apiRoute}/unread`);
  }

  read(notificationId: string): Observable<INotification> {
    return this.http.post<INotification>(`${apiRoute}/${notificationId}`, null);
  }

}
