import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SiteTitle } from '../../utils';
import { IUser } from '../../../../../../../database/models/user';
import { Router } from '@angular/router';
import { SearchService } from 'lacuna-mat-table';
import { INotification } from '../../../../../../../database/models/notification';
import { NotificationService } from 'src/app/services/notification.service';
import { DialogService } from 'src/app/services/dialog.service';
import { getErrorMessage } from 'src/app/classes/utils';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  title = SiteTitle;
  user: IUser;
  isAdmin: boolean = false;
  adminMode: boolean = false;

  notifications: INotification[] = [];
  loadingNotifications: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.authService.currentAdminMode.subscribe((mode) => {
      this.adminMode = mode;
    });

    this.authService.currentUser.subscribe((user) => {
      this.user = user;
      if (this.user != null) {
        this.isAdmin = user.admin;
        this.loadNotifications();
      } else {
        this.isAdmin = false;
      }
    });
    this.authService.refresh();
  }

  toggleAdminMode() {
    this.authService.setAdminMode(!this.adminMode);
  }

  openNotifications() {
    this.dialogService.notifications(this.notifications).subscribe(() => {
      this.loadNotifications();
    });
  }

  loadNotifications() {
    this.loadingNotifications = true;
    this.notificationService.unread().subscribe(notifications => {
      this.notifications = notifications;
      this.loadingNotifications = false;
    }, err => {
      console.error(err);
      // this.dialogService.alert(getErrorMessage(err), 'Could not load notifications');
    });
  }

  logOut() {
    this.authService.logout();
  }
}
