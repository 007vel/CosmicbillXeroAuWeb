
import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ConfirmationService, ScrollPanel } from 'primeng/primeng';
import { StoreService } from '../store.service';
import './homelayout.component.css';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Console } from 'console';
import { PackagePurchaseHelper } from '../PackagePurchaseHelper';
import { Alert } from 'selenium-webdriver';
import { CosmicNotifyService } from '../CosmicNotifyService';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppComponent } from '../app.component';
@Component({
    selector: 'app-homelayout',
    templateUrl: './homelayout.component.html',
    //styleUrls: ['./homelayout.component.css'],
    /*
    template: `
    <div>
      <h2> {{ username }} </h2>
      <app-homelayout (usernameEmitter)="recieveUsername()"></app-homelayout>
    </div>
    `,   */
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('submenu', [
            state('hidden', style({
                height: '0px'
            })),
            state('visible', style({
                height: '*'
            })),
            transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ],
    providers: [ApiService]
})
export class HomelayoutComponent implements AfterViewInit, OnDestroy, OnInit {

    public menuInactiveDesktop: boolean;

    public menuActiveMobile: boolean;

    public profileActive: boolean;

    public topMenuActive: boolean;

    public topMenuLeaving: boolean;

    public showAutoRenewwalMessage: boolean;

    subscribedPlan: any = null;
    totalTrialPdf: any = 0;
    totalPaidPdf: any = null;
    AllowOweing: boolean;
    public companyName: String = "No company is connected, Connect a company from Switch Company menu";



    @ViewChild('scroller') public scrollerViewChild: ScrollPanel;
    documentClickListener: Function;

    menuClick: boolean;

    topMenuButtonClick: boolean;
    loadingMessage: string;
    subscriptionAutoRenew: any;



    constructor(private api: ApiService, private router: Router, public renderer: Renderer2, private ss: StoreService,
        private packagePurchaseHelper: PackagePurchaseHelper, private confirmationService: ConfirmationService,
        private spinner: NgxSpinnerService,
        protected cosmicNotifyService: CosmicNotifyService, private appComponent: AppComponent) {

        this.appComponent.isConnectedToXero = this.ss.fetchIsAuthorize();
        this.companyName = this.ss.fetchCompanyName();

        // //
        var IsAuthorize = this.ss.fetchIsAuthorize();
        if (!this.companyName) {
            this.companyName = "No company is connected, Connect a company";
        }

        this.getStartofAutoRenwalInfo();
        this.getSubscribedPlan1();
        this.CheckAvailablePDFCount();
    }
    ngOnInit() {

        console.log(">>>>>>>>>>>>>>>>>>>>>>>> ngOnInit cosmicNotifyService");
        this.cosmicNotifyService.myEventEmiter.subscribe(
            () => {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>> cosmicNotifyService");

                // temp: do enable below func call
                if (!this.packagePurchaseHelper.IsAutoRenewal) {
                    this.getSubscribedPlan();
                }
            }
        );
    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    disconnectFromXero() {
        console.log("**********disconnectFromXero********");
        this.appComponent.showDisconnectConfirmation = true;
        this.SHowXeroDisconnectDialog();

    }
    connectToXero() {
        console.log("**********connectFromXero********");
        this.appComponent.ReAuthXeroUI();
    }

    private async DisconnectFromXero() {
        this.spinner.show();
        this.api.post('Xero/RevokeXeroToken', '').subscribe(
            (res: {}) => this.xeroconnectionResponse(res),
            error => this.xeroconnectionResponse(<any>error));
    }
    private SHowXeroDisconnectDialog() {
        console.log("********** SHowXeroDisconnectDialog********");
        this.confirmationService.confirm({
            message: "Can you confirm if you would like to disconnect from Xero?",
            accept: () => {
                this.loadingMessage = "Xero Disconnection...";
                this.DisconnectFromXero();
            },
            reject: () => {
            }
        });
    }
    xeroconnectionResponse(res: any) {
        this.spinner.hide();
        console.log("xeroconnectionResponse>>>>>>>>>>>>>> " + res);
        this.appComponent.GetAccount();
    }
    private async CheckAvailablePDFCount() {
        await this.delay(1000);
        this.checkPDFcount(this.packagePurchaseHelper, this.confirmationService);
    }

    private checkPDFcount(packagePurchaseHelper: PackagePurchaseHelper, confirmationService: ConfirmationService) {
        if (packagePurchaseHelper.CheckAvailablePackageCount()) {
            //PDF are available
        } else {
            //   confirmationService.confirm({
            //     message: "You don't have enough package to process bills, please select package...",
            //     accept: () => {
            //       //this.loadingMessage = "Package selection...";
            //       packagePurchaseHelper.NavigateToPackageApp();
            //     //  window.close();
            //     },
            //     reject: () => {
            //     }
            // });
        }
    }


    ngAfterViewInit() {
        setTimeout(() => { this.scrollerViewChild.moveBar(); }, 100);

        // hides the overlay menu and top menu if outside is clicked
        this.documentClickListener = this.renderer.listen('body', 'click', (event) => {
            if (!this.isDesktop()) {
                if (!this.menuClick) {
                    this.menuActiveMobile = false;
                }

                if (!this.topMenuButtonClick) {
                    this.hideTopMenu();
                }
            }

            this.menuClick = false;
            this.topMenuButtonClick = false;
        });
    }

    toggleMenu(event: Event) {

        this.menuClick = true;
        if (this.isDesktop()) {
            this.menuInactiveDesktop = !this.menuInactiveDesktop;
            if (this.menuInactiveDesktop) {
                this.menuActiveMobile = false;
            }
        } else {
            this.menuActiveMobile = !this.menuActiveMobile;
            if (this.menuActiveMobile) {
                this.menuInactiveDesktop = false;
            }
        }

        if (this.topMenuActive) {
            this.hideTopMenu();
        }

        event.preventDefault();
    }

    toggleProfile(event: Event) {
        this.profileActive = !this.profileActive;
        event.preventDefault();
    }

    toggleTopMenu(event: Event) {
        this.topMenuButtonClick = true;
        this.menuActiveMobile = false;

        if (this.topMenuActive) {
            this.hideTopMenu();
        } else {
            this.topMenuActive = true;
        }

        event.preventDefault();
    }

    NavigateToPaymentApp(event: Event) {
        console.log("NavigateToPaymentApp");
        // if (!this.packagePurchaseHelper.CheckAvailablePackageCount()) {
        if (!this.packagePurchaseHelper.CheckAvailablePaidPDFCount()) {
            this.packagePurchaseHelper.NavigateToPackageApp();
        } else {
            alert('You have enough package to process bills..');
        }

    }

    hideTopMenu() {
        this.topMenuLeaving = true;
        setTimeout(() => {
            this.topMenuActive = false;
            this.topMenuLeaving = false;
        }, 500);
    }

    onMenuClick() {
        this.menuClick = true;

        setTimeout(() => { this.scrollerViewChild.moveBar(); }, 500);
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    onSearchClick() {
        this.topMenuButtonClick = true;
    }


    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }
    getSubscribedPlan() {
        this.api.get('Plan/GetAccountSubscribedPlan', '').subscribe(
            (res: {}) => this.sucessGetSubscribedPlan(res),
            error => this.failedGetSubscribedPlan(<any>error));
    }

    getSubscribedPlan1() {

        this.api.get('Plan/GetAccountSubscribedPlan', '').subscribe(
            (res: {}) => {

                this.sucessGetSubscribedPlan1(res)
            },
            error => this.failedGetSubscribedPlan(<any>error));
    }

    getStartofAutoRenwalInfo() {
        this.api.get('Plan/GetStartOfAutoRenewalInfo', '').subscribe(
            (res: {}) => this.sucessGetStartofAutoRenwalInfo(res),
            error => this.failedGetSubscribedPlan(<any>error));
    }

    sucessGetStartofAutoRenwalInfo(res: any) {
        this.subscriptionAutoRenew = res.Data;
        console.log("let  start date time is:" + this.subscriptionAutoRenew.firstIsAutoDate);
        this.packagePurchaseHelper.sucessGetSubscribedPlanForAutoRenew(res);
        this.ss.storeTotalAllocatedPDF(this.subscriptionAutoRenew.totalAllocatedPdf);


        this.spinner.hide();

    }

    sucessGetSubscribedPlan(res: any) {
        this.subscribedPlan = res.Data;

        this.subscribedPlan.IsEligibleForXeroPlanOws = this.packagePurchaseHelper.UserIsEligibleForXeroPlanOws;
        console.log('subscribedPlan' + this.subscribedPlan);
        if (!this.subscribedPlan.IsPaidPlan) {
            //if the user has subscribed for paid version ever then the count should be 0 else continue.
            //if(everSubvScribedPlan) then tottal avail =0 else getTotalTrialPdfUsed
            if (this.subscribedPlan.everSubPlan) {
                this.totalTrialPdf = 0;
                this.ss.storeTrialPdfCount(this.totalTrialPdf, true);
                this.wheatherShowAutoRenewMessage();
            }
            else {
                if (this.subscribedPlan.planId == 1019) {
                    //month changes from subscription plan startdatetime
                    //give user 20 pdfs to use as trial
                    //database 20 plan ni entry

                }
                else {
                    this.getTotalTrialPdfUsed();
                }

            }
        } else {
            //if auto renew is on then only proceed
            //if this is less than 365 days to continue the flow else make avail pdf count to 0


            let PlanStartDateTime = new Date(this.subscribedPlan.StartDateTime);
            console.log("Old PlanStartDateTime is:" + PlanStartDateTime);
            let todayDate = new Date();
            console.log("todayDate is:" + todayDate);
            const diffTime = Math.abs(todayDate.getTime() - PlanStartDateTime.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            console.log("days diff is:" + diffDays);
            // var diff=Math.ceil(todaydate-cdate1);
            // check for if plan subscription is older than
            if (diffDays <= 365) {
                if (this.subscribedPlan.IsAutoRenew) {
                    console.log("flow 0");
                    this.getTotalPaidPdfUsed();
                }
                else {
                    console.log("this.subscribedPlan.StartMonth:" + this.subscribedPlan.StartMonth);
                    console.log("todayDate.getMonth():" + (todayDate.getMonth() + 1));
                    console.log("this.subscribedPlan.StartYear:" + this.subscribedPlan.StartYear);
                    console.log("todayDate.getFullYear():" + todayDate.getFullYear());
                    if ((this.subscribedPlan.StartMonth == todayDate.getMonth() + 1)
                        && (this.subscribedPlan.StartYear == todayDate.getFullYear())) {
                        console.log("flow 1");
                        this.getTotalPaidPdfUsed();
                    }
                    else {
                        console.log("flow 2");
                        this.setTotalPaidPdfToZero();
                    }
                }
            }
            else {
                console.log("flow 3");
                this.setTotalPaidPdfToZero();
            }

        }

    }

    private setTotalPaidPdfToZero() {
        this.totalPaidPdf = 0;
        this.ss.storePaidPdfCount(this.totalPaidPdf, true);
        this.wheatherShowAutoRenewMessage();
    }

    sucessGetSubscribedPlan1(res: any) {
        this.subscribedPlan = res.Data;


        console.log('subscribedPlan' + this.subscribedPlan);
         //debugger;
        if (!this.subscribedPlan.IsPaidPlan) {
            //if the user has subscribed for paid version ever then the count should be 0 else continue.
            //if(everSubvScribedPlan) then tottal avail =0 else getTotalTrialPdfUsed
            if (this.subscribedPlan.everSubPlan) {
                this.totalTrialPdf = 0;
                this.ss.storeTrialPdfCount(this.totalTrialPdf, true);
                this.wheatherShowAutoRenewMessage();
            }
            else {
                console.log("we have to get 20 trial pdfs");
                let todayDate = new Date();
                if ((this.subscribedPlan.StartMonth + 1) == todayDate.getMonth() + 1) {
                    console.log("this.ss.fetchUserName() is:" + this.ss.fetchUserName());

                    // locking auto renewal for test user. Do remove this when making this feature live for all
                    this.callAutorenewalTrialPlan();
                    console.log("done updateing trial plan using api call");
                }
                this.getTotalTrialPdfUsed();
            }
        } else {
            //if auto
            // this.spinner.show();

            // await this.delay(5000);

            // renew is on then only proceed
            //if this is less than 365 days to continue the flow else make avail pdf count to 0
            console.log("error check 1 : " + this.subscriptionAutoRenew.firstIsAutoDate);

            let PlanStartDateTime = new Date(this.subscriptionAutoRenew.firstIsAutoDate);
            console.log("PlanStartDateTime is:" + PlanStartDateTime);
            let todayDate = new Date();
            console.log("todayDate is:" + todayDate);
            const diffTime = Math.abs(todayDate.getTime() - PlanStartDateTime.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            console.log("days diff is:" + diffDays);
            // let todayDate = new Date();
            // check for if plan subscription is older than
            //diffdays will be calculated for firstaut
            if (diffDays <= 365) {
                if (this.subscribedPlan.IsAutoRenew) {
                    console.log("flow 0");
                    this.totalPaidPdf = this.subscriptionAutoRenew.totalAllocatedPdf - this.subscriptionAutoRenew.totalUsedPdf;
                    this.ss.storePaidPdfCount(this.totalPaidPdf, true);
                    //[x] When (auto renew is ture) && (diffDays <=365 is true) && (new month start)
                    //[] then auto renew the subsciption plan
                    console.log("//[] then auto renew the subsciption plan");
                    if ((this.subscribedPlan.StartMonth + 1) == todayDate.getMonth() + 1) {
                        console.log("this.ss.fetchUserName() is:" + this.ss.fetchUserName());

                        // locking auto renewal for test user. Do remove this when making this feature live for all
                        this.callAutorenewal();
                        console.log("//[] then add unsedPdfScans on top of renewed");
                    }
                }
                else {
                    console.log("this.subscribedPlan.StartMonth:" + this.subscribedPlan.StartMonth);
                    console.log("todayDate.getMonth():" + (todayDate.getMonth() + 1));
                    console.log("this.subscribedPlan.StartYear:" + this.subscribedPlan.StartYear);
                    console.log("todayDate.getFullYear():" + todayDate.getFullYear());
                    if (this.subscribedPlan.StartMonth == todayDate.getMonth() + 1
                        && this.subscribedPlan.StartYear == todayDate.getFullYear()) {
                        console.log("flow 1");
                        this.getTotalPaidPdfUsed();
                    }
                    else {
                        console.log("flow 2");
                        this.setTotalPaidPdfToZero();

                    }
                }
            }
            else {
                console.log("flow 3");

                // greater than 365
                // check is auto renew for latest startdatetime
                // if it is true then auto renew it and return the data according to

                if (this.subscribedPlan.IsAutoRenew) {
                    console.log("you are here coz 365 days are up");

                    //call auto renew
                    //again get the data for total used and allocated
                    this.callAutorenewal();
                    console.log("this triggerd after 365 days are up");

                }
                else {
                    this.setTotalPaidPdfToZero();
                }
            }

        }

    }

    async callAutorenewal() {
        console.log("is auto renewal: " + this.subscribedPlan.IsAutoRenew + " & isPaid plan? : " + this.subscribedPlan.IsPaidPlan);

        if (this.subscribedPlan.IsAutoRenew && this.subscribedPlan.IsPaidPlan) {
            this.loadingMessage = "Auto Renewal...";
            console.log(" IsAutoRenewal true");
            this.api.post('Admin/AutoRenewal', null).subscribe(
                (res1: {}) => { console.log("homelayout TS autorenewalSuccess"); console.log(res1); },
                error => { console.log("homelayout TS autorenewalfailed"); console.log(error); }

            );
            await this.delay(15000);
            this.getStartofAutoRenwalInfo();
            this.wheatherShowAutoRenewMessage();

        }
    }
    async callAutorenewalTrialPlan() {
        console.log("Trial plan is auto renewal: " + this.subscribedPlan.IsAutoRenew + " & isPaid plan? : " + this.subscribedPlan.IsPaidPlan);

        if (!this.subscribedPlan.IsPaidPlan) {
            this.loadingMessage = "Auto Renewal...";
            console.log(" IsAutoRenewal true trial");
            this.api.post('Admin/AutoRenewal', null).subscribe(
                (res1: {}) => { console.log("homelayout TS autorenewalSuccess"); console.log(res1); },
                error => { console.log("homelayout TS autorenewalfailed"); console.log(error); }

            );
            await this.delay(15000);
            this.getSubscribedPlan();
            // this.getTotalTrialPdfUsed();
        }
    }

    getTotalPaidPdfUsed() {
        this.api.get('Plan/GetTotalPaidPdfUsed', '').subscribe(
            (res: {}) => this.sucessGetTotalPaidPdfUsed(res),
            error => this.failedGetTotalPaidPdfUsed(<any>error));
    }

    sucessGetTotalPaidPdfUsed(res: any) {
        if (res.Data != null) {
            this.totalPaidPdf = this.subscribedPlan.TotalAllocatePDF - res.Data.TotalPaidUsed;
            this.ss.storePaidPdfCount(this.totalPaidPdf, true);
            this.wheatherShowAutoRenewMessage();
        }

        //SICI-A: Why is it sending Mail for remaining trial PDF when user has purchased a Paid plan?
        if (this.totalPaidPdf >= 0 && this.totalPaidPdf <= 20) {
            this.api.get('Plan/SendRemainingTrialPdfMail?RemainingTrialPDF=', this.totalTrialPdf).subscribe(
                (res: {}) => this.failedGetTotalPaidPdfUsed(res),
                error => this.failedGetTotalPaidPdfUsed(<any>error));
        }
    }

    failedGetTotalPaidPdfUsed(res: any) {

    }
    failedGetSubscribedPlan(res: any) {

    }

    getTotalTrialPdfUsed() {

        this.api.get('Plan/GetTotalTrialPdfUsed', '').subscribe(
            (res: {}) => this.sucessGetTotalTrialPdfUsed(res),
            error => this.failedGetTotalTrialPdfUsed(<any>error));
    }

    wheatherShowAutoRenewMessage() {
        var availableTotalPdfCount = this.packagePurchaseHelper.GetAvailablePDf();
        console.log("availableTotalPdfCount is:" + availableTotalPdfCount)

        if (availableTotalPdfCount < 1 || availableTotalPdfCount == undefined) {
            if (this.packagePurchaseHelper.IsAutoRenewal && this.packagePurchaseHelper.IsPaidPlan) {
                this.showAutoRenewwalMessage = true;
                return;
            }
        }
        this.showAutoRenewwalMessage = false;
    }

    sucessGetTotalTrialPdfUsed(res: any) {
        console.log("this.subscribedPlan.TrialPdf  is:" + this.subscribedPlan.TrialPdf + " and res.Data.TotalTrialUsed is:" + res.Data.TotalTrialUsed);
        if (res.Data != null) {
            this.totalTrialPdf = this.subscribedPlan.TrialPdf - res.Data.TotalTrialUsed;
            this.ss.storeTrialPdfCount(this.totalTrialPdf, true);
            this.wheatherShowAutoRenewMessage();
        }

    }

    failedGetTotalTrialPdfUsed(res: any) {

    }


}
