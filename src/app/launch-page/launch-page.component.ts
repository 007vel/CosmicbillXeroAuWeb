import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-launch-page',
  templateUrl: './launch-page.component.html',
  styleUrls: ['./launch-page.component.css']
})
export class LaunchPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    setTimeout(() => {

    }, 5 * 1000);
  }

}
