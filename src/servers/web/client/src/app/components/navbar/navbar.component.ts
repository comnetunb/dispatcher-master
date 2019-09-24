import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SiteTitle } from 'src/app/utils';
import { IUser } from '../../../../../../../database/models/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  title = SiteTitle;
  user?: IUser;

  constructor(
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.user = await this.authService.isLoggedIn();
  }

}
