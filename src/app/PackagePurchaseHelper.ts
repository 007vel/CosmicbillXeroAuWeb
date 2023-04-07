import { Component, Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { StoreService } from "./store.service";
import { ConfirmationService } from 'primeng/api';
import { CosmicNotifyService } from "./CosmicNotifyService";


@Injectable({
    providedIn: 'root'
})
export class PackagePurchaseHelper {
    subscribedPlan: any = 0;
    totalTrialPdf: Number = 0;
    totalPaidPdf: Number = 0;
    private isPackageInfoFetched = false;
    loadingMessage: any = "Loading...";
    IsPaidPlan: boolean;
    IsAutoRenewal: boolean;
    constructor(private api: ApiService, private ss: StoreService, private confirmationService: ConfirmationService, protected cosmicNotifyService: CosmicNotifyService) {

    }
    public NavigateToPackageApp() {

        console.log("NavigateToPaymentApp");

        window.open(this.api.Paymentapp + "?UserId=" + this.ss.fetchUserName() +
            "&Email=" + this.ss.fetchEmail() +
            "&Region=AUS&ReturnUrl=" + encodeURIComponent(this.api.PaymentappReturnUrl) + "&AccountId=" + this.ss.fetchCosmicAccountID(), "_blank");
    }


    private getTotalPaidPdfUsed() {
        this.api.get('Plan/GetTotalPaidPdfUsed', '').subscribe(
            (res: {}) => this.sucessGetTotalPaidPdfUsed(res),
            error => this.failedGetTotalPaidPdfUsed(<any>error));
    }

    private sucessGetTotalPaidPdfUsed(res: any) {
        if (res.Data != null) {
            this.totalPaidPdf = this.subscribedPlan.TotalAllocatePDF - res.Data.TotalPaidUsed;
            this.ss.storePaidPdfCount(this.totalPaidPdf, true);
            // debugger;
            this.isPackageInfoFetched = true;
            this.cosmicNotifyService.myEventEmiter.emit();
        }
    }
    private sucessGetTotalTrialPdfUsed(res: any) {
        if (res.Data != null) {
            this.totalTrialPdf = this.subscribedPlan.TrialPdf - res.Data.TotalTrialUsed;
            this.ss.storeTrialPdfCount(this.totalTrialPdf, true);
            //  debugger;
            this.isPackageInfoFetched = true;
        }
        this.cosmicNotifyService.myEventEmiter.emit();
    }

    private failedGetTotalPaidPdfUsed(res: any) {

    }
    private failedGetSubscribedPlan(res: any) {

    }


    private getTotalTrialPdfUsed() {

        this.api.get('Plan/GetTotalTrialPdfUsed', '').subscribe(
            (res: {}) => this.sucessGetTotalTrialPdfUsed(res),
            error => this.failedGetTotalTrialPdfUsed(<any>error));
    }

    public CheckAvailablePackageCount(): boolean {
        // debugger;
        if (this.ss.fetchTrialPdfCount() < 1) {
            if (this.ss.fetchPaidPdfCount() < 1) {
                return false;

            } else {
                //bill process
                return true;
            }
        } else {
            // uncomment below to return true if you want to lock the purchase window when there is trail pdf count > 0
            return true;
            //bill process
            // return false
        }
    }

    public CheckAvailablePaidPDFCount(): boolean {
        // debugger;
        if (this.ss.fetchPaidPdfCount() < 1) {
            return false;

        } else {
            //bill process
            return true;
        }

    }

    public GetAvailablePDf(): any {
        console.log("fetchPaidPdfCount is:" + this.ss.fetchPaidPdfCount());
        console.log("fetchTrialPdfCount is:" + this.ss.fetchTrialPdfCount());
        if (this.ss.fetchTrialPdfCount() > 0) {
            return this.ss.fetchTrialPdfCount();
        }

        if (this.ss.fetchPaidPdfCount() > 0) {
            return this.ss.fetchPaidPdfCount();
        }

        return 0;
    }

    private failedGetTotalTrialPdfUsed(res: any) {

    }

    public getSubscribedPlan()  // Use this mrthod, if need force call for package availability
    {
        this.api.get('Plan/GetAccountSubscribedPlan', '').subscribe(
            (res: {}) => this.sucessGetSubscribedPlan(res),
            error => this.failedGetSubscribedPlan(<any>error));

    }

    private sucessGetSubscribedPlan(res: any) {
        this.subscribedPlan = res.Data;

        console.log('subscribedPlan' + this.subscribedPlan);
        this.IsAutoRenewal = this.subscribedPlan.IsAutoRenew;
        this.IsPaidPlan = this.subscribedPlan.IsPaidPlan;
        if (!this.subscribedPlan.IsPaidPlan) {
            // 1 in cur year any paid ---1--last puchased--rem---carry forwd
            //0--trial
            this.getTotalTrialPdfUsed();
        } else {
            this.getTotalPaidPdfUsed();
        }

    }
    public sucessGetSubscribedPlanForAutoRenew(res: any) {
        this.subscribedPlan = res.Data;

        console.log('subscribedPlan' + this.subscribedPlan);
        this.IsAutoRenewal = true;
        this.totalPaidPdf = this.subscribedPlan.totalAllocatedPdf

    }
}
