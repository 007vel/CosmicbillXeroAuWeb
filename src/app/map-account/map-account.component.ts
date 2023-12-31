import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
  qboaccountsTemp: any = [];
  msgs: Message[] = [];
  loadingMessage: any = "Loading...";
  filteredAccount: any[];
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



  bindAccounts() {

    this.qboaccountsTemp = this.ss.fetchXeroAccounts();
    var tmpAccounts = this.ss.fetchXeroAccounts();
    console.log('this.qboaccountsTemp')
    console.log(this.qboaccountsTemp)
    if (tmpAccounts == null) return;

    this.xeroAccounts.push({ label: '', value: '' });

    tmpAccounts.forEach(element => {
      this.xeroAccounts.push({ label: element.FullyQualifiedNameField, value: element.XeroAccountID });
    });

  }
  filterAccount(event) {

    let filtered: any[] = [];
    let query = event.query;
    if (query == null || query.length >= 3) {
      for (let i = 0; i < this.qboaccountsTemp.length; i++) {
        let country = this.qboaccountsTemp[i];

        if (country.FullyQualifiedNameField.toLowerCase().includes(event.query.toLowerCase())) {
          filtered.push(country);
        }
      }
    }

    this.filteredAccount = filtered;
    console.log('this.filteredAccount')
    console.log(this.filteredAccount)
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
    console.log('this.xeroVendAcctDefault');
    console.log(this.xeroVendAcctDefault);
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

        var acct = this.qboaccountsTemp.find(xx => xx.XeroAccountID == this.xeroAccountIDSelected);


        this.xeroVendAcctDefault.forEach(element => {
          if (element.Select) {
            element.XeroAccountID = this.xeroAccountIDSelected;
            element.XeroAccountName = acct.FullyQualifiedNameField
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

  successSaveAll(resp: any) {
    this.spinner.hide();
  }

  failedSaveAll(resp: any) {
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

  onChangeAccountDropdown(event: any, hdr: any) {

    var acct = this.qboaccountsTemp.find(xx => xx.XeroAccountID == event.XeroAccountID);
    hdr.XeroAccountName = acct.FullyQualifiedNameField;
    hdr.XeroAccountID = acct.XeroAccountID;
    this.api.post('Xero/SaveVendAcctDefault', hdr).subscribe(
      (res1: {}) => this.successSaveAll(res1),
      error => this.failedSaveAll(<any>error));
  }


  onChangeSelectAll(event: any) {

    this.xeroVendAcctDefault.forEach(element => {
      element.Select = event.target.checked;

    });
  }



}
