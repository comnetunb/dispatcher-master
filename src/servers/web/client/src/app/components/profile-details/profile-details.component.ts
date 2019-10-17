import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../../../../../database/models/user';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  private $toUnsubscribe: Subscription[] = [];
  user: IUser;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.$toUnsubscribe.push(
      this.authService.currentUser.subscribe((user) => {
        this.user = user;
      })
    );
  }

  ngOnDestroy() {
    for (let s of this.$toUnsubscribe) {
      s.unsubscribe();
    }
  }
}
