import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { DialogAlertComponent } from '../components/dialog-alert/dialog-alert.component';
import { DialogConfirmComponent } from '../components/dialog-confirm/dialog-confirm.component';
import { INotification } from '../../../../../../database/models/notification';
import { DialogNotificationsComponent } from '../components/dialog-notifications/dialog-notifications.component';
import { DialogConfigFileComponent } from '../components/dialog-config-file/dialog-config-file.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  alert(message: string, title?: string): Observable<any> {
    const dialogRef = this.dialog.open(DialogAlertComponent, {
      width: '500px',
      data: {
        message,
        title,
      },
    });
    return dialogRef.afterClosed();
  }

  confirm(message: string, title?: string): Observable<any> {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        message,
        title,
      },
    });
    return dialogRef.afterClosed();
  }

  notifications(notifications: INotification[]): Observable<any> {
    const dialogRef = this.dialog.open(DialogNotificationsComponent, {
      width: '500px',
      data: {
        notifications,
      },
    });
    return dialogRef.afterClosed();
  }

  configFile(workerId: string, workerApiPort: number): Observable<any> {
    const dialogRef = this.dialog.open(DialogConfigFileComponent, {
      width: '500px',
      data: {
        workerId,
        workerApiPort,
      },
    });
    return dialogRef.afterClosed();
  }
}
