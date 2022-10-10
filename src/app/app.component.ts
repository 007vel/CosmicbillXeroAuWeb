import { Component,ViewEncapsulation  } from '@angular/core';
import './app.component.css';
import { ConfirmationService } from 'primeng/api';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ConfirmationService],
})
export class AppComponent {}

