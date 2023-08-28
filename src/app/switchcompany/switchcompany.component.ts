import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { StoreService } from '../store.service';
import { NgxSpinnerService } from 'ngx-spinner';
import './switchcompany.component.css';

import { Message, ConfirmationService } from 'primeng/primeng';



@Component({
  selector: 'app-switchcompany',
  templateUrl: './switchcompany.component.html',
  //styleUrls: ['./switchcompany.component.css'],
  providers: [ApiService, ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class SwitchcompanyComponent implements OnInit {
  isaouthrize: boolean = false;
  companies: any = [];
  constructor(private api: ApiService, private confirmationService: ConfirmationService, private router: Router, private ss: StoreService, private spinner: NgxSpinnerService) { }
  xeroID: any;
  ngOnInit() {
    this.bindCompanies();
  }


  bindCompanies() {
    this.api.get('Xero/GetByAccountID', '').subscribe(
      (res: {}) => this.sucessXeroMaster(res),
      error => this.failedXeroMaster(<any>error));
  }

  sucessXeroMaster(res: any) {

    if (res.StatusCode == 0) {
      this.companies = res.Data;

      console.log(this.companies);
      //   this.companies.forEach(element => {
      //     if (element.IsAuthrorize == true) {
      //       this.isaouthrize = element.IsAuthrorize;
      //       }

      //     //   this.api.get('Xero/UpdateReAuthrorizeByAccountID?isReaouth='+ element.IsAuthrorize,"").subscribe(
      //     //     (res: {}) => this.sucess(res),
      //     //     error => this.failed(<any>error));
      //     // }
      // });

    }
  }

  sucess(resp: any) {
    console.log(resp);

  }

  failed(resp: any) {
    console.log(resp);

  }
  failedXeroMaster(res: any) {

  }

  companySelected(company: any) {

    console.log(company);
    this.ss.storeXeroConnectID(company.XeroID.toString());

    this.ss.storeCompanyName(company.CompanyName.toString());
    // this.router.navigate(['/mapaccount']);
    var token = this.ss.fetchToken();
    this.router.navigate(['/initlogin/' + token + '/' + company.XeroID.toString() + '/connectcompany']);
  }

  companyReAouth(company: any) {

    console.log(company);
    this.ss.storeXeroConnectID(company.XeroID.toString());
    var token = this.ss.fetchToken();
    this.api.post('Xero/UpdateReAuthrorizeByAccountID?isReaouth=' + false, "").subscribe(
      (res: {}) => this.sucess(res),
      error => this.failed(<any>error));

    //window.location.href = this.api._xeroConnectUrl + token.toString();

    alert("Error in companyReAouth");
  }


  // checkXeroToken() {
  //   this.xeroID = this.ss.fetchXeroConnectID();
  //   console.log(this.xeroID);
  //   this.api.get('Xero/CheckXeroToken?XeroID=' + this.xeroID, "").subscribe(
  //     (res: {}) => this.validateCheckXeroToken(res),
  //     error => this.failedCheckXeroToken(<any>error));
  // }

  // validateCheckXeroToken(res: any) {
  //   var token = this.ss.fetchToken();

  //   if (res.StatusCode == 0) {

  //     if (res.Data.XeroTokenMinute < 0) {
  //       window.location.href = this.api.xeroConnectUrl + token.toString();
  //     }
  //     else {
  //       this.router.navigateByUrl('/mapaccount');
  //     }
  //   }
  // }

  // failedCheckXeroToken(res: any) {
  //   var token = this.ss.fetchToken();
  //   this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
  // }

  addNewCompany() {
    if (this.companies.length > 0) {
      var currentCompany = this.companies[0].CompanyName;
      var companyMessage = "You are already connected to " + currentCompany + " Are you sure you want to connect to new company?"
      this.confirmationService.confirm({
        message: companyMessage,
        accept: () => {
          var token = this.ss.fetchToken();
          //window.location.href = this.api._xeroConnectUrl + token;
          alert("Error in addNewCompany");
        },
        reject: () => {
          //this.XeroAccountIDSelected = 0;
        }
      });

    } else {
      var token = this.ss.fetchToken();
      //window.location.href = this.api._xeroConnectUrl + token;
      alert("Error in addNewCompany");
    }
  }

}
