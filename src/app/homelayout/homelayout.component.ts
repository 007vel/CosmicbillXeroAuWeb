
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



    constructor(private api: ApiService, private router: Router, public renderer: Renderer2, private ss: StoreService,
        private packagePurchaseHelper: PackagePurchaseHelper, private confirmationService: ConfirmationService,
        protected cosmicNotifyService: CosmicNotifyService) {


        this.companyName = this.ss.fetchCompanyName();
        if (this.companyName == '' || this.companyName == null) {
            this.companyName = "No company is connected, Connect a company from Switch Company menu";
        }

        this.getSubscribedPlan();
        this.packagePurchaseHelper.getSubscribedPlan();

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
            else{
                this.getTotalTrialPdfUsed();
            }
        } else {
            //if auto renew is on then only proced
            //if this is less than 365 days to continue the flow else make avail pdf count to 0 

            let PlanStartDateTime = new Date(this.subscribedPlan.StartDateTime);
            let todayDate = new Date();
            const diffTime = Math.abs(todayDate.getTime() - PlanStartDateTime.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // var diff=Math.ceil(todaydate-cdate1);
            if (diffDays <= 365) {
                if (this.subscribedPlan.IsAutoRenew) {
                    this.getTotalPaidPdfUsed();
                }
                else {
                    if(this.subscribedPlan.StartMonth == todayDate.getMonth() 
                    && this.subscribedPlan.StartYear == todayDate.getFullYear())
                    {
                        this.getTotalPaidPdfUsed();
                    }
                    else{
                        this.totalPaidPdf = 0;
                                        this.ss.storePaidPdfCount(this.totalPaidPdf, true);
                                        this.wheatherShowAutoRenewMessage(); 
                    }
                }
            }
            else {
                this.totalPaidPdf = 0;
                this.ss.storePaidPdfCount(this.totalPaidPdf, true);
                this.wheatherShowAutoRenewMessage();
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


}
