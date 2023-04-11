
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

    public companyName: String = "No company is connected, Connect a company from Switch Company menu";



    @ViewChild('scroller') public scrollerViewChild: ScrollPanel;
    documentClickListener: Function;

    menuClick: boolean;

    topMenuButtonClick: boolean;
    loadingMessage: string;



    constructor(private api: ApiService, private router: Router, public renderer: Renderer2, private ss: StoreService,
        private packagePurchaseHelper: PackagePurchaseHelper, private confirmationService: ConfirmationService,
        private spinner: NgxSpinnerService,
        protected cosmicNotifyService: CosmicNotifyService) {


        this.companyName = this.ss.fetchCompanyName();
        if (this.companyName == '' || this.companyName == null) {
            this.companyName = "No company is connected, Connect a company from Switch Company menu";
        }
        this.packagePurchaseHelper.getSubscribedPlan();
        this.getSubscribedPlan1();

        this.CheckAvailablePDFCount();
    }
    ngOnInit() {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>> ngOnInit cosmicNotifyService");
        this.cosmicNotifyService.myEventEmiter.subscribe(
            () => {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>> cosmicNotifyService");
                this.getSubscribedPlan();
            }
        );
    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        if (!this.packagePurchaseHelper.CheckAvailablePackageCount()) {
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
            (res: {}) => this.sucessGetSubscribedPlan1(res),
            error => this.failedGetSubscribedPlan(<any>error));
    }

    sucessGetSubscribedPlan(res: any) {
        this.subscribedPlan = res.Data;

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
                this.getTotalTrialPdfUsed();
            }
        } else {
            //if auto renew is on then only proceed
            //if this is less than 365 days to continue the flow else make avail pdf count to 0

            let PlanStartDateTime = new Date(this.subscribedPlan.StartDateTime);
            console.log("PlanStartDateTime is:" + PlanStartDateTime);
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

                    //[x] When (auto renew is ture) && (diffDays <=365 is true) && (new month start)
                    //[] then auto renew the subsciption plan
                    // console.log("//[] then auto renew the subsciption plan");
                    // this.spinner.show();
                    //call auto renew after month change
                    // if((this.subscribedPlan.StartMonth+1) == todayDate.getMonth()+1)
                    // {
                    //     console.log("this.ss.fetchUserName() is:"+this.ss.fetchUserName());

                    //     if(this.ss.fetchUserName()==="Aceaj95a58"){
                    //         //get the remaining pdf count
                    //         let remainPDF= this.ss.fetchPaidPdfCount();

                    //         console.log("past month pdf is: "+ remainPDF);
                    //     // console.log("this.ss.fetchUserName() is:"+this.ss.fetchUserName());

                    //         this.callAutorenewal(remainPDF);
                    //         //add to the new one

                    //          //[] then add unsedPdfScans on top of renewed pdf
                    // console.log("//[] then add unsedPdfScans on top of renewed");


                    //     }
                    // }
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
                        this.totalPaidPdf = 0;
                        this.ss.storePaidPdfCount(this.totalPaidPdf, true);
                        this.wheatherShowAutoRenewMessage();
                    }
                }
            }
            else {
                this.totalPaidPdf = 0;
                console.log("flow 3");
                this.ss.storePaidPdfCount(this.totalPaidPdf, true);
                this.wheatherShowAutoRenewMessage();
            }

        }

    }

    sucessGetSubscribedPlan1(res: any) {
        this.subscribedPlan = res.Data;

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
                this.getTotalTrialPdfUsed();
            }
        } else {
            //if auto renew is on then only proceed
            //if this is less than 365 days to continue the flow else make avail pdf count to 0

            let PlanStartDateTime = new Date(this.subscribedPlan.StartDateTime);
            console.log("PlanStartDateTime is:" + PlanStartDateTime);
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

                    //[x] When (auto renew is ture) && (diffDays <=365 is true) && (new month start)
                    //[] then auto renew the subsciption plan
                    console.log("//[] then auto renew the subsciption plan");
                    // this.spinner.show();
                    //call auto renew after month change
                    if ((this.subscribedPlan.StartMonth + 1) == todayDate.getMonth() + 1) {
                        console.log("this.ss.fetchUserName() is:" + this.ss.fetchUserName());

                        if (this.ss.fetchUserName() === "Aceaj95a58") {
                            //get the remaining pdf count

                            let remainPDF = this.ss.fetchPaidPdfCount();

                            console.log("past month pdf is: " + remainPDF);
                            // console.log("this.ss.fetchUserName() is:"+this.ss.fetchUserName());

                            this.callAutorenewal(remainPDF);
                            //add to the new one

                            //[] then add unsedPdfScans on top of renewed pdf
                            console.log("//[] then add unsedPdfScans on top of renewed");


                        }
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
                        this.totalPaidPdf = 0;
                        this.ss.storePaidPdfCount(this.totalPaidPdf, true);
                        this.wheatherShowAutoRenewMessage();
                    }
                }
            }
            else {
                this.totalPaidPdf = 0;
                console.log("flow 3");
                this.ss.storePaidPdfCount(this.totalPaidPdf, true);
                this.wheatherShowAutoRenewMessage();
            }

        }

    }

    async callAutorenewal(remainPDF) {
        if (this.packagePurchaseHelper.IsAutoRenewal && this.packagePurchaseHelper.IsPaidPlan) {
            this.loadingMessage = "Auto Renewal...";
            console.log(" IsAutoRenewal true");
            this.api.post('Admin/AutoRenewal', null).subscribe(
                (res1: {}) => { console.log("homelayout TS autorenewalSuccess"); console.log(res1); },
                error => { console.log("homelayout TS autorenewalfailed"); console.log(error); }

            );
            await this.delay(15000);
            this.packagePurchaseHelper.getSubscribedPlan();
            await this.delay(4000);
            var availableTotalPdfCount = this.packagePurchaseHelper.GetAvailablePDf() + remainPDF;
            this.totalPaidPdf = availableTotalPdfCount;
            this.ss.storePaidPdfCount(this.totalPaidPdf, true);
            this.wheatherShowAutoRenewMessage();
            console.log("new availableTotalPdfCOunt:" + availableTotalPdfCount);

            if (availableTotalPdfCount < 1 || availableTotalPdfCount == undefined) {
                return;
            }
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
        if (res.Data != null) {
            this.totalTrialPdf = this.subscribedPlan.TrialPdf - res.Data.TotalTrialUsed;
            this.ss.storeTrialPdfCount(this.totalTrialPdf, true);
            this.wheatherShowAutoRenewMessage();
        }

    }

    failedGetTotalTrialPdfUsed(res: any) {

    }

    //ToDo: write a function that will auto renew the package at the start of every month only if the autonew is ON and add the remaining pdf-usage on top.
    /**
     * open a sub-id column (property) for each pdf used.
     * eg.
     * |Sr no|sub id | pdf scanned id|.....
     * +-----+-------+---------------+.....
     * |    3|  43   | 2345          |.....
     * +-----+-------+---------------+.....
     * |    5|  43   | 2346          |.....
     *
     * this way we just oucnt the sub id is scanned pdf and
     */


}
