import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
  }

  home() {
    this.router.navigate(['/', 'dashboard']);
  }

  workers() {
    this.router.navigate(['/', 'dashboard', 'workers']);
  }

  logs() {
    this.router.navigate(['/', 'dashboard', 'logs']);
  }

}
