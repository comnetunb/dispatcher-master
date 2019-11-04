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

  files() {
    this.router.navigate(['/', 'dashboard', 'files']);
  }

  createTaskset() {
    this.router.navigate(['/', 'dashboard', 'tasksets', 'create']);
  }

  tasksets() {
    this.router.navigate(['/', 'dashboard', 'tasksets']);
  }

  executingTasksets() {
    this.router.navigate(['/', 'dashboard', 'tasksets', 'executing']);
  }

  finishedTasksets() {
    this.router.navigate(['/', 'dashboard', 'tasksets', 'finished']);
  }

  canceledTasksets() {
    this.router.navigate(['/', 'dashboard', 'tasksets', 'canceled']);
  }

}
