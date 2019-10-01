import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SiteTitle } from 'src/app/utils';
import { IUser } from '../../../../../../../database/models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  title = SiteTitle;
  user: IUser;
  isAdmin: boolean;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe((user) => {
      this.user = user

      if (this.user != null) {
        this.isAdmin = user.admin;
      } else {
        this.isAdmin = false;
      }
    });
    this.authService.refresh();
  }

  async logOut() {
    this.authService.logout();
  }
}
