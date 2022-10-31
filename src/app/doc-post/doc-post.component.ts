import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Message, ConfirmationService } from 'primeng/primeng';
import { Alert } from 'selenium-webdriver';
import { StoreService } from '../store.service';
import { CosmicNotifyService } from '../CosmicNotifyService';


@Component({
  selector: 'app-doc-post',
  templateUrl: './doc-post.component.html',
  styleUrls: ['./doc-post.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService, ConfirmationService]
})
export class DocPostComponent implements OnInit {
  steps: MenuItem[];
  activeIndex: number = 3;
  xeroDocumentLines: any = [];
  dialogEditVisible: boolean = false;
  isaouthrize: boolean = false;
  xeroResponse: any = [];
  rowGroupMetadata: any;
  msgs: Message[] = [];
  ScanPdfPath: any;
  loadingMessage: any = "Loading...";
  connectCompanyMessage: any = "";
  isViewerHidden: any = false;
  display: boolean = false;

  @ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;
  bookmarks: SimplePDFBookmark[] = [];

  constructor(private router: Router, private api: ApiService, private http: HttpClient, private spinner: NgxSpinnerService,
    private confirmationService: ConfirmationService, private ss: StoreService, protected cosmicNotifyService: CosmicNotifyService) { }

  validateConnectCompany() {
    var companyName = this.ss.fetchCompanyName();
    if (companyName == '' || companyName == null) {
      this.connectCompanyMessage = "No company is connected, Connect a company from Switch Company menu";
    }
  }

  ngOnInit() {

    // this.checkXeroToken();
    this.validateConnectCompany();
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

    this.getDocumentToBill();
  }

  onSort() {
    this.updateRowGroupMetaData();
  }

  checkXeroToken() {

    var xeroID = this.ss.fetchXeroConnectID();
    this.api.get('Xero/CheckXeroToken?XeroID=' + xeroID, "").subscribe(
      (res: {}) => this.validateCheckXeroToken(res),
      error => this.failedCheckXeroToken(<any>error));
  }

  validateCheckXeroToken(res: any) {
    var token = this.ss.fetchToken();
    if (res.StatusCode == 0) {

      if (res.Data.XeroTokenMinute < 0) {
        window.location.href = this.api._xeroConnectUrl + token.toString();
      }

    }
  }

  failedCheckXeroToken(res: any) {
    var token = this.ss.fetchToken();
    this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    if (this.xeroDocumentLines) {
      for (let i = 0; i < this.xeroDocumentLines.length; i++) {
        let rowData = this.xeroDocumentLines[i];
        let brand = rowData.DocumentID;
        if (i == 0) {
          this.rowGroupMetadata[brand] = { index: 0, size: 1 };
        }
        else {
          let previousRowData = this.xeroDocumentLines[i - 1];
          let previousRowGroup = previousRowData.DocumentID;
          if (brand === previousRowGroup)
            this.rowGroupMetadata[brand].size++;
          else
            this.rowGroupMetadata[brand] = { index: i, size: 1 };
        }
      }
    }
  }

  getDocumentToBill() {

    this.spinner.show();
    this.api.get('Scan/GetXeroDocumentToBill', '').subscribe(
      (res: {}) => this.sucessDocumentToBill(res),
      error => this.failedDocumentToBill(<any>error));

  }

  sucessDocumentToBill(resp: any) {
    console.log(resp);
    this.xeroDocumentLines = resp.Data;
    this.spinner.hide();
    this.updateRowGroupMetaData();

    this.selectAllAsDefault();
  }

  failedDocumentToBill(resp: any) {
    console.log(resp);
    this.spinner.hide();
  }


  onChangeSelecToBillApprove(event: any, hdr: any) {

  }


  // how to open PDF document
  openDocument1(document: File) {
    const fileReader: FileReader = new FileReader();
    fileReader.onload = () => {
      this.pdfViewer.openDocument(new Uint8Array(fileReader.result));
    };
    fileReader.readAsArrayBuffer(document);
  }


  showPdf(value: any) {

    this.spinner.show();
    this.loadingMessage = "Please wait...";

    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    this.http.get(this.api.apiBaseUrl + '/Scan/GetXeroDocumentFile?xeroDocumentID=' + value.DocumentID, { headers: headers, responseType: 'blob' }).subscribe(
      (res: {}) => this.sucessDocumentFile(res),
      error => this.failedDocumentFile(<any>error));


  }


  DeAproveRecord(record: any) {

    this.confirmationService.confirm({
      message: 'Are you sure want to send the selected record back to review again?',
      accept: () => {
       this.spinner.show();
        this.loadingMessage = "Please wait..";
        this.api.post('Xero/ApproveXeroDocument', { 'DocumentID': record.DocumentID, 'Approve': false }).subscribe(
          (res1: {}) => this.successDeleteRecord(res1),
          error => this.failedDeleteRecord(<any>error));
      },
      reject: () => {
        //this.XeroAccountIDSelected = 0;
      }
    });

  }

  successDeleteRecord(res: any) {
    this.spinner.hide();
    if (res.StatusCode == 0) {
      this.getDocumentToBill();
    }

  }

  failedDeleteRecord(res: any) {
    this.spinner.hide();
  }




  sucessDocumentFile(resp: any) {
    this.display = true;
    this.openDocument1(resp);
    this.spinner.hide();
  }

  failedDocumentFile(resp: any) {
    this.spinner.hide();
  }

  selectAllAsDefault() {
    this.xeroDocumentLines.forEach(element => {
      element.SelectToBill = true;

    });
  }

  onChangeApproveAll(event: any) {

    this.xeroDocumentLines.forEach(element => {
      element.SelectToBill = event.target.checked;

    });
  }

  onChangeApprove(event: any, hdr: any) {
    console.log(hdr.DocumentID);

    var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == hdr.DocumentID);
    if (lines != null) {
      lines.forEach(element => {
        element.SelectToBill = event.target.checked;

      });

    }

  }

  postToAuth() {
  
    this.CreateBill("WAP");
  }

  postToXero() {
   
    this.CreateBill("DR");
  }
  postToApr() {
   
    this.CreateBill("AP");
  }

  CreateBill(arg0: string): any {
    this.xeroResponse = [];
    var xeroSelectedDocument = this.xeroDocumentLines.filter(xx => xx.SelectToBill == true);
    if (xeroSelectedDocument == null) {

      this.msgs = [];
      this.msgs.push({ severity: 'Info', summary: 'Please select a document atleast', detail: 'Mandatory.' });
      return;
    }

    xeroSelectedDocument.forEach(element => {
      element.BillStatus = arg0;

    });

    this.confirmationService.confirm({
      message: 'Are you sure that you want to post all selected document(s) to Xero',
      accept: () => {
        this.spinner.show();
        this.loadingMessage = "Posting to Xero...";
        this.api.post('Xero/CreateBill', xeroSelectedDocument).subscribe(
          (res1: {}) => this.successCreateBill(res1),
          error => this.failedCreateBill(<any>error));
      },
      reject: () => {
        //this.XeroAccountIDSelected = 0;
      }
    });

  }



  successCreateBill(resp: any) {


    this.spinner.hide();
    this.msgs = [];
    this.dialogEditVisible = false;
    this.openRespWindow(resp);
    this.getDocumentToBill();
    this.cosmicNotifyService.myEventEmiter.emit();
  }

  failedCreateBill(resp: any) {
    this.spinner.hide();
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Failed', detail: 'Please reconnect your company and again post your document...' });
  }

  openRespWindow(resp: any) {

    resp.Data.forEach(element => {
      this.xeroResponse.push(
        {
          'InvoiceNo': element.InvoiceNo,
          'Supplier': element.Supplier,
          'ReponseFromXero': element.ReponseFromXero,
          'ErrorMessage': element.ErrorMessage
        });
      if (element.IsAuthrorize == true) {
        this.isaouthrize = element.IsAuthrorize;

        this.api.post('Xero/UpdateReAuthrorizeByAccountID?isReaouth='+ element.IsAuthrorize,"").subscribe(
          (res: {}) => this.sucess(res),
          error => this.failed(<any>error));
      }

    });

    this.dialogEditVisible = true;
  }
  sucess(resp: any) {
    console.log(resp);

  }

  failed(resp: any) {
    console.log(resp);
   
  }

  showHideViewer() {
    this.isViewerHidden = !this.isViewerHidden;
  }

  getRecordClass(index: any, docType: any) {
    if (docType == "CreditNote") {
      return 'creditNote'
    }
    else {
      return (index % 2 === 0) ? 'odd' : 'even';
    }

  }


}
