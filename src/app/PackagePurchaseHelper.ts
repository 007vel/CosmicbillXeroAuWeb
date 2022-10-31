import { Component, Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { StoreService } from "./store.service";
import {  ConfirmationService } from 'primeng/api';


@Injectable({
  providedIn: 'root'
})
export class PackagePurchaseHelper
{
    subscribedPlan:any=0;
    totalTrialPdf:Number = 0;
    totalPaidPdf:Number = 0;
    private isPackageInfoFetched = false;
    loadingMessage: any = "Loading...";
    constructor(private api: ApiService, private ss: StoreService,private confirmationService: ConfirmationService,)
    {
        
    }
    public NavigateToPackageApp() {
  
        console.log("NavigateToPaymentApp");
        
    window.open(this.api.Paymentapp+"?UserId="+ this.ss.fetchUserName()+
    "&Email="+ this.ss.fetchEmail()+
    "&Region=AUS&ReturnUrl="+encodeURIComponent( this.api.PaymentappReturnUrl)+"&AccountId="+this.ss.fetchCosmicAccountID(), "_blank");
      }

      
  private getTotalPaidPdfUsed() {
    this.api.get('Plan/GetTotalPaidPdfUsed', '').subscribe(
      (res: {}) => this.sucessGetTotalPaidPdfUsed(res),
      error => this.failedGetTotalPaidPdfUsed(<any>error)); 
  }

  private sucessGetTotalPaidPdfUsed(res: any) : string{
    if (res.Data != null) {
      this.totalPaidPdf = this.subscribedPlan.TotalAllocatePDF - res.Data.TotalPaidUsed;
     // debugger;
      this.isPackageInfoFetched = true;
      return this.subscribedPlan.TotalAllocatePDF;
    }
    
    // if(this.totalPaidPdf>=0 && this.totalPaidPdf<=20){
    //     this.api.get('Plan/SendRemainingTrialPdfMail?RemainingTrialPDF=',this.totalTrialPdf).subscribe(
    //         (res: {}) => this.failedGetTotalPaidPdfUsed(res),
    //         error => this.failedGetTotalPaidPdfUsed(<any>error));
    // }
  }
  private sucessGetTotalTrialPdfUsed(res: any) {
    if (res.Data != null) {
      this.totalTrialPdf =  this.subscribedPlan.TrialPdf - res.Data.TotalTrialUsed;
    //  debugger;
      this.isPackageInfoFetched = true;
    }
    
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

  public CheckAvailablePackageCount() : boolean
  {
   // debugger;
    if(this.totalTrialPdf < 1)
    {
      if(this.totalPaidPdf<1 )
      {
        // this.confirmationService.confirm({
        //   message: "You don't have enough package to process bills3, please select package...",
        //   accept: () => {
        //     this.loadingMessage = "Package selection...";
        //     this.NavigateToPackageApp();
        //     window.close();
        //   },
        //   reject: () => {
        //   }
        // });
        return false;

      }else{
        //bill process
        return true;
      }
    }else{
      //bill process
      return true;
    }
  }

  private failedGetTotalTrialPdfUsed(res: any) {
    
  }

  public getSubscribedPlan() {
    this.api.get('Plan/GetAccountSubscribedPlan', '').subscribe(
      (res: {}) => this.sucessGetSubscribedPlan(res),
      error => this.failedGetSubscribedPlan(<any>error));

  }

  private sucessGetSubscribedPlan(res: any) {
    this.subscribedPlan = res.Data;
      
    console.log('subscribedPlan'+ this.subscribedPlan);
    if(!this.subscribedPlan.IsPaidPlan){
        this.getTotalTrialPdfUsed();
    }else{
        this.getTotalPaidPdfUsed();
    }
    
  }
}