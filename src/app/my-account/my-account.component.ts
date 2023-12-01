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

    XeroReferaluser : any;
    submitted: boolean;

    genders: SelectItem[];

    description: string;

    constructor(private router: Router, private fb: FormBuilder, private spinner: NgxSpinnerService,
        private api: ApiService, private encrypt: EncryptingService, private ss: StoreService,
        private _confirmationService: ConfirmationService, private packagePurchaseHelper: PackagePurchaseHelper,
        protected cosmicNotifyService: CosmicNotifyService) { }

    ngOnInit() {

        this.genders = [];
        this.genders.push({ label: 'Select Gender', value: '' });
        this.genders.push({ label: 'Male', value: 'Male' });
        this.genders.push({ label: 'Female', value: 'Female' });

        if (!this.packagePurchaseHelper.IsAutoRenewal) {
            this.packagePurchaseHelper.getSubscribedPlan();
            this.totalAllocatedPdf = this.ss.fetchPaidPdfCount();
        } else {

            // this.totalAllocatedPdf = this.ss.fetchTotalAllocatedPDF();
        }
        debugger;
        this.getMyAccount();
        this.PostSelectedPlanID();
        //this.DoTimeDelay();
        this.GetAllPageData();
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    private async GetAllPageData() {
        this.spinner.show();
        this.loadingMessage = "Please wait..."
        await this.delay(2000);

        if (this.packagePurchaseHelper.IsAutoRenewal) {
            this.getStartofAutoRenwalInfo();

        } else { this.getTotalPdfUsed(); }
        //this.getMyAccount();
        this.getSubscribedPlan();
        this.getPlans();
        this.getPayment();
        this.getTotalTrialPdfUsed();
        this.cosmicNotifyService.myEventEmiter.emit();
    }


    private async DoTimeDelay() {
        await new Promise(f => setTimeout(this.GetAllPageData, 2000));
    }
    private PostSelectedPlanID() {
        if (ParameterHashLocationStrategy.planId != null) {
            this.api.post('Admin/SaveSubscriptionMaster', { 'PlanID': ParameterHashLocationStrategy.planId }).subscribe(
                (res1: {}) => this.PostPlaidSuccess(),
                error => this.PostPlaidFailuer());
        }
    }

    PostPlaidSuccess() {
        ParameterHashLocationStrategy.planId = null;
        this.router.navigate(['/myaccount']);
    }

    PostPlaidFailuer() {

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
        //
        this.subscribedPlan = res.Data;
        this.AutoRenewalEnable = res.Data.IsAutoRenew;
        console.log('subscribedPlan' + this.subscribedPlan);

        //Get days past since sub-plan is started.
        let PlanStartDateTime = new Date(this.subscribedPlan.StartDateTime);
        console.log("PlanStartDateTime is:" + PlanStartDateTime);
        let todayDate = new Date();
        console.log("todayDate is:" + todayDate);
        //
        const diffTime = Math.abs(todayDate.getTime() - PlanStartDateTime.getTime());
        this.diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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


    getStartofAutoRenwalInfo() {
        this.api.get('Plan/GetStartOfAutoRenewalInfo', '').subscribe(
            (res: {}) => this.sucessGetStartofAutoRenwalInfo(res),
            error => this.failedGetSubscribedPlan(<any>error));
    }

    sucessGetStartofAutoRenwalInfo(res: any) {

        if (res.Data != null) {
            this.totalPdfUsed = res.Data.totalUsedPdf;
            this.totalAllocatedPdf = res.Data.totalAllocatedPdf;
        }
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

            console.log('this.totalTrialPdfUsed' + this.totalTrialPdfUsed)

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
        this.XeroReferaluser = this.myAccountDetail.IsXeroReferaluser;
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
        debugger;
        var flag_purchase = false;
        console.log("IsPaidPlan = "+this.subscribedPlan.IsPaidPlan);
        console.log("total Paid Pdf = " + this.subscribedPlan.totalPaidPdf);
        console.log("total Pdf Used = "+this.totalPdfUsed);
        console.log("total Trial Pdf = "+this.subscribedPlan.TrialPdf);
        console.log("total Trial Pdf Used = "+this.totalTrialPdfUsed);
        if(this.subscribedPlan.IsPaidPlan){
            if((this.subscribedPlan.totalPaidPdf - this.totalPdfUsed) > 0 ){
                alert("You have Available PDF Count to sacn and use");
            }
            else{
                debugger;
                flag_purchase = true;
            }
        }
        else{
            if(!this.subscribedPlan.IsPaidPlan){
                debugger;
                if((this.subscribedPlan.TrialPdf - this.totalTrialPdfUsed) > 0 ){
                    alert("You have Available PDF Count to sacn and use");
                }
                else{
                    debugger;
                    flag_purchase = true;
                }
            }
        }
        
        if(flag_purchase){
            debugger;
                //------------
                // Get Account Master Account By using Account ID 
                // Check the IsXeroreferalUser Is 1 or 0 
                // If 1 = True THen Xero Payment Link 
                // If 0 = False Then Cosmic Payment Link
                //------------
                //   //
                window.open("https://apps.xero.com/!sc-7l/au/subscribe/d589a79e-e0d5-483a-b129-c67d8327b808");
                // var a = this.myAccountDetail.IsXeroReferaluser;
                // if (a !== null) {
                //     //  //
                //     if (a) {
                //         //For xerorefUder Link 
                //         //    //
                //         window.open("https://www.google.com/");
                //     }
                //     else {
                //         if (!this.packagePurchaseHelper.CheckAvailablePaidPDFCount()) {
                //             this.packagePurchaseHelper.NavigateToPackageApp();
                //         } else {
                //             alert('You have enough package to process bills..');
                //         }
                //     }
                // }
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
        this.loadingMessage = "Please wait..."
        var cloneSubscription = { "SubscriptionID": this.subscribedPlan.SubscriptionID, "IsAutoRenew": this.AutoRenewalEnable };

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
