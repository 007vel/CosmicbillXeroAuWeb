import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../api.service';
import { Message, SelectItem } from 'primeng/primeng';
import { ConfirmationService } from 'primeng/api'
import { EncryptingService } from '../encrypting.service';
import { StoreService } from '../store.service';
import { environment } from 'src/environments/environment.prod';
import { Router } from '@angular/router';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ParameterHashLocationStrategy } from '../ParameterHashLocationStrategy';
import { PackagePurchaseHelper } from '../PackagePurchaseHelper';
import { CosmicNotifyService } from '../CosmicNotifyService';
import { debugOutputAstAsTypeScript } from '@angular/compiler';
import { stringhelper } from '../stringhelper';


@Component({
    selector: 'app-my-account',
    templateUrl: './my-account.component.html',
    styleUrls: ['./my-account.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [ApiService, EncryptingService, ConfirmationService]
})
export class MyAccountComponent implements OnInit {

    offProfile: any = false;

    loadingMessage: string = "loading...";
    msgs: Message[] = [];
    plans: any = [];
    stripePayment: any = [];
    planSelected: any;
    subscribedPlan: any = null;
    diffDays: any;
    totalPdfUsed: any;
    totalTrialPdfUsed: any;
    myAccountDetail: any;
    totalAllocatedPdf: any;
    userform: FormGroup;
    AutoRenewalEnable: boolean = false;
    PaymentStatus: any = " ";
    PaymentInitDateTime: any = null;
    XeroReferaluser: any;
    //IsEligibleForXeroPlanOws : boolean ;
    submitted: boolean;
    minutesDifference: any = 0;
    allowpayment: any = true;
    genders: SelectItem[];
    allowOwing: boolean;
    totalused: any;
    xeromaster: any = null;
    xeroPlansUrl = 'https://apps.xero.com/${shortcode}/au/subscribe/d589a79e-e0d5-483a-b129-c67d8327b808';

    description: string;

    constructor(private router: Router, private fb: FormBuilder, private spinner: NgxSpinnerService,
        private api: ApiService, private encrypt: EncryptingService, private ss: StoreService,
        private _confirmationService: ConfirmationService, private packagePurchaseHelper: PackagePurchaseHelper,
        protected cosmicNotifyService: CosmicNotifyService) { }

    async ngOnInit() {
        this.spinner.show();       
         //debugger;
        this.loadingMessage = "Please wait..."
        this.genders = [];
        this.genders.push({ label: 'Select Gender', value: '' });
        this.genders.push({ label: 'Male', value: 'Male' });
        this.genders.push({ label: 'Female', value: 'Female' });
        await this.PostSelectedPlanID();
        if (!this.packagePurchaseHelper.IsAutoRenewal) { 
            this.packagePurchaseHelper.getSubscribedPlan();
            this.totalAllocatedPdf = this.ss.fetchPaidPdfCount();
        } else {

            this.totalAllocatedPdf = this.ss.fetchTotalAllocatedPDF();
        }
         //debugger;
        this.spinner.hide();
         //debugger;
        this.GetAllPageData(); 
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    private async GetAllPageData() {
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."
        //await this.delay(2000);
        this.getMyAccount();
        // this.getXeroMaster();
        //this.DoTimeDelay();
        if (this.packagePurchaseHelper.IsAutoRenewal) {
            this.getStartofAutoRenwalInfo();

        } else { this.getTotalPdfUsed(); }
        //this.getMyAccount();
        // this.getTotalPdfUsed();
        // this.getPlans();
        // this.getPayment();
        // this.getTotalTrialPdfUsed();
        // this.getSubscribedPlan();
        this.cosmicNotifyService.myEventEmiter.emit();
    }

    private async Delay(ms:any) {
        await new Promise(f => setTimeout(ms));
    }
    private async DoTimeDelay() {
        await new Promise(f => setTimeout(this.GetAllPageData, 2000));
    }
    private PostSelectedPlanID() {
         //debugger;
        this.spinner.show();
         //debugger;
        if (ParameterHashLocationStrategy.planId != null) {
            this.api.post('Admin/SaveSubscriptionMasterinCosmic', { 'PlanID': ParameterHashLocationStrategy.planId }).subscribe(
                (res1: {}) => this.PostPlaidSuccess(),
                error => this.PostPlaidFailuer()); 
        }
    }

    
    async PostPlaidSuccess() { 
         //debugger;
        ParameterHashLocationStrategy.planId = null;
        //this.router.navigate(['/docupload']);
        this.router.navigateByUrl('/docupload');
         //debugger;

        this.spinner.hide();
         //debugger;
    }

    PostPlaidFailuer() {

    }


    getPayment() {
        
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."

        this.api.get('Stripe/GetPayment', '').subscribe(
            (res: {}) => this.sucessGetPayment(res),
            error => this.failedGetPlan(<any>error));
    }

    sucessGetPayment(resp: any) {

        this.stripePayment = resp.Data;
         //debugger;
        this.spinner.hide();
        this.getTotalTrialPdfUsed();
         //debugger;   
    }

    getPlans() {
        this.spinner.show();
         //debugger;
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
         //debugger;
        this.spinner.hide();
        this.getPayment();
         //debugger;
    }

    failedGetPlan(resp: any) {
         //debugger;
        this.spinner.hide();
         //debugger;
    }

    getSubscribedPlan() {
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."
        this.api.get('Plan/GetAccountSubscribedPlan', '').subscribe(
            (res: {}) => this.sucessGetSubscribedPlan(res),
            error => this.failedGetSubscribedPlan(<any>error));
    }

    sucessGetSubscribedPlan(res: any) {
        this.subscribedPlan = res.Data;
        console.log(this.subscribedPlan);
        console.log(this.subscribedPlan.IsEligibleForXeroPlanOws + "IsEligibleForXeroPlanOws");
        this.allowOwing = this.subscribedPlan.IsEligibleForXeroPlanOws;
        this.AutoRenewalEnable = this.subscribedPlan.IsAutoRenew;
        console.log('subscribedPlan' + this.subscribedPlan);
        console.log(' 1> totalPaidPdf' + this.subscribedPlan.totalPaidPdf);
        console.log(' 2> totalPaidPdf' + this.subscribedPlan.totalAllocatedPdf);

        //Get days past since sub-plan is started.
        let PlanStartDateTime = new Date(this.subscribedPlan.StartDateTime);
        console.log("PlanStartDateTime is:" + PlanStartDateTime);
        let todayDate = new Date();
        console.log("todayDate is:" + todayDate);
        //
        const diffTime = Math.abs(todayDate.getTime() - PlanStartDateTime.getTime());
        this.diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         //debugger;
        this.spinner.hide();
         //debugger;
    }

    failedGetSubscribedPlan(res: any) {
         //debugger;
        this.spinner.hide();
         //debugger;
    }

    getTotalPdfUsed() {
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."
        this.api.get('Plan/GetTotalPaidPdfUsed', '').subscribe(
            (res: {}) => this.sucessGetTotalPdfUsed(res),
            error => this.failedGetTotalPdfUsed(<any>error));

    }


    getStartofAutoRenwalInfo() {
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."
        this.api.get('Plan/GetStartOfAutoRenewalInfo', '').subscribe(
            (res: {}) => this.sucessGetStartofAutoRenwalInfo(res),
            error => this.failedGetSubscribedPlan(<any>error));
    }

    sucessGetStartofAutoRenwalInfo(res: any) {

        if (res.Data != null) {
            this.totalPdfUsed = res.Data.totalUsedPdf;
            // this.totalAllocatedPdf = res.Data.totalAllocatedPdf;
        }
         //debugger;
        this.spinner.hide();
         //debugger;
    }
    sucessGetTotalPdfUsed(res: any) {
       
        if (res.Data != null) {

            this.totalPdfUsed = res.Data.TotalPaidUsed;
        }
         //debugger;
        this.spinner.hide();
        this.getPlans();
         //debugger;
    }

    failedGetTotalPdfUsed(res: any) {
         //debugger;
        this.spinner.hide();
         //debugger;
    }

    getTotalTrialPdfUsed() {
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."

        this.api.get('Plan/GetTotalTrialPdfUsed', '').subscribe(
            (res: {}) => this.sucessGetTotalTrialPdfUsed(res),
            error => this.failedGetTotalTrialPdfUsed(<any>error));
    }

    sucessGetTotalTrialPdfUsed(res: any) {
        if (res.Data != null) {
            this.totalTrialPdfUsed = res.Data.TotalTrialUsed;

            console.log('this.totalTrialPdfUsed' + this.totalTrialPdfUsed)

        }
         //debugger;
        this.spinner.hide();
        this.getSubscribedPlan();
         //debugger;
    }

    failedGetTotalTrialPdfUsed(res: any) {
         //debugger;
        this.spinner.hide();
         //debugger;
    }


    getMyAccount() {

        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."

        this.api.get('Account/Get', '').subscribe(
            (res: {}) => this.sucessGetMyAccount(res),
            error => this.failedGetMyAccount(<any>error));
    }
    getXeroMaster() {
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."
        this.api.get('Xero/GetByAccountID', '').subscribe(
            (res: {}) => this.sucessXeroMaster(res),
            error => this.failedXeroMaster(<any>error));
    }

    failedXeroMaster(res: any) {
         //debugger;
        this.spinner.hide();
         //debugger;
    }

    sucessXeroMaster(res: any) {
        
        this.xeromaster = res.Data[0];

        if (res.StatusCode == 0) {
            //    this.AsyncBackEndScanning = res.Data[0].ShortCode;

        }
         //debugger;
        this.spinner.hide();
        this.getTotalPdfUsed();
         //debugger;
    }
    sucessGetMyAccount(res: any) {
        this.myAccountDetail = res.Data;
        this.XeroReferaluser = this.myAccountDetail.IsXeroReferaluser;
        this.userform = this.fb.group({
            UserName: [res.Data.UserName],
            Email: [res.Data.Email],
            Phone: [res.Data.Phone]
        });
        var _date = this.myAccountDetail.PaymentInitiatedDateTime;
        var dbdate = new Date(_date);
        var currentDatetime = new Date();
        var timeDifference = ((currentDatetime.getTime()) - dbdate.getTime());
        this.minutesDifference = Math.floor(timeDifference / (1000 * 60));
        console.log("Payment recall Minutes Current difference : ", this.minutesDifference);
        

        if (!stringhelper.IsNullOrEmptyOrDefault(_date)) {
            if (this.minutesDifference <= 4) {
                this.allowpayment = true;
                this.PaymentStatus = "Payment Confirmation In progress";
            }
            else {
                this.allowpayment = true;
                this.PaymentStatus = "Last payment is Failed, Contact cosmic support";
            }
        }
         //debugger;
        this.spinner.hide();
        this.getXeroMaster();
         //debugger;
    }

    failedGetMyAccount(res: any) {
         //debugger;
        this.spinner.hide();
         //debugger;
    }

    sucessUpdatedPaymentInitiationDateTime(res: any) {
        // 
        var shortcode = this.xeromaster.ShortCode;
        window.open(`https://apps.xero.com/${shortcode}/au/subscribe/d589a79e-e0d5-483a-b129-c67d8327b808`);

    }
    failedUpdatedPaymentInitiationDateTime(res: any) { }

    buyWithCard() {

        // this.getSubscribedPlan();
        // this.sucessUpdatedPaymentInitiationDateTime(null);
        // return;
        var xerorefuser = this.myAccountDetail.IsXeroReferaluser;
        if (this.allowpayment) {

            var flag_purchase = false;
            console.log("IsPaidPlan = " + this.subscribedPlan.IsPaidPlan);
            console.log("total Paid Pdf = " + this.subscribedPlan.totalPaidPdf);
            console.log("total Allocated Pdf = " + this.totalAllocatedPdf);
            console.log("total Pdf Used = " + this.totalPdfUsed);
            console.log("total Trial Pdf = " + this.subscribedPlan.TrialPdf);
            console.log("total Trial Pdf Used = " + this.totalTrialPdfUsed);
            if (this.subscribedPlan.IsPaidPlan) {

                var totalpdf = 0;
                if (this.subscribedPlan.totalPaidPdf == null || undefined) {
                    totalpdf = this.totalAllocatedPdf;
                }
                else {
                    totalpdf = this.subscribedPlan.totalPaidPdf;
                }
                if ((totalpdf - this.totalPdfUsed) > 0) {
                    alert("You have enough PDF Count to scan and use");

                }
                else {

                    flag_purchase = true;
                }
            }
            else {
                if (!this.subscribedPlan.IsPaidPlan) {

                    if ((this.subscribedPlan.TrialPdf - this.totalTrialPdfUsed) > 0) {
                        alert("You have enough PDF Count to scan and use");
                    }
                    else {

                        flag_purchase = true;
                    }
                }
            }

            if (flag_purchase) {

                var curentDateTime = new Date();


                if (this.packagePurchaseHelper.UserIsEligibleForXeroPlanOws && this.subscribedPlan.IsPaidPlan) {

                    var a = window.confirm("You're exceeded current month limit. But stil, you can process the pdf's. the additional usage will be charged in upcoming billing");
                }
                else {
                    if (xerorefuser !== null) {
                        if (xerorefuser) {
                            var curentDateTime = new Date();
                            this.api.post('Account/UpdateAccountMaster', { "PaymentInitiatedDateTime": curentDateTime.toLocaleString() }).subscribe(
                                (res: {}) => this.sucessUpdatedPaymentInitiationDateTime(res),
                                error => this.failedUpdatedPaymentInitiationDateTime(<any>error));


                        }
                        else {
                            if (!this.packagePurchaseHelper.CheckAvailablePaidPDFCount()) {
                                this.packagePurchaseHelper.NavigateToPackageApp();
                            } else {
                                alert('You have enough package to process bills..');
                            }
                        }
                    }
                }

            }
        }
    }

    AutoRenewalCheckboxChange(_event) {
        console.log(">>>>>>>>>>>>>>> AutoRenewalCheckboxChange");

        if (!this.AutoRenewalEnable) {
            this._confirmationService.confirm({
                message: "Please be mind once you uncheck auto renewal the roll over pdf count will be lost, can not be undo. please confirm?",
                accept: () => {
                    this.MakeAutorenewalCall();
                },
                reject: () => {
                    this.AutoRenewalEnable = !this.AutoRenewalEnable;
                }
            });
        } else {
            this.MakeAutorenewalCall();
        }

    }

    MakeAutorenewalCall() {
        this.spinner.show();
         //debugger;
        this.loadingMessage = "Please wait..."
        var cloneSubscription = { "SubscriptionID": this.subscribedPlan.SubscriptionID, "IsAutoRenew": this.AutoRenewalEnable };

        this.api.post('Admin/UpdateSubscriptionMaster', cloneSubscription).subscribe(
            (res: {}) => this.sucessAutoRenewalCheckboxChange(res),
            error => this.failedAutoRenewalCheckboxChange(<any>error));
    }

    sucessAutoRenewalCheckboxChange(res: any) {
        this.GetAllPageData();
    }
    failedAutoRenewalCheckboxChange(res: any) {  
        this.AutoRenewalEnable = !this.AutoRenewalEnable;

    }

    checkXeroToken() {
        var xeroID = this.ss.fetchXeroConnectID();
        this.api.get('Xero/CheckXeroToken?XeroID=' + xeroID, "").subscribe(
            (res: {}) => this.validateCheckXeroToken(res),
            error => this.failedCheckXeroToken(<any>error));
    }

    validateCheckXeroToken(res: any) {
        var token = this.ss.fetchToken();
        if (res.StatusCode == 0) {
            if (res.Data.XeroTokenMinute < 0) {
                //window.location.href = this.api._xeroConnectUrl + token.toString();
                alert("Error in validateCheckXeroToken my account ");
            }
        }
    }

    failedCheckXeroToken(res: any) {
        var token = this.ss.fetchToken();
        this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
    }



}
