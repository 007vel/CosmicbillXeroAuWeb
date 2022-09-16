import { Component, OnInit, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { Message, SelectItem, ConfirmationService } from 'primeng/primeng';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '../store.service';
import { DialogModule } from 'primeng/dialog';


import { ApiService } from '../api.service';
import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
import { HttpHeaders, HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService]
})
export class ManageProductComponent implements OnInit {

  @ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;
  bookmarks: SimplePDFBookmark[] = [];


  lstProduct: any = [];
  xeroVendors: SelectItem[] = [];
  xeroAccounts: SelectItem[] = [];
  loadingMessage: any = "Loading...";
  xeroDocumentSelected: any; //Selected Xero Document
  hdr: any = {
    VendorListID: '',
    AccountID: '',
    ID: 0,
    ProductCode: '',
    VendorName: '',
    AccountName: ''

  }; //Selected Xero Document

  xeroVendorsTemp: any = [];
  xeroAccountsTemp: any = [];
  public msgs: Message[] = [];
  display: boolean = false;

  constructor(private router: Router, private api: ApiService, private ss: StoreService,
    private http: HttpClient, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.xeroVendorsTemp = this.ss.fetchXeroVendors();
    this.bindVendors();
    this.bindAccounts();

  }

  bindVendors() {

    this.xeroVendorsTemp = this.ss.fetchXeroVendors();

    this.xeroVendors.push({ label: '', value: '' });
    if (this.xeroVendorsTemp == null) return;

    this.xeroVendorsTemp.forEach(element => {
      this.xeroVendors.push({ label: element.DisplayNameField, value: element.XeroVendorID });
    });
  }

  bindAccounts() {

    this.xeroAccountsTemp = this.ss.fetchXeroAccounts();

    this.xeroAccounts.push({ label: '', value: '' });

    if (this.xeroAccountsTemp == null) return;

    this.xeroAccountsTemp.forEach(element => {
      this.xeroAccounts.push({ label: element.FullyQualifiedNameField, value: element.XeroAccountID });
    });
  }

  onChangeVendor(event: any) {
    this.hdr.AccountListID ='';
    this.hdr.ProductCode ='';
    this.getProduct();
  }

  onChangeAccount(line: any, accountlst: any) {
    if (line) {
      line.AccountListID = accountlst.XeroAccountID;
      line.XeroAccountName = accountlst.XeroAccountName;
    }
  }


  getProduct() {

    console.log(this.hdr);
    this.spinner.show();
    this.loadingMessage = "Processing...";
    this.api.get('Xero/GetXeroProduct?vendorID=', this.hdr.VendorID).subscribe(
      (res: {}) => this.successGetproduct(res),
      error => this.failedApproveDoc(<any>error));

  }


  successGetproduct(resp: any) {
    this.msgs = [];
    this.spinner.hide();
    console.log(resp);
    this.lstProduct = resp.Data;
  }

  failedApproveDoc(resp: any) {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Failed to get product', detail: 'Failed get product .' });
    this.spinner.hide();
  }

  save() {
    this.msgs = [];
    this.spinner.show();

    if(this.hdr.ID ===0){
    var lines = this.lstProduct.filter(xx => xx.ProductCode == this.hdr.ProductCode && xx.AccountListID == this.hdr.AccountListID); 
   
     if (lines.length>0) {

      this.msgs = [];
      this.msgs.push({ severity: 'warn', summary: 'you have entered duplicate Product Code and Expense Account', detail: '' });
      this.spinner.hide();
      return;
    }
  }

    
    console.log('lines');
    console.log(lines)

    this.loadingMessage = "Processing...";
    this.api.post('Xero/SaveXeroProduct', this.hdr).subscribe(
      (res: {}) => this.successSavetproduct(res),
      error => this.failedApproveDoc(<any>error));
  }

  successSavetproduct(resp: any) {
    this.msgs = [];
    this.spinner.hide();
    console.log(resp);
    this.getProduct();
    this.hdr.AccountListID ='';
    this.hdr.ID =0;
    this.hdr.ProductCode ='';

  }

  edit(rowValue){
   this.hdr = rowValue;
  }

  delete(rowValue) {
    this.loadingMessage = "Processing...";
    this.api.post('Xero/DeleteXeroProduct', rowValue).subscribe(
      (res: {}) => this.successDeleteSalesItem(res),
      error => this.failedDeleteSalesItem(<any>error));
  }

  successDeleteSalesItem(resp: any) {
    this.msgs = [];
    this.spinner.hide();
    console.log(resp);
    this.getProduct();
    this.hdr.ItemListID = '';
    this.hdr.ProductCode = '';
  }

  failedDeleteSalesItem(resp: any) {
    this.msgs = [];
    this.msgs.push({ severity: 'Error', summary: 'Failed to delete mapped product', detail: 'somthing is wrong when try to delete item' });
    this.spinner.hide();
  }
}
