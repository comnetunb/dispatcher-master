import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-workers',
  templateUrl: './admin-workers.component.html',
  styleUrls: ['./admin-workers.component.scss']
})
export class AdminWorkersComponent implements OnInit {

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
  }

}
