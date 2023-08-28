import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { Message, SelectItem, ConfirmationService } from 'primeng/primeng';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { StoreService } from '../store.service';
import { CosmicNotifyService } from '../CosmicNotifyService';
import { AppComponent } from '../app.component';



@Component({
  selector: 'app-doc-review',
  templateUrl: './doc-review.component.html',
  styleUrls: ['./doc-review.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService, ConfirmationService]
})
export class DocReviewComponent implements OnInit {

  msgs: Message[] = [];
  steps: MenuItem[];
  activeIndex: number = 2;
  xeroDocumentLines: any = [];
  xeroDocumentLinesEdit: any = [];
  rowGroupMetadata: any;
  allDeleteSelected = false;
  allApproveSelected = false;
  xeroDocumentToDelete: any = [];
  xeroVendors: SelectItem[] = [];
  xeroVendorsTemp: any = [];
  xeroAccountsTemp: any = [];
  xeroAccounts: SelectItem[] = [];
  ScanPdfPath: any;
  totalDocToScan: any;
  documentScanIndex: any;
  loadingMessage: any;
  isViewerHidden: any = false;
  display: boolean = false;
  dialogEditVisible: boolean = false;
  editTotal: any = 0;

  editRefNumber: string = "";
  editSupplierName: string = "";

  @ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;

  bookmarks: SimplePDFBookmark[] = [];

  @Output() childEvent = new EventEmitter();


  constructor(private router: Router, private api: ApiService, private http: HttpClient,
    private spinner: NgxSpinnerService, private ss: StoreService,
    private confirmationService: ConfirmationService, protected cosmicNotifyService: CosmicNotifyService, private appComponent: AppComponent) { }

  validateConnectCompany() {
    var companyName = this.ss.fetchCompanyName();
    var IsAuthorize = this.ss.fetchIsAuthorize();
    if (!IsAuthorize) {
      this.appComponent.connectCompanyMessage = "No company is connected, Connect a company";
    } else {
      this.appComponent.connectCompanyMessage = "";
    }
  }

  ngOnInit() {

    // this.checkXeroToken();

    this.validateConnectCompany();
    this.initLoad();

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
        //window.location.href = this.api._xeroConnectUrl + token.toString();
        alert("Error in validateCheckXeroToken review");
      }

    }
  }

  failedCheckXeroToken(res: any) {
    var token = this.ss.fetchToken();
    this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
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


  onSort() {
    this.updateRowGroupMetaData();
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    if (this.xeroDocumentLines) {
      for (let i = 0; i < this.xeroDocumentLines.length; i++) {
        let rowData = this.xeroDocumentLines[i];
        if (rowData.SelectToBill == true) {
          if (rowData.ApproveDocAs == 3)
            rowData.SelectToBill1 = true;
          else if (rowData.ApproveDocAs == 1)
            rowData.SelectToBill2 = true;
          else if (rowData.ApproveDocAs == 2)
            rowData.SelectToBill3 = true;
        }
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

  getDocumentToScan() {

    this.loadingMessage = "Loading...";
    this.spinner.show();
    this.api.get('Scan/GetXeroDocumentToScan', '').subscribe(
      (res: {}) => this.sucessDocumentToScan(res),
      error => this.failedDocumentToScan(<any>error));

  }

  sucessDocumentToScan(resp: any) {

    console.log(resp);
    this.spinner.hide();
    if (resp != null) {
      if (resp.Data != null) {
        if (resp.Data.length > 0) {

          this.totalDocToScan = resp.Data.length;
          this.documentScanIndex = 1;
          // this.loadingMessage = "Scanning " + this.documentScanIndex + " / " + this.totalDocToScan;

          resp.Data.forEach(element => {
            this.scanDocument(element);
          });
        }
        else {
          this.getDocumentToBill();
        }
      }
    }
    this.cosmicNotifyService.myEventEmiter.emit();
  }

  failedDocumentToScan(resp: any) {
    console.log(resp);
    this.spinner.hide();
    this.getDocumentToBill();
  }

  scanDocument(document: any) {

    this.spinner.show();
    this.api.post('Scan/ScanXeroDocument', document).subscribe(
      (res: {}) => this.sucessScanDocument(res),
      error => this.failedScanDocument(<any>error));
  }

  sucessScanDocument(resp: any) {
    console.log('sucessScanDocument' + resp);
    if (resp != null) {

      if (resp.Data != null) {
        console.log('sucessScanDocument statys' + resp.StatusCode);
        if (resp.StatusCode == 0) {

          this.documentScanIndex = this.documentScanIndex + 1;

          //  this.loadingMessage = "Scanning " + this.documentScanIndex + " / " + this.totalDocToScan;

          if ((this.documentScanIndex - 1) == this.totalDocToScan) {

            this.documentScanIndex = this.documentScanIndex - 1;

            /// this.loadingMessage = "Scanning " + this.documentScanIndex + " / " + this.totalDocToScan;

            setTimeout(() => {
              this.spinner.hide();
              this.getDocumentToBill();

            }, 4000);

          }
        }

      }
    }

  }

  failedScanDocument(resp: any) {
    console.log(resp);
    this.spinner.hide();
  }

  getDocumentToBill() {

    this.loadingMessage = "Loading... ";
    this.spinner.show();
    this.api.get('Scan/GetXeroDocumentToApprove', '').subscribe(
      (res: {}) => this.sucessDocumentToBill(res),
      error => this.failedDocumentToBill(<any>error));
  }

  sucessDocumentToBill(resp: any) {
    console.log("59656565");
    console.log(resp);
    this.allDeleteSelected = false;

    this.xeroDocumentLines = resp.Data;
    this.spinner.hide();
    this.updateRowGroupMetaData();
  }

  failedDocumentToBill(resp: any) {
    console.log(resp);
    this.spinner.hide();
    this.allDeleteSelected = false;

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
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    this.http.get(this.api.apiBaseUrl + '/Scan/GetXeroDocumentFile?xeroDocumentID=' + value.DocumentID, { headers: headers, responseType: 'blob' }).subscribe(
      (res: {}) => this.sucessDocumentFile(res),
      error => this.failedDocumentFile(<any>error));


  }

  deleteRecord(record: any) {
    this.confirmationService.confirm({
      message: 'Are you sure want to remove this record ?',
      accept: () => {
        this.spinner.show();
        this.loadingMessage = "Delete to Record..";
        this.api.post('Xero/DeleteXeroDocument', { 'DocumentID': record.DocumentID, 'Deleted': true }).subscribe(
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
    else
      this.allDeleteSelected = false;
  }

  failedDeleteRecord(res: any) {
    this.spinner.hide();
    this.allDeleteSelected = false;

  }
  onChangeDeleteAll(event: any) {

    if (event.target.checked == true) {
      this.allDeleteSelected = true;

      var distinctDoc = this.getUniqueValues("DocumentID");
      distinctDoc.forEach(element => {
        var qboDocument = this.xeroDocumentLines.filter(xx => xx.DocumentID == element)
        qboDocument[0].Deleted = true;
        this.xeroDocumentToDelete.push(qboDocument[0]);
      });
    }
    else {
      this.allDeleteSelected = false;
      var distinctDoc = this.getUniqueValues("DocumentID");
      distinctDoc.forEach(element => {
        var qboDocument = this.xeroDocumentLines.filter(xx => xx.DocumentID == element)
        qboDocument[0].Deleted = false;
      });
      if (this.xeroDocumentToDelete.length > 0)
        this.xeroDocumentToDelete.splice(0, this.xeroDocumentToDelete.length);
    }


  }
  onDeleteClicked() {
    this.msgs = [];
    // debugger;
    //  var qboDocument = this.qboDocumentLines.filter(xx => xx.Deleted == true);
    //if(qboDocument.length>0)
    if (this.xeroDocumentToDelete.length > 0) {
      if (confirm("Are you sure want to remove this document ?")) {
        this.api.post('Xero/DeleteMultipleXeroDocument', this.xeroDocumentToDelete).subscribe(
          (res1: {}) => this.successDeleteRecord(res1),
          error => this.failedDeleteRecord(<any>error));
      }
    }
    else {
      this.msgs.push({ severity: 'Info', summary: 'Please select document to delete', detail: 'Mandatory Field' });

      return;
    }
  }
  onChangeDelete(event: any, hdr: any) {
    // debugger;
    this.msgs = [];
    var qboDocument = this.xeroDocumentLines.filter(xx => xx.DocumentID == hdr.DocumentID);
    qboDocument[0].Deleted = event.target.checked;

    if (event.target.checked) {
      this.xeroDocumentToDelete.push(qboDocument[0]);
    }
    else {
      if (this.xeroDocumentToDelete.length > 0) {
        const index: number = this.xeroDocumentToDelete.indexOf(qboDocument);
        console.log(index);
        this.xeroDocumentToDelete.splice(index, 1);
      }
    }
    //  var deletedDoc=this.qboDocumentLines.filter(xx => xx.Deleted == event.target.checked);

    var distinctDoc = this.getUniqueValues("DocumentID");
    console.log(distinctDoc.size + " " + this.xeroDocumentToDelete.length);
    if (distinctDoc.size == this.xeroDocumentToDelete.length && event.target.checked == true) {
      this.allDeleteSelected = true;
    }
    else {
      this.allDeleteSelected = false;
    }


    //console.log(this.qboDocumentToDelete);


  }

  // onChangeApproveAll(event: any) {
  //   this.msgs = [];
  //   let isOK = false;
  //   var distinctDoc = this.getUniqueValues("DocumentID");

  //   this.allApproveSelected=event.target.checked;
  //   if (event.target.checked) {

  //     distinctDoc.forEach(element => {

  //       isOK = true;
  //       var lines = this.qboDocumentLines.filter(xx => xx.DocumentID == element)

  //       if (lines.find(xx => xx.QboCustListID == "" || xx.QboCustListID == null) != null) {
  //         this.msgs.push({ severity: 'Info', summary: 'Customer is a required field', detail: 'Mandatory Field' });
  //         event.target.checked = false;

  //         return;
  //         //  isOK = true;
  //       }

  //       if (this.isItemDetail) {
  //         if (lines.find(xx => xx.QboItemListID == null || xx.QboItemListID == "") != null) {
  //           this.msgs.push({ severity: 'error', summary: 'Item is a required field', detail: 'Mandatory Field' });
  //           event.target.checked = false;
  //           return;
  //         }
  //       }
  //       else {
  //         if (lines.find(xx => xx.QboAccountListID == null || xx.QboAccountListID == "") != null) {
  //           this.msgs.push({ severity: 'error', summary: 'Account is a required field', detail: 'Mandatory Field' });
  //           event.target.checked = false;
  //           return;
  //         }
  //       }    


  //       if (isOK) {
  //         lines[0].SelectToBill = true;
  //         this.api.post('Qbo/ApproveQboDocument', lines[0]).subscribe(
  //           (res1: {}) => this.successApproveDoc(res1),
  //           error => this.failedApproveDoc(<any>error,lines[0]));
  //       }

  //     });
  //   }
  //   else {

  //     distinctDoc.forEach(element => {

  //       var lines = this.qboDocumentLines.filter(xx => xx.DocumentID == element);
  //       lines[0].SelectToBill = false;

  //       this.api.post('Qbo/ApproveQboDocument', lines[0]).subscribe(
  //         (res1: {}) => this.successApproveDoc(res1),
  //         error => this.failedApproveDoc(<any>error,lines[0]));

  //     });

  //   }
  // }


  sucessDocumentFile(resp: any) {
    this.display = true;
    this.openDocument1(resp);
  }

  failedDocumentFile(resp: any) {
    //    this.display = true;


    // this.openDocument1(resp);
  }


  onChangeVendor(event: any, record: any) {
    var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == record.DocumentID);
    var vend = this.xeroVendorsTemp.find(xx => xx.XeroVendorID == event.value);

    lines.forEach(element => {
      element.XeroVendorID = event.value;
      element.XeroVendorName = vend.DisplayNameField;
    });

    //Approve the bill
    this.api.post('Xero/UpdateXeroDocument', record).subscribe(
      (res1: {}) => this.successUpdateXeroDoc(res1),
      error => this.failedUpdateXeroDoc(<any>error));
  }


  openEditScreen(record: any) {
    //this.router.navigateByUrl('/docedit/'+ record.DocumentID);
    this.router.navigate(['docedit', record.DocumentID]);
  }

  onChangeAccount(event: any, record: any) {

    //var acct = this.XeroAccountsTemp.find(xx=> xx.idField == event.value);
    //record.XeroAccountName = acct.nameField;

    var acct = this.xeroAccountsTemp.find(xx => xx.XeroAccountID == event.value);
    record.XeroAccountName = acct.FullyQualifiedNameField;
    record.XeroAccountID = acct.XeroAccountID;
    record.AccountCode = acct.AccountCode;
    console.log("Approve the bill");
    console.log(acct);
    console.log(record);
    //Approve the bill
    this.api.post('Xero/UpdateXeroDocument', record).subscribe(
      (res1: {}) => this.successUpdateXeroDoc(res1),
      error => this.failedUpdateXeroDoc(<any>error));

  }

  failedUpdateXeroDoc(resp: any) {
    this.msgs = [];
    this.msgs.push({ severity: 'Error', summary: 'Failed to save your changes', detail: 'Failed.' });
  }

  successUpdateXeroDoc(resp: any) {

  }


  onChangeApprove(event: any, hdr: any) {
    if (hdr.Duplicate > 0) {
      this.msgs = [];
      this.msgs.push({ severity: 'Error', summary: 'Failed to approve', detail: 'Document with same InvoiceNumber already exist..' });
      event.target.checked = false;
      //hdr.SelectToBill2=false;
      //hdr.SelectToBill3=false;
    } else {
      if (event.target.checked == true) {
        hdr.SelectToBill1 = true;
        hdr.SelectToBill2 = false;
        hdr.SelectToBill3 = false;
      }
      else {
        hdr.SelectToBill1 = false;
        hdr.SelectToBill2 = false;
        hdr.SelectToBill3 = false;
      }



      //check if Vendor and Expense Account is selected 

      this.msgs = [];
      var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == hdr.DocumentID)
      console.log(lines);

      var vend = lines.find(xx => xx.XeroVendorID == 0);
      if (vend != null) {
        this.msgs.push({ severity: 'Info', summary: 'Vendor is a required field', detail: 'Mandatory Field' });
        event.target.checked = false;
        return;
      }

      if (lines.find(xx => xx.XeroAccountID == 0) != null) {
        this.msgs.push({ severity: 'Info', summary: 'Expense Account is a required field', detail: 'Mandatory Field' });
        event.target.checked = false;
        return;
      }

      hdr.SelectToBill = event.target.checked;
      if (event.target.checked == true)
        hdr.ApproveDocAs = 3;

      //Approve the bill
      this.api.post('Xero/ApproveXeroDocument', hdr).subscribe(
        (res1: {}) => this.successApproveDoc(res1),
        error => this.failedApproveDoc(<any>error, hdr));
    }

  }


  onChangeApproveAsDraft(event: any, hdr: any) {
    if (hdr.Duplicate > 0) {
      this.msgs = [];
      this.msgs.push({ severity: 'Error', summary: 'Failed to approve', detail: 'Document with same InvoiceNumber already exist..' });
      event.target.checked = false;
      //hdr.SelectToBill2=false;
      // hdr.SelectToBill3=false;
    } else {
      if (event.target.checked == true) {
        hdr.SelectToBill2 = true;
        hdr.SelectToBill1 = false;
        hdr.SelectToBill3 = false;
      }
      else {
        hdr.SelectToBill1 = false;
        hdr.SelectToBill2 = false;
        hdr.SelectToBill3 = false;
      }

      //check if Vendor and Expense Account is selected 

      this.msgs = [];
      var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == hdr.DocumentID)
      console.log(lines);

      var vend = lines.find(xx => xx.XeroVendorID == 0);
      if (vend != null) {
        this.msgs.push({ severity: 'Info', summary: 'Vendor is a required field', detail: 'Mandatory Field' });
        event.target.checked = false;
        return;
      }

      if (lines.find(xx => xx.XeroAccountID == 0) != null) {
        this.msgs.push({ severity: 'Info', summary: 'Expense Account is a required field', detail: 'Mandatory Field' });
        event.target.checked = false;
        return;
      }

      hdr.SelectToBill = event.target.checked;
      if (event.target.checked == true)
        hdr.ApproveDocAs = 1;
      //Approve the bill
      this.api.post('Xero/ApproveXeroDocument', hdr).subscribe(
        (res1: {}) => this.successApproveDoc(res1),
        error => this.failedApproveDoc(<any>error, hdr));
    }
  }

  onChangeApproveAsWA(event: any, hdr: any) {

    //check if Vendor and Expense Account is selected 
    if (hdr.Duplicate > 0) {
      this.msgs = [];
      this.msgs.push({ severity: 'Error', summary: 'Failed to approve', detail: 'Document with same InvoiceNumber already exist..' });
      event.target.checked = false;
      //hdr.SelectToBill2=false;
      //hdr.SelectToBill3=false;
    } else {
      if (event.target.checked == true) {
        hdr.SelectToBill3 = true;
        hdr.SelectToBill1 = false;
        hdr.SelectToBill2 = false;
      }
      else {
        hdr.SelectToBill1 = false;
        hdr.SelectToBill2 = false;
        hdr.SelectToBill3 = false;
      }

      this.msgs = [];
      var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == hdr.DocumentID)
      console.log(lines);

      var vend = lines.find(xx => xx.XeroVendorID == 0);
      if (vend != null) {
        this.msgs.push({ severity: 'Info', summary: 'Vendor is a required field', detail: 'Mandatory Field' });
        event.target.checked = false;
        return;
      }

      if (lines.find(xx => xx.XeroAccountID == 0) != null) {
        this.msgs.push({ severity: 'Info', summary: 'Expense Account is a required field', detail: 'Mandatory Field' });
        event.target.checked = false;
        return;
      }

      hdr.SelectToBill = event.target.checked;
      if (event.target.checked == true)
        hdr.ApproveDocAs = 2;
      //Approve the bill
      this.api.post('Xero/ApproveXeroDocument', hdr).subscribe(
        (res1: {}) => this.successApproveDoc(res1),
        error => this.failedApproveDoc(<any>error, hdr));
    }

  }
  getUniqueValues(key) {
    var result = new Set();
    this.xeroDocumentLines.forEach(function (item) {
      if (item.hasOwnProperty(key)) {
        result.add(item[key]);
      }
    });
    return result;
  }

  onChangeApproveAll(event: any) {

    let isOK = false;
    var distinctDoc = this.getUniqueValues("DocumentID");

    this.allApproveSelected = event.target.checked;

    if (event.target.checked) {

      distinctDoc.forEach(element => {

        isOK = false;
        var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == element)

        if (lines.find(xx => xx.XeroVendorID == 0) == null) {

          if (lines.find(xx => xx.XeroAccountID == 0) == null) {

            isOK = true;

          }
        }

        if (isOK) {
          lines[0].SelectToBill = true;
          lines[0].ApproveDocAs = 3;
          this.api.post('Xero/ApproveXeroDocument', lines[0]).subscribe(
            (res1: {}) => this.successApproveDoc(res1),
            error => this.failedApproveDoc(<any>error, lines[0]));
        }
      });
    }
    else {

      distinctDoc.forEach(element => {

        var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == element);
        lines[0].SelectToBill = false;

        this.api.post('Xero/ApproveXeroDocument', lines[0]).subscribe(
          (res1: {}) => this.successApproveDoc(res1),
          error => this.failedApproveDoc(<any>error, lines[0]));

      });

    }
  }


  successApproveDoc(resp: any) {
    setTimeout(() => {
      this.router.navigate(['docpost']);
    },
      10000);

  }

  failedApproveDoc(resp: any, hdr: any) {
    console.log("RESP " + resp);

    this.msgs = [];
    if (resp.indexOf("409")) {
      this.msgs.push({ severity: 'Error', summary: 'Failed to approve', detail: 'Document with same InvoiceNumber already exist..' });
      alert('Document with same InvoiceNumber already exist..');
    } else {
      this.msgs.push({ severity: 'Error', summary: 'Failed to approve', detail: 'Failed to approve document.' });
      hdr.SelectToBill = false;
      alert('Failed to approve document.');
    }

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
    this.getDocumentToScan();

    //bind drop downs
  }

  failedXeroAccount(resp: any) {
    console.log(resp);
    this.spinner.hide();

  }

  //It will check if vendors needs to download 
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
        this.getDocumentToScan();
      }
    }
  }

  failedIsVendDownloadRequired(resp: any) {

    this.bindVendors();
    this.bindAccounts();
  }

  showHideViewer() {
    this.isViewerHidden = !this.isViewerHidden;
  }

  openEditWindow(record: any) {

    var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == record.DocumentID);
    this.xeroDocumentLinesEdit = [];

    var total = 0;
    var refNumber = '';
    var supplier = '';

    lines.forEach(element => {
      this.xeroDocumentLinesEdit.push(
        {
          'DocumentID': element.DocumentID,
          'DocumentLineID': element.DocumentLineID,
          'Scan_Quantity': element.Scan_Quantity,
          'ScanUnit_Price': element.ScanUnit_Price,
          'ScanGST': element.ScanGST,
          'Scan_Total': element.Scan_Total,
          'ScanInvoiceTotal': element.ScanInvoiceTotal,
          'ScanDescription': element.ScanDescription,
          'ScanRefNumber': element.ScanRefNumber
        });

      total = element.ScanInvoiceTotal;
      refNumber = element.ScanRefNumber;
      supplier = element.XeroVendorName;
    });


    this.editTotal = total;
    this.editRefNumber = refNumber;
    this.editSupplierName = supplier;

    this.dialogEditVisible = true;
  }

  onChangeQty(record: any) {
    console.log("onChangeQty >>>>>>>>>>>>>");
    record.Scan_Total = record.Scan_Quantity * record.ScanUnit_Price;
    record.ScanGST = ((record.Scan_Quantity * record.ScanUnit_Price) * 10) / 100;

    var total = 0;
    this.xeroDocumentLinesEdit.forEach(element => {
      total = total + element.Scan_Total
    });

    this.xeroDocumentLinesEdit.forEach(element => {
      element.ScanInvoiceTotal = total;
    });


    this.editTotal = total;
  }

  onChangePrice(record: any) {
    console.log("onChangePrice >>>>>>>>>>>>>");
    record.Scan_Total = record.Scan_Quantity * record.ScanUnit_Price;
    record.ScanGST = ((record.Scan_Quantity * record.ScanUnit_Price) * 10) / 100;

    var total = 0;
    this.xeroDocumentLinesEdit.forEach(element => {
      total = total + element.Scan_Total
    });

    this.xeroDocumentLinesEdit.forEach(element => {
      element.ScanInvoiceTotal = total;
    });


    this.editTotal = total;

  }

  onChangeRefNumber(record: any) {

    this.xeroDocumentLinesEdit.forEach(element => {
      element.ScanRefNumber = record.ScanRefNumber

    });
  }

  saveEditChanges() {

    this.api.post('Xero/SaveXeroDocumentEditChanges', this.xeroDocumentLinesEdit).subscribe(
      (res1: {}) => this.successSaveEditChanges(res1),
      error => this.failedSaveEditChanges(<any>error));
  }

  successSaveEditChanges(res: any) {

    if (res.StatusCode == 0) {

      var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == res.Data);

      lines.forEach(element => {

        var editLine = this.xeroDocumentLinesEdit.find(ff => ff.DocumentLineID == element.DocumentLineID);

        element.Scan_Quantity = editLine.Scan_Quantity,
          element.ScanUnit_Price = editLine.ScanUnit_Price,
          element.ScanGST = editLine.ScanGST,
          element.Scan_Total = editLine.Scan_Total,
          element.ScanInvoiceTotal = editLine.ScanInvoiceTotal,
          element.ScanDescription = editLine.ScanDescription,
          element.ScanRefNumber = editLine.ScanRefNumber

      });

      this.dialogEditVisible = false;

    }
    else {
      this.msgs = [];
      this.msgs.push({ severity: 'Error', summary: 'Failed to save your changes', detail: 'Failes..' });
    }

  }

  failedSaveEditChanges(res: any) {

  }

  getRecordClass(index: any, docType: any, Duplicate: any) {
    if (Duplicate > 0) {
      return 'duplicate'
    } else {
      if (docType == "CreditNote") {
        return 'creditNote'
      }
      else {
        return (index % 2 === 0) ? 'odd' : 'even';
      }
    }

  }



}
