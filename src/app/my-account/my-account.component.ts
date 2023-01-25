import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../api.service';
import { Message, SelectItem } from 'primeng/primeng';
import { ConfirmationService } from 'primeng/api'
import { EncryptingService } from '../encrypting.service';
import { StoreService } from '../store.service';
import { environment } from 'src/environments/environment.prod';
import { Router } from '@angular/router';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { ParameterHashLocationStrategy } from '../ParameterHashLocationStrategy';
import { PackagePurchaseHelper } from '../PackagePurchaseHelper';
import { CosmicNotifyService } from '../CosmicNotifyService';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'], 
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService, EncryptingService, ConfirmationService]
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
	AutoRenewalEnable: boolean = false;

  submitted: boolean;

  genders: SelectItem[];

  description: string;

  constructor(private router: Router,private fb: FormBuilder,private spinner: NgxSpinnerService, 
    private api: ApiService, private encrypt: EncryptingService, private ss: StoreService, 
    private _confirmationService: ConfirmationService, private packagePurchaseHelper: PackagePurchaseHelper,
    protected cosmicNotifyService:CosmicNotifyService) { }

  ngOnInit() {
   
  this.genders = [];
  this.genders.push({label:'Select Gender', value:''});
  this.genders.push({label:'Male', value:'Male'});
  this.genders.push({label:'Female', value:'Female'});
  this.packagePurchaseHelper.getSubscribedPlan();
    this.PostSelectedPlanID();  
    //this.DoTimeDelay();    
    this.GetAllPageData();
   }
 
    delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
   private async GetAllPageData() 
   {
    this.spinner.show();
    this.loadingMessage = "Please wait..."
    await this.delay(2000);
    this.getTotalPdfUsed();
    this.getSubscribedPlan();
     this.getMyAccount();     
     this.getPlans();
     this.getPayment();
     this.getTotalTrialPdfUsed(); 
     this.cosmicNotifyService.myEventEmiter.emit();
   }
 
   private async DoTimeDelay()
   {
     await new Promise(f => setTimeout(this.GetAllPageData, 2000));
   }
 private PostSelectedPlanID()
 {
   if(ParameterHashLocationStrategy.planId!=null)
   {
     this.api.post('Admin/SaveSubscriptionMaster', { 'PlanID': ParameterHashLocationStrategy.planId }).subscribe(
      (res1: {}) => this.PostPlaidSuccess(),
      error => this.PostPlaidFailuer()); 
   }
 }

 PostPlaidSuccess()
 {
  ParameterHashLocationStrategy.planId = null;
  this.router.navigate(['/myaccount']); 
 }

 PostPlaidFailuer()
 {
   
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
    this.AutoRenewalEnable = res.Data.IsAutoRenew;
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
   // debugger;

   
   if(!this.packagePurchaseHelper.CheckAvailablePackageCount())
   {
    this.packagePurchaseHelper.NavigateToPackageApp();
   }else{
    alert('You have enough package to process bills..');
  }
  }

  AutoRenewalCheckboxChange(_event) 
  {
    console.log(">>>>>>>>>>>>>>> AutoRenewalCheckboxChange");

    if(!this.AutoRenewalEnable)
    {
      this._confirmationService.confirm({
        message: "Please be mind once you uncheck auto renewal the roll over pdf count will be lost, can not be undo. please confirm?",
        accept: () => {
          this.MakeAutorenewalCall();
        },
        reject: () => {
          this.AutoRenewalEnable = !this.AutoRenewalEnable;
        }
    });
    }else{
      this.MakeAutorenewalCall();
    }

  }
 
MakeAutorenewalCall()
{
  this.spinner.show();
        this.loadingMessage = "Please wait..."
        var cloneSubscription = { "SubscriptionID":this.subscribedPlan.SubscriptionID,"IsAutoRenew":this.AutoRenewalEnable};
    
        this.api.post('Admin/UpdateSubscriptionMaster', cloneSubscription).subscribe(
          (res: {}) => this.sucessAutoRenewalCheckboxChange(res),
          error => this.failedAutoRenewalCheckboxChange(<any>error));
}

  sucessAutoRenewalCheckboxChange(res: any) {    
    this.spinner.hide();
    this.GetAllPageData();
  }
  failedAutoRenewalCheckboxChange(res: any) {
    
    this.spinner.hide();
    this.AutoRenewalEnable = !this.AutoRenewalEnable;

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
