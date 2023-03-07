import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { Message, SelectItem, ConfirmationService } from 'primeng/primeng';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { StoreService } from '../store.service';

import * as moment from 'moment';
import { element } from 'protractor';



@Component({
  selector: 'app-doc-edit',
  templateUrl: './doc-edit.component.html',
  styleUrls: ['./doc-edit.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService, ConfirmationService]
})
export class DocEditComponent implements OnInit {
  msgs: Message[] = [];
  loadingMessage: any = "Loading...";
  documentID: any = 0;
  documentMemo: any ="";
  xeroDocumentLinesEdit: any = [];
  xeroDocumentLinesEditToDelete: any = [];
  ScanPdfPath: any;
  display: boolean = false;
  xeroVendors: SelectItem[] = [];
  xeroVendorsTemp: any = [];
  xeroAccountsTemp: any = [];
  xeroAccounts: SelectItem[] = [];

  allDeleteSelected = false;  // header delete all checkbox

  deleteSelectedAllLine=false; // line item delete all checkbox
  documentVendor: "";
  billingAddress = "";
  reportViaTPAR = false;
  billNumber = "";
  invoiceNumber = "";
  invoiceDate:Date;

  connectCompanyMessage: string = "";

  saveClicked: boolean = false;
  scanBlobUrl = "";

  editTotal: any = 0;
  editSubTotal: any = 0;
  editGstTotal: any = 0;

  @ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;

  constructor(private router: Router, private api: ApiService, private http: HttpClient,
    private spinner: NgxSpinnerService, private ss: StoreService,
    private confirmationService: ConfirmationService, private route: ActivatedRoute) {

      console.log('InitLoginComponent3');
    var xeroSetting = this.ss.fetchXeroAccounts();


  }

  ngOnInit() {

    this.initLoad();

  }

  initLoad() {
    this.api.get('Login/IsVendDownloadRequired', '').subscribe(
      (res: {}) => this.sucessIsVendDownloadRequired(res),
      error => this.failedIsVendDownloadRequired(<any>error));
  }

  sucessIsVendDownloadRequired(resp: any) {
    if (resp != null) {

      if (resp.Data == true) {
        //needs vendor download
        this.getXeroVendor();
      } else {
        this.getXeroVendor();
        this.bindVendors();
        this.bindAccounts();
        this.documentID = this.route.snapshot.params['id'];
        this.getUpdatedDocument(this.documentID);

      }
    }
  }

  failedIsVendDownloadRequired(resp: any) {

    this.bindVendors();
    this.bindAccounts();
  }
  bindAccounts() {

    this.xeroAccountsTemp = this.ss.fetchXeroAccounts();

    this.xeroAccounts.push({ label: '', value: '' });

    if (this.xeroAccountsTemp == null) return;

    this.xeroAccountsTemp.forEach(element => {
      this.xeroAccounts.push({ label: element.FullyQualifiedNameField, value: element.XeroAccountID });
    });
  }
  getXeroVendor() {
    this.loadingMessage = "Getting suppliers...";
    this.spinner.show();
    this.api.get('Xero/GetAllVendor?isRefresh=true', '').subscribe(
      (res: {}) => this.sucessXeroVendor(res),
      error => this.failedXeroVendor(<any>error));
  }

  getXeroAccount() {
    this.loadingMessage = "Getting Accounts...";
    this.spinner.show();
    this.api.get('Xero/GetAllAccount?isRefresh=true', '').subscribe(
      (res: {}) => this.sucessXeroAccount(res),
      error => this.failedXeroAccount(<any>error));
  }
  onCheckBoxChangeDeleteAllLine(event: any) {

    console.log("onCheckBoxChangeDeleteAllLine:"+event.target.checked);
    if (event.target.checked == true) {
      this.deleteSelectedAllLine = true;

      this.xeroDocumentLinesEdit.forEach(element => {
        element.Deleted = true;
        this.xeroDocumentLinesEditToDelete.push(element);
      });
    }
    else {
      this.deleteSelectedAllLine = false;
      this.xeroDocumentLinesEdit.forEach(element => {
        element.Deleted = false;
      });
      if (this.xeroDocumentLinesEditToDelete.length > 0)
        this.xeroDocumentLinesEditToDelete.splice(0, this.xeroDocumentLinesEditToDelete.length);
    }
  }
  sucessXeroVendor(resp: any) {

    this.spinner.hide();
    console.log(resp);
    this.ss.storeXeroVendors(resp.Data);
    this.bindVendors();
    this.getXeroAccount();

  }

  failedXeroVendor(resp: any) {
    console.log(resp);
    this.spinner.hide();

  }


  sucessXeroAccount(resp: any) {
    this.spinner.hide();
    console.log(resp);
    this.ss.storeXeroAccounts(resp.Data);

    this.bindAccounts();
    //this.getDocumentToScan();

    //bind drop downs
  }

  failedXeroAccount(resp: any) {
    console.log(resp);
    this.spinner.hide();

  }

  validateConnectCompany() {
    var companyName = this.ss.fetchCompanyName();
    if (companyName == '' || companyName == null) {
      this.connectCompanyMessage = "No company is connected, Connect a company from Switch Company menu";
    }
  }
  
  bindVendors() {

    this.xeroVendorsTemp = this.ss.fetchXeroVendors();

    this.xeroVendors.push({ label: '', value: '' });
    if (this.xeroVendorsTemp == null) return;

    this.xeroVendorsTemp.forEach(element => {
      this.xeroVendors.push({ label: element.DisplayNameField, value: element.XeroVendorID });
    });
  }




  getUpdatedDocument(value: any) {

    this.spinner.show();
    this.loadingMessage = "Processing...";
    this.api.get('Scan/GetUpdatedDocument?DocumentID=', value).subscribe(
      (res: {}) => this.successGetDocument(res),
      error => this.failedtoGetDocument(<any>error));

  }
  successGetDocument(resp: any) {
   // debugger;
    this.spinner.hide();
    this.xeroDocumentLinesEdit = resp.Data;

    this.xeroDocumentLinesEdit.forEach(element => {
      var selectedTax = 0;
      if (element.ScanGST > 0) {
        selectedTax = (element.ScanGST * 100 / element.Scan_Total)
        element.ScanTax = Math.round(selectedTax * 10) / 10;
        this.documentMemo = element.Memo;

      }
      else
        element.ScanTax = 0;

    });



    this.documentVendor = this.xeroDocumentLinesEdit[0].XeroVendorID;
    this.billingAddress = this.xeroDocumentLinesEdit[0].ShippingTo;
    this.billNumber = this.xeroDocumentLinesEdit[0].ScanABNNumber;
    this.invoiceNumber = this.xeroDocumentLinesEdit[0].ScanRefNumber;
    this.invoiceDate = this.xeroDocumentLinesEdit[0].ScanInvoiceDate;
    this.scanBlobUrl = this.xeroDocumentLinesEdit[0].ScanBlob_Url;
    this.documentMemo = this.xeroDocumentLinesEdit[0].Memo;
   
    this.CalculateTotal();
  }
  failedtoGetDocument(error: any) {
    this.spinner.hide();

    console.log(error);
  }
  onChangeBillNumber() {
    this.xeroDocumentLinesEdit.forEach(element => {
      element.ScanABNNumber = this.billNumber;

    });
    this.billNumber = this.xeroDocumentLinesEdit[0].ScanABNNumber;
  }
  onChangeInvoiceNumber() {
    this.xeroDocumentLinesEdit.forEach(element => {
      element.ScanRefNumber = this.invoiceNumber;

    });
    this.invoiceNumber = this.xeroDocumentLinesEdit[0].ScanRefNumber;
  }
  onChangeInvoiceDate(record: any) {

    this.xeroDocumentLinesEdit.forEach(element => {
      element.ScanInvoiceDate = record

    });
    this.invoiceDate = this.xeroDocumentLinesEdit[0].ScanInvoiceDate;
    

  }
 
  saveEditChanges() {
    this.msgs = [];

    this.xeroDocumentLinesEdit.forEach(element => {
      element.Memo = this.documentMemo;
      element.DocumentID = this.documentID;
      element.ScanInvoiceDate = this.invoiceDate;
    });
    if(this.invoiceNumber==""){
      this.msgs.push({ severity: 'error', summary: 'Supplier Invoice Number is a required field', detail: 'Mandatory Field' });
   return;
    }
    if(this.invoiceDate==null){
      this.msgs.push({ severity: 'error', summary: 'Invoice Date is a required field', detail: 'Mandatory Field' });
   return;
    }
    if(this.documentVendor==""){
      this.msgs.push({ severity: 'error', summary: 'Supplier is a required field', detail: 'Mandatory Field' });
   return;
    }
    var newRecord = this.xeroDocumentLinesEdit.filter(a => a.DocumentLineID == 0);
    if (newRecord.length > 0 && (newRecord[0].ScanDescription == '' || newRecord[0].Scan_Quantity == 0 || newRecord[0].ScanUnit_Price == 0)) {

      alert("Please fill all required data in newly added line");
    }
    else {
      if (this.saveClicked == false) {
        this.saveClicked = true;
        this.spinner.show();
        this.loadingMessage = "Processing...";
        console.log(this.xeroDocumentLinesEdit);
        //debugger;
        this.api.post('Xero/SaveXeroDocumentEditChanges', this.xeroDocumentLinesEdit).subscribe(
          (res1: {}) => this.successSaveEditChanges(res1),
          error => this.failedSaveEditChanges(<any>error));
      }
    }
  }


  onChangeVendor(event: any) {


    var acct = this.xeroVendorsTemp.find(xx => xx.XeroVendorID == event.value);
    this.xeroDocumentLinesEdit.forEach(element => {
      element.XeroVendorID = acct.XeroVendorID;
      element.XeroVendorName = acct.DisplayNameField;
    });

    this.documentVendor = event.value;
  }



  onChangeAccount(event: any, record: any) {

    var acct = this.xeroAccountsTemp.find(xx => xx.XeroAccountID == event.value);
    record.XeroAccountName = acct.FullyQualifiedNameField;
    record.XeroAccountID = acct.XeroAccountID;
    record.AccountCode = acct.AccountCode;
    console.log("Approve the bill");
    console.log(acct);
    console.log(record);

  }
  successUpdateXeroDoc(res1:any){

  }
  failedUpdateXeroDoc(error:any){

  }

  CalculateTotal() {
    var total = 0;
    var gstTotal = 0;
    var subTotal = 0;
    this.xeroDocumentLinesEdit.forEach(element => {
      total = total + element.Scan_Total;
      gstTotal = gstTotal + element.ScanGST;
      var subt = (element.ScanUnit_Price*element.Scan_Quantity);
      subTotal = subTotal + subt ;
      console.log("========>lineitem "+   (element.ScanUnit_Price*element.Scan_Quantity));
    });

  
    this.editSubTotal = Math.round(subTotal*100)/100;
    this.editGstTotal = gstTotal;
    this.editTotal = this.editSubTotal + this.editGstTotal;

    console.log("========>subTotal "+    subTotal);
    console.log("========>editSubTotal "+    this.editSubTotal);
    console.log("========>editGstTotal "+    this.editGstTotal);
    console.log("========>editTotal "+    this.editTotal);

    this.xeroDocumentLinesEdit.forEach(element => {
      element.ScanInvoiceTotal = this.editTotal;
      element.ScanSubTotal = this.editSubTotal;
      element.ScanTaxTotal = this.editGstTotal;
    });

    
  }
  private SetupTaxCode(docClassification:string, totalTax:Number ) : any
  {

      switch (docClassification)
      {
          case "UNIT_PRICE_INCLUSIVE_OF_TAX_AND_CHARGES":
          case "GST_IN_TABLE_CHARGE_INCLUDES_GST":
          case "GST_IN_TABLE":
          case "NO_TABLE":
              return "Inclusive";

          case "HEADER_TABLE_NO_TABLE_VALIDATION":
          case "HEADER_TABLE_TOTAL_ONLY_VALIDATION":

              if ( totalTax > 0)
              {
                  return "Inclusive";
              }
              else
              {
                  return "Exclusive";
              }


          case "GST_NOT_IN_TABLE":
          case "CHARGE_INCLUDES_TAX":
          default:
            return "Exclusive";
      }
  }

  deleteAllLineItem()
  {
    if(!this.deleteSelectedAllLine)
    {
     // return;
    }
    this.deleteSelectedAllLine = false;
    
    this.xeroDocumentLinesEditToDelete.forEach(element => {
      console.log(JSON.stringify(element));
    //  if(element.DocumentID == this.documentID)
      {
        this.api.post('Xero/DeleteXeroDocumentLine', { 'DocumentLineID': element.DocumentLineID }).subscribe(
          (res1: {}) => this.successDeleteLineRecord(res1, element, true),
          error => this.failedDeleteRecord(<any>error));
      }

    });

    this.deleteSelectedAllLine=false;
  }

  onDeleteCheckBoxClick(event: any, hdr: any) {
    
    this.msgs = [];
    var qboDocument = this.xeroDocumentLinesEdit.filter(xx => xx.DocumentID == hdr.DocumentID);
    qboDocument.Deleted = event.target.checked;

    if (event.target.checked) {
      this.xeroDocumentLinesEditToDelete.push(qboDocument);
    }
    else {
      if (this.xeroDocumentLinesEditToDelete.length > 0) {
        const index: number = this.xeroDocumentLinesEdit.indexOf(qboDocument);
        console.log(index);
        this.xeroDocumentLinesEditToDelete.splice(index, 1);
      }
    }

    if ( this.xeroDocumentLinesEditToDelete.length== this.xeroDocumentLinesEdit.length && event.target.checked == true) {
      this.deleteSelectedAllLine = true;
    }
    else {
      this.deleteSelectedAllLine = false;
    }

  }
  private NumberRoundUp(num: any) : any
  {
    return Math.round((( num)*100)+Number.EPSILON)/100;
  }
  onChangeTax(record: any) {

    console.log("Tax:" + record.ScanTax);
    record.Scan_Total = record.Scan_Quantity * record.ScanUnit_Price;
    if (record.ScanTax > 0)
      record.ScanGST = ((record.Scan_Quantity * record.ScanUnit_Price) * record.ScanTax) / 100;
    else
      record.ScanGST = 0;
    this.CalculateTotal();
  }

  onChangeQty(record: any) {
    record.Scan_Total = record.Scan_Quantity * record.ScanUnit_Price;
    if (record.ScanTax > 0)
      record.ScanGST = ((record.Scan_Quantity * record.ScanUnit_Price) * record.ScanTax) / 100;
    else
      record.ScanGST = 0;
    this.CalculateTotal();
  }

  onChangePrice(record: any) {

    record.Scan_Total = record.Scan_Quantity * record.ScanUnit_Price;
    record.ScanUnit_Price = Math.round(    record.ScanUnit_Price * 100) / 100;
    if (record.ScanTax > 0)
      record.ScanGST = ((record.Scan_Quantity * record.ScanUnit_Price) * record.ScanTax) / 100;
    else
      record.ScanGST = 0;
    this.CalculateTotal();
  }

  successDeleteLineRecord(res: any, record: any, isbulkdelete: boolean) {
    this.spinner.hide();
    if (res.StatusCode == 0) {
     // debugger;
      const index: number = this.xeroDocumentLinesEdit.indexOf(record);
      console.log(index);
      this.xeroDocumentLinesEdit.splice(index, 1);
     // debugger;

      this.CalculateTotal();

      this.api.post('Xero/EditScanTotal', { 'DocumentID': this.documentID, 'ScanInvoiceTotal': this.editTotal }).subscribe(
        (res1: {}) => !isbulkdelete?alert('Updated Successfully'):"",
        error => !isbulkdelete? alert('Error in Update'):"");

    }

  }


  failedDeleteRecord(res: any) {
    this.spinner.hide();
    console.log("Failed to Delete");
  }

  deleteLineRecord(record) {
    console.log(record.DocumentLineID);
    if (confirm("Are you sure want to remove this line ?")) {
      if (record.DocumentLineID == 0) {
       // debugger;
        const index: number = this.xeroDocumentLinesEdit.indexOf(record);
        console.log(index);
        this.xeroDocumentLinesEdit.splice(index, 1);



      } else {
        this.loadingMessage = "Delete to Record..";
        this.spinner.show();
        this.api.post('Xero/DeleteXeroDocumentLine', { 'DocumentLineID': record.DocumentLineID }).subscribe(
          (res1: {}) => this.successDeleteLineRecord(res1, record, false),
          error => this.failedDeleteRecord(<any>error));
      }
    }

  }

  Cancel() {
    this.router.navigateByUrl("/docreview");
  }

  

  
  sucessDocumentFilePath(resp: any, valu: any) {
    debugger;
    console.log(this.api.apiPreBaseUrl + resp);
    const win = window.open(this.api.apiPreBaseUrl + resp, 'View Pdf', 'width=800,height=700');
    win.focus();
    console.log(resp);
  }
  sucessDocumentFile(resp: any) {
    this.display = true;
    this.openDocument1(resp);
  }
 
  showPdf(value: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    this.http.get(this.api.apiBaseUrl + '/Scan/GetXeroDocumentFile?xeroDocumentID=' + value.DocumentID, { headers: headers, responseType: 'blob' }).subscribe(
      (res: {}) => this.sucessDocumentFile(res),
      error => this.failedDocumentFile(<any>error));
  }

  viewPdf(value: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    this.http.get(this.api.apiBaseUrl + '/Scan/GetXeroDocumentFile?xeroDocumentID=' + value.DocumentID, { headers: headers, responseType: 'blob' }).subscribe(
      (res: {}) => this.sucessDocumentFile(res),
      error => this.failedDocumentFile(<any>error));
  }

  
  openDocument1(document: File) {
    const fileReader: FileReader = new FileReader();
    fileReader.onload = () => {
    this.pdfViewer.openDocument(new Uint8Array(fileReader.result));
    };
    fileReader.readAsArrayBuffer(document);
  }

  failedDocumentFile(resp: any) {

  }

  splitDocumeneLine(record: any) {

    var addFlag = 0;
    if (record.Scan_Quantity >= 2) {
      if (record.Scan_Quantity % 2 == 0)
        addFlag = 0;
      else
        addFlag = 1;

      var Qty1 = Math.floor(record.Scan_Quantity / 2);
      var Qty2 = Qty1 + addFlag;
      record.Scan_Quantity = Qty2;
      record.Scan_Total = Qty2 * record.ScanUnit_Price;
      record.ScanInvoiceTotal = record.ScanGST + (Qty2 * record.ScanUnit_Price);
      record.ScanGST = ((Qty2 * record.ScanUnit_Price) * record.ScanTax) / 100

      var index = this.xeroDocumentLinesEdit.indexOf(record);
      console.log(index);


      var splitedElement = {
        'DocumentID': this.xeroDocumentLinesEdit[0].DocumentID,
        'DocumentLineID': 0,
        'Scan_Quantity': Qty1,
        'ScanUnit_Price': record.ScanUnit_Price,
        'ScanGST': ((Qty1 * record.ScanUnit_Price) * record.ScanTax) / 100,
        'Scan_Total': Qty1 * record.ScanUnit_Price,
        'ScanInvoiceTotal': this.xeroDocumentLinesEdit[0].ScanInvoiceTotal,
        'ScanDescription': record.ScanDescription,
        'XeroVendorID': record.XeroVendorID,
        'XeroVendorName': record.XeroVendorName,
        'ScanInvoiceDate': record.ScanInvoiceDate,
        'ScanTax': record.ScanTax,
        'XeroAccountID': record.XeroAccountID,
        'XeroAccountName': record.XeroAccountName,
        'ScanABNNumber': record.ScanABNNumber,
        'ScanRefNumber': record.ScanRefNumber
      }

      this.xeroDocumentLinesEdit.splice(index + 1, 0, splitedElement);



    }
    else {
      alert("You can't split this element because it does not have sufficient quantity to split..");
    }

  }
  addNewLine() {

    var newRecord = this.xeroDocumentLinesEdit.filter(a => a.ScanDescription == '' || a.Scan_Quantity == 0 || a.ScanUnit_Price == 0);
    if (newRecord.length > 0) {
      alert("Please first fill all data in newly added line...");
    }

    else {
      var total = 0;
      var refNumber = '';
      var supplier = '';
      //var invoiceDate=this.xeroDocumentLinesEdit[0].ScanInvoiceDate;
      if(this.xeroDocumentLinesEdit!=null && this.xeroDocumentLinesEdit.length>0)
      {
        this.xeroDocumentLinesEdit.push(
          {
            'DocumentID': this.documentID,
            'DocumentLineID': 0,
            'Scan_Quantity': 0,
            'ScanUnit_Price': 0.0,
            'ScanGST': 0.0,
            'Scan_Total': 0.0,
            'ScanInvoiceTotal': 0,
            'ScanDescription': "",
            'XeroVendorID': this.xeroDocumentLinesEdit[0].XeroVendorID,
            'ScanInvoiceDate': this.xeroDocumentLinesEdit[0].ScanInvoiceDate,
            'XeroAccountID': this.xeroDocumentLinesEdit[0].XeroAccountID,
            'XeroAccountName': this.xeroDocumentLinesEdit[0].XeroAccountName,
            'ScanABNNumber': this.xeroDocumentLinesEdit[0].ScanABNNumber,
            'ScanRefNumber': this.xeroDocumentLinesEdit[0].ScanRefNumber,
            'scanBlobUrl': this.xeroDocumentLinesEdit[0].ScanBlob_Url ,
             'ScanTax': 0
  
          });

          var acct = this.xeroVendorsTemp.find(xx => xx.XeroVendorID == this.documentVendor);
          this.xeroDocumentLinesEdit.forEach(element => {
            element.XeroVendorID = acct.XeroVendorID;
            element.XeroVendorName = acct.DisplayNameField;
          });


      }else{
        this.xeroDocumentLinesEdit.push(
          {
            'DocumentID': this.documentID,
            'DocumentLineID': 0,
            'Scan_Quantity': 0,
            'ScanUnit_Price': 0.0,
            'ScanGST': 0.0,
            'Scan_Total': 0.0,
            'ScanInvoiceTotal': 0,
            'ScanDescription': "",
            'XeroVendorID': this.documentVendor ,
            'ScanInvoiceDate':this.invoiceDate,
            'XeroAccountID': "",
            'ScanABNNumber': this.billNumber,
            'ScanRefNumber': this.invoiceNumber,
             'ScanTax': 0,
             'scanBlobUrl':this.scanBlobUrl ,
             'Memo':this.documentMemo
          });

          var acct = this.xeroVendorsTemp.find(xx => xx.XeroVendorID == this.documentVendor);
          this.xeroDocumentLinesEdit.forEach(element => {
            element.XeroVendorID = acct.XeroVendorID;
            element.XeroVendorName = acct.DisplayNameField;
          });
      }
     

      console.log(this.xeroDocumentLinesEdit+" New line added");
    }

  }

  successSaveEditChanges(res: any) {
    this.spinner.hide();
    this.saveClicked = false;
    if (res.StatusCode == 0) {
      alert("Successfully updated invoice");
      this.router.navigateByUrl("/docreview");
     // this.getUpdatedDocument(this.documentID);
    }


  }
  failedSaveEditChanges(res: any) {
    this.spinner.hide();
    this.saveClicked = false;

    console.log("Error");
  }
}
