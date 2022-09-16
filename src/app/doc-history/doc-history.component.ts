
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import './doc-history.component.css';
import { StoreService } from '../store.service';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
declare var require: any
const FileSaver = require('file-saver');
import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';

@Component({
  selector: 'app-doc-history',
  templateUrl: './doc-history.component.html',
  providers:[ApiService],
  encapsulation: ViewEncapsulation.None
})
export class DocHistoryComponent implements OnInit {

  xeroDocuments: any = [];
  currentDate: {};
  display: boolean = false;
  fromDate = new Date();
  formattedDate : any;
  ScanPdfPath: any;

  
   @ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;
   bookmarks: SimplePDFBookmark[] = [];
   @Output() childEvent = new EventEmitter();
  userform: FormGroup;

  constructor(private router: Router, private api: ApiService,
    private spinner: NgxSpinnerService,private ss: StoreService, private http: HttpClient,
    private fb: FormBuilder) { }

  ngOnInit() {

    this.currentDate = new Date();
    this.currentDate = new Date().toISOString().split('T')[0];
   

    this.fromDate.setMonth(this.fromDate.getMonth()-1);
    this.formattedDate=this.fromDate.toISOString().slice(0,10);
    console.log('formattedDate'); 
    console.log(this.formattedDate); 
  // console.log(this.fromDate);
   
   

    this.userform = this.fb.group({
      'FromDate': new FormControl("", Validators.required),
      'ToDate': new FormControl("", Validators.required),

  });
 
    this.getHistoryDocument();
  }

  getHistoryDocument() {
    
   
    this.spinner.show();
    this.api.get('Xero/GetXeroDocumentHistoryByDate?fromdate='+
    this.formattedDate+"&todate="+ this.currentDate ,  "").subscribe(
      (res: {}) => this.sucessGetDocuments(res),
      error => this.failedGetDocument(<any>error));

  }

  sucessGetDocuments(resp: any) {
    console.log(resp);
    this.xeroDocuments = resp.Data;
    this.spinner.hide();
    
  }

  failedGetDocument(resp: any) {
    console.log(resp);
    this.spinner.hide();
  }

  onSubmit(value: string) {
   
    if (this.userform.valid) {
     
      console.log(this.userform.value)
      this.spinner.show();
     
      this.api.get('Xero/GetXeroDocumentHistoryByDate?fromdate='+
      this.userform.value.FromDate+"&todate="+this.userform.value.ToDate,  "").subscribe(
        (res: {}) => this.sucessGetDocuments(res),
        error => this.failedGetDocument(<any>error));
      
        
    }
}
sendDeepLink(rowValue){
  this.api.get('Xero/GetShortCode',  "").subscribe(
    (res: {}) => this.sucessGetShortcode(res,rowValue),
    error => this.failedGetShortcode(<any>error));

}

sucessGetShortcode(resp: any,rowValue:any) {
    console.log(resp);
    if(rowValue.ScanDocType=="AccountsPayable")
    {
    window.open("https://go.xero.com/organisationlogin/default.aspx?shortcode="+resp.Data.ShortCode+"&redirecturl=/AccountsPayable/Edit.aspx?InvoiceID="+rowValue.XeroInvoiceID);
    }
    else{
     
      window.open( "https://go.xero.com/organisationlogin/default.aspx?shortcode="+resp.Data.ShortCode+"&redirecturl=/AccountsPayable/ViewCreditNote.aspx?creditNoteID="+rowValue.XeroInvoiceID);
    }
    this.spinner.hide();
    
  }

  failedGetShortcode(resp: any) {
    console.log(resp);
    this.spinner.hide();
  }

  showPdf(value: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    this.http.get(this.api.apiBaseUrl + 'Scan/GetXeroDocumentFile?xeroDocumentID=' + value.DocumentID, { headers: headers, responseType: 'blob' }).subscribe(
      (res: {}) => this.sucessDocumentFile(res),
      error => this.failedDocumentFile(<any>error));
  }


  sucessDocumentFile(resp: any) {
    this.display = true;
    this.openDocument1(resp);
  }

  failedDocumentFile(resp: any) {

  }
  openDocument1(document: File) {
    this.ScanPdfPath = document;
    const fileReader: FileReader = new FileReader();
    fileReader.onload = () => {
      this.pdfViewer.openDocument(new Uint8Array(fileReader.result));
    };
    fileReader.readAsArrayBuffer(document);
  }


  downloadPDF(value: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    this.http.get(this.api.apiBaseUrl + 'Scan/GetXeroDocumentFile?xeroDocumentID=' + value.DocumentID, { headers: headers, responseType: 'blob' }).subscribe(
      (res: {}) => this.sucessDocumentFilePath(res, value.ScanFile_Name),
      error => this.failedDocumentFile(<any>error));
  }

  sucessDocumentFilePath(resp: any, filename: any) {
    console.log(resp);

    let file = new Blob([resp], { type: 'pdf;charset=utf-8' });
    FileSaver.saveAs(file, filename);
    console.log(resp);
  }

}
