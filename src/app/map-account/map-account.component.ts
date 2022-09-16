import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { StoreService } from '../store.service';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Message, SelectItem, ConfirmationService } from 'primeng/primeng';
import { MenuItem } from 'primeng/api';



@Component({
  selector: 'app-map-account',
  templateUrl: './map-account.component.html',
  styleUrls: ['./map-account.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService, ConfirmationService]
})
export class MapAccountComponent implements OnInit {

  activeIndex: number = 0;
  steps: MenuItem[];
  xeroVendAcctDefault: any = [];
  xeroVendors: SelectItem[] = [];
  xeroAccounts: SelectItem[] = [];
  xeroAccountIDSelected: any = 0;
  msgs: Message[] = [];
  loadingMessage:any = "Loading...";

  constructor(private router: Router, private api: ApiService, private spinner: NgxSpinnerService, private ss: StoreService,
    private confirmationService: ConfirmationService) { }

  ngOnInit() {
   // this.checkXeroToken();
    
    this.bindAccounts();
    this.bindVendAcctDefault();

    this.steps = [
      {
        label: 'Map Supplier Default Account',
        command: (event: any) => {
          this.activeIndex = 0;
          this.router.navigateByUrl('/mapaccount');
         }
      },
      {
      label: 'Upload Document',
      command: (event: any) => {
        this.activeIndex = 1;
        this.router.navigateByUrl('/docupload');
       }
    },
    {
      label: 'Review and Approve',
      command: (event: any) => {
        this.activeIndex = 2;
        this.router.navigateByUrl('/docreview');
      }
    },
    {
      label: 'Post To Accounting System',
      command: (event: any) => {
        this.activeIndex = 3;
        this.router.navigateByUrl('/docpost');
      }
    }
    // ,
    // {
    // label: 'Post to Authorised',
    // command: (event: any) => {
    //   this.activeIndex = 4;
    //   this.router.navigateByUrl('/docauth');
    // }
    // }
    ];

    
  }

  // checkXeroToken() {
  //   var xeroID =this.ss.fetchXeroConnectID();
  //   this.api.get('Xero/CheckXeroToken?XeroID='+ xeroID,"").subscribe(
  //     (res: {}) => this.validateCheckXeroToken(res),
  //     error => this.failedCheckXeroToken(<any>error));
  // }
  
  // validateCheckXeroToken(res: any) {
  //   var token = this.ss.fetchToken();
  //    if (res.StatusCode == 0) {
   
  //      if (res.Data.XeroTokenMinute < 0) {
  //        window.location.href = this.api.xeroConnectUrl + token.toString();
  //      }
       
  //    }
  //  }
  
  // failedCheckXeroToken(res: any) {
  //   var token = this.ss.fetchToken();
  //   this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
  // }




  // bindVendors() {

  //   var tmpVendor = this.ss.fetchXeroVendors();
  //   this.XeroVendors.push({ label: '', value: '' });
  //   tmpVendor.forEach(element => {
  //     this.XeroVendors.push({ label: element.DisplayNameField, value: element.XeroVendorID });
  //   });
  // }

  bindAccounts() {

    var tmpAccounts = this.ss.fetchXeroAccounts();
    if(tmpAccounts == null) return;

    this.xeroAccounts.push({ label: '', value: '' });

    tmpAccounts.forEach(element => {
      this.xeroAccounts.push({ label: element.FullyQualifiedNameField, value: element.XeroAccountID });
    });
  }


  bindVendAcctDefault() {


    this.spinner.show();
    this.loadingMessage = "Getting Suppliers..."

    this.api.get('Xero/GetAllVendor?isRefresh=false', '').subscribe(
      (res: {}) => this.sucessGetVendAcct(res),
      error => this.failedGetVendAcct(<any>error));
  }

  sucessGetVendAcct(resp: any) {
    console.log('vend:' + resp.Data);
    this.spinner.hide();

    this.xeroVendAcctDefault = resp.Data;

  }

  failedGetVendAcct(resp: any) {
    console.log(resp);
    this.spinner.hide();
  }


  confirm() {

    if (this.xeroAccountIDSelected == 0) {
      this.msgs = [];
      this.msgs.push({ severity: 'Info', summary: 'Please select a account first', detail: 'Mandatory.' });
      return;
    }

    if (this.xeroVendAcctDefault.find(xx => xx.Select == true) == null) {
      this.msgs = [];
      this.msgs.push({ severity: 'Info', summary: 'Please select atleast a Suppliers first', detail: 'Mandatory.' });
      return;
    }



    this.confirmationService.confirm({
      message: 'Are you sure that you want to assgin selected Account as default account for all the suppliers selected in below grid',
      accept: () => {

        this.spinner.show();
        this.loadingMessage = "Saving changes...";

        this.xeroVendAcctDefault.forEach(element => {
          if(element.Select){
            element.XeroAccountID = this.xeroAccountIDSelected;
          }
          
        });

        //Actual logic to perform a confirmation
        //Approve the bill

        this.api.post('Xero/SaveAllVendAcctDefault', this.xeroVendAcctDefault).subscribe(
          (res1: {}) => this.successSaveAll(res1),
          error => this.failedSaveAll(<any>error));
      },
      reject: () => {
        this.xeroAccountIDSelected = 0;
      }
    });
  }

  successSaveAll(resp:any){
    this.spinner.hide();
  }

  failedSaveAll(resp:any){
    this.spinner.hide();
  }


  onXeroVendAcctSelect(event) {

    // this.XeroDocumentSelected = event.data;
    // this.XeroVendorSelected.XeroVendorID = this.XeroDocumentSelected.XeroVendorID;
    // this.XeroDocumentLines = event.data.DocumentLine;
  }

  onChangeSelect(event: any, hdr: any) {
    hdr.Select = event.target.checked;
  }

  onChangeAccount(event: any, hdr: any) {
    

    this.api.post('Xero/SaveVendAcctDefault', hdr).subscribe(
      (res1: {}) => this.successSaveAll(res1),
      error => this.failedSaveAll(<any>error));
  }


  onChangeSelectAll(event:any){
    
    this.xeroVendAcctDefault.forEach(element => {
      element.Select = event.target.checked;
      
    });
  }



}
