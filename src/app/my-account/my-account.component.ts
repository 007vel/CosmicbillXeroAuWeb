import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../api.service';
import { Message, SelectItem } from 'primeng/primeng';
import { EncryptingService } from '../encrypting.service';
import { StoreService } from '../store.service';
import { environment } from 'src/environments/environment.prod';
import { Router } from '@angular/router';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'], 
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService, EncryptingService]
})
export class MyAccountComponent implements OnInit {

  offProfile:any=false;

  loadingMessage: string = "loading...";
  msgs: Message[] = [];
  plans: any = [];
  stripePayment: any = [];
  planSelected: any;
  subscribedPlan: any = null;
  totalPdfUsed: any;
  totalTrialPdfUsed: any;
  myAccountDetail: any;
  userform: FormGroup;

  submitted: boolean;

  genders: SelectItem[];

  description: string;

  constructor(private router: Router,private fb: FormBuilder,private spinner: NgxSpinnerService, private api: ApiService, private encrypt: EncryptingService, private ss: StoreService) { }

  ngOnInit() {

  this.genders = [];
  this.genders.push({label:'Select Gender', value:''});
  this.genders.push({label:'Male', value:'Male'});
  this.genders.push({label:'Female', value:'Female'});
  
   this.getSubscribedPlan();
   this.getTotalPdfUsed();
    this.getMyAccount();
    
    this.getPlans();
    this.getPayment();
    this.getTotalTrialPdfUsed();
  }


  getPayment() {
    this.spinner.show();
    this.loadingMessage = "Getting Striped Payment..."

    this.api.get('Stripe/GetPayment', '').subscribe(
      (res: {}) => this.sucessGetPayment(res),
      error => this.failedGetPlan(<any>error));
  }

  sucessGetPayment(resp: any) {
    this.stripePayment = resp.Data;

    this.spinner.hide();
  }

  getPlans() {
    this.spinner.show();
    this.loadingMessage = "Getting Suppliers..."

    this.api.get('Plan/GetAll', '').subscribe(
      (res: {}) => this.sucessGetPlans(res),
      error => this.failedGetPlan(<any>error));
  }

  sucessGetPlans(resp: any) {
    this.plans = resp.Data;

    this.plans = [];
    this.plans.push({ label: '', value: '' });

    resp.Data.forEach(element => {
      this.plans.push({ label: element.PlanName, value: element.PlanID });
    });

    this.spinner.hide();
  }

  failedGetPlan(resp: any) {
    this.spinner.hide();
  }

  getSubscribedPlan() {
    this.spinner.show();
    this.loadingMessage = "Please wait..."

    this.api.get('Plan/GetAccountSubscribedPlan', '').subscribe(
      (res: {}) => this.sucessGetSubscribedPlan(res),
      error => this.failedGetSubscribedPlan(<any>error));
  }

  sucessGetSubscribedPlan(res: any) {
    this.subscribedPlan = res.Data;
    console.log('subscribedPlan'+ this.subscribedPlan);
    this.spinner.hide();
  }

  failedGetSubscribedPlan(res: any) {
    this.spinner.hide();
  }

  getTotalPdfUsed() {
    this.spinner.show();
    this.loadingMessage = "Please wait..."

    this.api.get('Plan/GetTotalPaidPdfUsed', '').subscribe(
      (res: {}) => this.sucessGetTotalPdfUsed(res),
      error => this.failedGetTotalPdfUsed(<any>error));
  }

  sucessGetTotalPdfUsed(res: any) {
    if (res.Data != null) {
      this.totalPdfUsed = res.Data.TotalPaidUsed;
    }
    this.spinner.hide();
  }

  failedGetTotalPdfUsed(res: any) {
    this.spinner.hide();
  }

  getTotalTrialPdfUsed() {
    this.spinner.show();
    this.loadingMessage = "Please wait..."

    this.api.get('Plan/GetTotalTrialPdfUsed', '').subscribe(
      (res: {}) => this.sucessGetTotalTrialPdfUsed(res),
      error => this.failedGetTotalTrialPdfUsed(<any>error));
  }

  sucessGetTotalTrialPdfUsed(res: any) {
    if (res.Data != null) {
      this.totalTrialPdfUsed = res.Data.TotalTrialUsed;

      console.log('this.totalTrialPdfUsed'+this.totalTrialPdfUsed)

    }
    this.spinner.hide();
  }

  failedGetTotalTrialPdfUsed(res: any) {
    this.spinner.hide();
  }


  getMyAccount() {

    this.spinner.show();
    this.loadingMessage = "Please wait..."

    this.api.get('Account/Get', '').subscribe(
      (res: {}) => this.sucessGetMyAccount(res),
      error => this.failedGetMyAccount(<any>error));
  }

  sucessGetMyAccount(res: any) {
    this.myAccountDetail = res.Data;
    this.userform = this.fb.group({
      UserName: [res.Data.UserName],
      Email: [res.Data.Email],
      Phone: [res.Data.Phone]
  });
    
    this.spinner.hide();


  }

  failedGetMyAccount(res: any) {
    this.spinner.hide();
  }


  buyWithCard() {
  
  
    console.log(this.planSelected);
    if (this.planSelected === null || this.planSelected === undefined) {
      this.msgs = [];
      this.msgs.push({ severity: 'Info', summary: 'Please select a plan first', detail: 'Mandatory.' });
      return;
    }


    //TODO:
    var encryptedData = 1 + '|' + this.planSelected;
    console.log('encryptedData');
   console.log(encryptedData);
    var token1 = this.ss.fetchToken();
    //var token =  this.encrypt.encrypt(token1);

    window.location.href = this.api.stripePaymentUrl + token1 + "&plan="+this.planSelected ;

  }

  checkXeroToken() {
    var xeroID =this.ss.fetchXeroConnectID();
    this.api.get('Xero/CheckXeroToken?XeroID='+ xeroID,"").subscribe(
      (res: {}) => this.validateCheckXeroToken(res),
      error => this.failedCheckXeroToken(<any>error));
  }

  validateCheckXeroToken(res: any) {
    var token = this.ss.fetchToken();
     if (res.StatusCode == 0) {
       if (res.Data.XeroTokenMinute < 0) {
         window.location.href = this.api._xeroConnectUrl + token.toString();
       }
     }
   }
  
  failedCheckXeroToken(res: any) {
    var token = this.ss.fetchToken();
    this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
  }



}
