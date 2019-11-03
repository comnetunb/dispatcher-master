import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare var Plotly: any;

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @ViewChild("Graph", { static: true })
  private Graph: ElementRef;
}
