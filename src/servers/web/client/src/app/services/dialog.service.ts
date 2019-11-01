import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogOverviewComponent } from '../components/dialog-overview/dialog-overview.component';
import { Observable } from 'rxjs';
import { DialogAlertComponent } from '../components/dialog-alert/dialog-alert.component';
import { DialogConfirmComponent } from '../components/dialog-confirm/dialog-confirm.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog
  ) { }

  alert(message: string, title?: string): Observable<any> {
    let dialogRef = this.dialog.open(DialogAlertComponent, {
      width: '500px',
      data: {
        message,
        title,
      },
    });
    return dialogRef.afterClosed();
  };

  confirm(message: string, title?: string): Observable<any> {
    let dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        message,
        title,
      },
    });
    return dialogRef.afterClosed();

  }
}
