
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
      //window.location.href = "https://authorize.xero.com/?consentId=f3bcfeff-c5a3-4e1b-b1b4-c865e8a73451&returnUrl=https://login.xero.com/identity/connect/authorize?response_type=code&client_id=277BDB35BF49482DB8291CFECCC5C241&redirect_uri=https://cosmicbills.com/xerouiau&scope=openid profile email accounting.transactions accounting.settings offline_access accounting.contacts.read accounting.contacts accounting.settings.read accounting.attachments";
      window.location.href = "https://login.xero.com/identity/connect/authorize?response_type=code&client_id=277BDB35BF49482DB8291CFECCC5C241&redirect_uri=https://cosmicbills.com/xerouiau&scope=openid profile email accounting.transactions accounting.settings offline_access accounting.contacts.read accounting.contacts accounting.settings.read accounting.attachments";
    }
  }

  ngOnInit() {

  }
}
