import { Component, OnInit,Output, EventEmitter,ViewEncapsulation } from '@angular/core';
import { StoreService } from '../store.service';
import { Router } from '@angular/router';
import './logout.component.css';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
//  styleUrls: ['./logout.component.css']
encapsulation: ViewEncapsulation.None
})
export class LogoutComponent implements OnInit {

  @Output() siout: EventEmitter<string> = new EventEmitter<string>();

  constructor(private store: StoreService,private router: Router) { }

  ngOnInit() {
    this.store.clearAll();
    this.router.navigate(['/login']);
    
  }

}
