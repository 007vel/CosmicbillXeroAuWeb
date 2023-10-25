
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Message, SelectItem } from 'primeng/primeng';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { StoreService } from '../store.service';
import { ApiService } from '../api.service';
import { EncryptingService } from '../encrypting.service';
import { ParameterHashLocationStrategy } from '../ParameterHashLocationStrategy';
import { stringhelper } from '../stringhelper';



@Component({
  selector: 'app-autosigninxero',
  styleUrls: ['./autoxignupxero.component.css'],
  templateUrl: './autoxignupxero.html',
  encapsulation: ViewEncapsulation.None
})
export class AutoxignupxeroComponent implements OnInit {

  constructor() {
    if (window.location.href.includes("xerosignup")) {
      window.location.href = "https://authorize.xero.com/?consentId=f3bcfeff-c5a3-4e1b-b1b4-c865e8a73451&returnUrl=https%3A%2F%2Flogin.xero.com%2Fidentity%2Fidentity%2Fconnect%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3D277BDB35BF49482DB8291CFECCC5C241%26redirect_uri%3Dhttps%253A%252F%252Fcosmicbills.com%252Fxerouiau%26scope%3Dopenid%2520profile%2520email%2520accounting.transactions%2520accounting.settings%2520offline_access%2520accounting.contacts.read%2520accounting.contacts%2520accounting.settings.read%2520accounting.attachments";
    }
  }

  ngOnInit() {

  }
}
