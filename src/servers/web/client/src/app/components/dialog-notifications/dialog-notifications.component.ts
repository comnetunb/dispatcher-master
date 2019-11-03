import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData, DialogNotificationsData } from 'src/app/api/dialog-data';
import { INotification } from '../../../../../../../database/models/notification';
import { NotificationService } from 'src/app/services/notification.service';
import { getErrorMessage } from 'src/app/classes/utils';

@Component({
  selector: 'app-dialog-notifications',
  templateUrl: './dialog-notifications.component.html',
  styleUrls: ['./dialog-notifications.component.scss']
})
export class DialogNotificationsComponent implements OnInit {
  notifications: INotification[] = [];

  get notificationsFirstPage(): INotification[] {
    return this.notifications.slice(0, 5);
  }

  constructor(
    public dialogRef: MatDialogRef<DialogNotificationsComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: DialogNotificationsData
  ) {
    if (data.notifications != null) this.notifications = data.notifications;
  }

  read(notification: INotification) {
    this.notificationService.read(notification._id).subscribe(n => {
      let idx = this.notifications.findIndex(nn => nn._id == n._id);
      this.notifications.splice(idx, 1);
    }, err => {
      console.log(err);
      // this.dialogService.alert(getErrorMessage(err), 'Could not mark notification as read');
    });
  }

  ngOnInit() {
  }
}
