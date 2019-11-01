import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SearchService, LacunaMaterialTableComponent } from 'lacuna-mat-table';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { IUser } from '../../../../../../../database/models/user';
import { DialogService } from 'src/app/services/dialog.service';
import { getErrorMessage } from 'src/app/classes/utils';
import { Observable } from 'rxjs';
import { OperationState } from '../../../../../../../api/enums';
import { IFile } from '../../../../../../../database/models/file';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  columnsToDisplay$: string[] = [];
  dataSource: SearchService<IUser>;
  customTitle: string = "Users";
  userStatus: string;
  loading: boolean = false;

  @Input() status: Observable<string>;

  @ViewChild(LacunaMaterialTableComponent, { static: false }) lacTable: LacunaMaterialTableComponent<IUser>;

  constructor(
    private usersService: UserService,
    private route: ActivatedRoute,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.status.subscribe(s => {
      this.dataSource = this.usersService.dataSource(s);
      this.userStatus = s;
      this.loading = false;

      if (s == null) {
        this.customTitle = 'Users';
        this.userStatus = 'allowed';
        this.columnsToDisplay$ = ['name', 'email', 'admin', 'action'];
      } else if (s == 'pending') {
        this.customTitle = 'Pending users';
        this.columnsToDisplay$ = ['name', 'email', 'action'];
      } else if (s == 'rejected') {
        this.customTitle = 'Rejected users';
        this.columnsToDisplay$ = ['name', 'email', 'action'];
      } else {
        throw 'Unknown status for user list'
      }
    });
  }

  disallow(user: IUser) {
    this.dialogService.confirm(`Are you sure you want to reject user with e-mail ${user.email}?`,
      'Reject user?').subscribe((confirm) => {
        if (confirm) {
          this.usersService.manageUser(user._id, false).subscribe(() => {
            this.dialogService.alert('User rejected!');
            this.lacTable.refresh();
          }, error => {
            this.dialogService.alert(getErrorMessage(error));
            console.error(error);
          });
        }
      });
  }

  allow(user: IUser) {
    this.dialogService.confirm(`Are you sure you want to accept user with e-mail ${user.email}?`,
      'Accept user?').subscribe((confirm) => {
        if (confirm) {
          this.usersService.manageUser(user._id, true).subscribe(() => {
            this.dialogService.alert('User accepted!');
            this.lacTable.refresh();
          }, error => {
            this.dialogService.alert(getErrorMessage(error));
            console.error(error);
          });
        }
      });
  }
}
