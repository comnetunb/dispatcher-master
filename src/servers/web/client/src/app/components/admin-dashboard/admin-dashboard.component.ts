import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
  }

  users() {
    this.router.navigate(['/', 'admin', 'users']);
  }

  settings() {
    this.router.navigate(['/', 'admin', 'settings']);
  }
}
