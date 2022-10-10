
import { Component,OnInit, AfterViewInit, OnDestroy,Output,EventEmitter, ViewChild, Renderer2,ViewEncapsulation} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ConfirmationService, ScrollPanel } from 'primeng/primeng';
import { StoreService } from '../store.service';
import './homelayout.component.css';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Console } from 'console';
import { PackagePurchaseHelper } from '../PackagePurchaseHelper';
import { Alert } from 'selenium-webdriver';
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

  subscribedPlan:any=null;
  totalTrialPdf:any = 100;
  totalPaidPdf:any = null;

  public companyName: String = "No company is connected, Connect a company from Switch Company menu";

  

  @ViewChild('scroller') public scrollerViewChild: ScrollPanel;
  documentClickListener: Function;

  menuClick: boolean;

  topMenuButtonClick: boolean;



  constructor( private api: ApiService, private router: Router,public renderer: Renderer2, private ss: StoreService, private packagePurchaseHelper: PackagePurchaseHelper,private confirmationService: ConfirmationService) {
    

    this.companyName = this.ss.fetchCompanyName();
    if(this.companyName == '' || this.companyName == null){
        this.companyName = "No company is connected, Connect a company from Switch Company menu";
    }
    
    this.getSubscribedPlan();
    this.packagePurchaseHelper.getSubscribedPlan();

    this.CheckAvailablePDFCount();
  }
    ngOnInit() {
        
    }
    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    private async CheckAvailablePDFCount()
    {
        await this.delay(1000);
        this.checkPDFcount(this.packagePurchaseHelper, this.confirmationService);
    }

    private checkPDFcount(packagePurchaseHelper : PackagePurchaseHelper, confirmationService : ConfirmationService)
    {
        if(packagePurchaseHelper.CheckAvailablePackageCount())
        {
            //PDF are available
        }else{
          confirmationService.confirm({
            message: "You don't have enough package to process bills, please select package...",
            accept: () => {
              //this.loadingMessage = "Package selection...";
              packagePurchaseHelper.NavigateToPackageApp();
              window.close();
            },
            reject: () => {
            }
        });
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

  NavigateToPaymentApp(event: Event)
  {
    console.log("NavigateToPaymentApp");
    if(!this.packagePurchaseHelper.CheckAvailablePackageCount())
    {   
        this.packagePurchaseHelper.NavigateToPackageApp();
    }else{
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
      
    console.log('subscribedPlan'+ this.subscribedPlan);
    if(!this.subscribedPlan.IsPaidPlan){
        this.getTotalTrialPdfUsed();
    }else{
        this.getTotalPaidPdfUsed();
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
    }
    
    if(this.totalPaidPdf>=0 && this.totalPaidPdf<=20){
        this.api.get('Plan/SendRemainingTrialPdfMail?RemainingTrialPDF=',this.totalTrialPdf).subscribe(
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

  sucessGetTotalTrialPdfUsed(res: any) {
    if (res.Data != null) {
      this.totalTrialPdf =  this.subscribedPlan.TrialPdf - res.Data.TotalTrialUsed;
    }
    
  }

  failedGetTotalTrialPdfUsed(res: any) {
    
  }

  
}
