import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import './welcome.component.css';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  //styleUrls: ['./welcome.component.css']
  encapsulation: ViewEncapsulation.None
})
export class WelcomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
