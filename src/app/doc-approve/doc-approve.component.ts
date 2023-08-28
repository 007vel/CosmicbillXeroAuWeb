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
  selector: 'app-doc-approve',
  templateUrl: './doc-approve.component.html',
  styleUrls: ['./doc-approve.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService]
})
export class DocApproveComponent implements OnInit {

  @ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;
  bookmarks: SimplePDFBookmark[] = [];


  steps: MenuItem[];
  activeIndex: number = 1;

  xeroDocuments: any = [];
  xeroDocumentLines: any = [];
  xeroVendors: SelectItem[] = [];
  xeroAccounts: SelectItem[] = [];

  xeroDocumentSelected: any; //Selected Xero Document
  xeroVendorSelected: any = { xeroVendorID: 0, Addr1: '', City: '', State: '', Zip: '', Country: '' }; //Selected Xero Document
  xeroVendor: any = { line1Field: '', cityField: '', countrySubDivisionCodeField: '', postalCodeField: '', countryField: '' };

  xeroVendorsTemp: any = [];
  public msgs: Message[] = [];

  display: boolean = false;
  public ScanPdfPath: "https://ezzydoc.blob.core.windows.net/docs/1877022.pdf?sv=2014-02-14&sr=b&sig=2qUuACRgoCrFkgW%2FincJ6DMvsl7i7gl36G%2Bd%2F98pPfQ%3D&st=2018-09-09T08%3A30%3A47Z&se=2118-09-09T08%3A35%3A47Z&sp=r";


  constructor(private router: Router, private api: ApiService, private ss: StoreService, private http: HttpClient,
    private spinner: NgxSpinnerService) {

  }

  ngOnInit() {

    this.xeroVendorsTemp = this.ss.fetchXeroVendors();
    // this.checkXeroToken();
    this.bindVendors();
    this.bindAccounts();
    this.setPageSteps();
    this.getDocumentToApprove();
  }


  checkXeroToken() {

    var xeroID = this.ss.fetchXeroConnectID();
    this.api.get('Xero/CheckXeroToken?XeroID=' + xeroID, "").subscribe(
      (res: {}) => this.validateCheckXeroToken(res),
      error => this.failedCheckXeroToken(<any>error));
  }

  validateCheckXeroToken(res: any) {
    var token = this.ss.fetchToken();
    var xeroCoonnectID = this.ss.fetchXeroConnectID();
    if (res.StatusCode == 0) {

      if (res.Data.XeroTokenMinute < 0) {
        //window.location.href = this.api._xeroConnectUrl + token.toString();
        alert("Error in validateCheckXeroToken approve");
      }
    }
  }

  failedCheckXeroToken(res: any) {
    var token = this.ss.fetchToken();
    this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
  }


  bindVendors() {

    this.xeroVendors.push({ label: '', value: '' });
    this.xeroVendorsTemp.forEach(element => {
      this.xeroVendors.push({ label: element.displayNameField, value: element.idField });
    });
  }


  bindAccounts() {
    var tmpAccounts = this.ss.fetchXeroAccounts();
    this.xeroAccounts.push({ label: '', value: '' });
    tmpAccounts.forEach(element => {
      this.xeroAccounts.push({
        label: element.nameField, value:
        {
          XeroAccountName: element.nameField, XeroAccountID: element.idField
        }
      });
    });
  }





  setPageSteps() {
    this.steps = [{
      label: 'Upload Document',
      command: (event: any) => {
        this.activeIndex = 0;
        this.router.navigateByUrl('/docupload');
        //this.messageService.add({severity:'info', summary:'First Step', detail: event.item.label});
      }
    },
    {
      label: 'Review and Approve',
      command: (event: any) => {
        this.activeIndex = 1;
        this.router.navigateByUrl('/docapprove');
        //this.messageService.add({severity:'info', summary:'Seat Selection', detail: event.item.label});
      }
    },
    {
      label: 'Post to Draft',
      command: (event: any) => {
        this.activeIndex = 2;
        this.router.navigateByUrl('/docpost');
      }
    }
      // ,
      // {
      // label: 'Post to Authorised',
      // command: (event: any) => {
      //   this.activeIndex = 3;
      //   this.router.navigateByUrl('/docauth');
      // }
      // }
    ];

  }




  getDocumentToApprove() {

    this.spinner.show();
    this.api.get('Scan/GetXeroDocumentToApprove', '').subscribe(
      (res: {}) => this.sucessDocumentToApprove(res),
      error => this.failedDocumentToApprove(<any>error));

  }

  sucessDocumentToApprove(resp: any) {
    console.log(resp);
    this.xeroDocuments = resp.Data;

    this.spinner.hide();
  }

  failedDocumentToApprove(resp: any) {
    console.log(resp);
    this.spinner.hide();
  }


  onChangeApproveAll(event: any) {
    if (this.xeroDocuments != []) {
      this.xeroDocuments.forEach((item, index) => {
        item.Approved = event;
      });
    }
  }

  onChangeApprove(event: any, hdr: any) {


    //check if Vendor and Expense Account is selected 

    this.msgs = [];
    console.log(event);
    console.log(hdr);
    if ((hdr.XeroVendorID === 0 || hdr.XeroVendorID === null) && event.target.checked === true) {
      this.msgs.push({ severity: 'Info', summary: 'Vendor is a required field', detail: 'Please select a vendor.' });
      hdr.Approved = false;
      event.target.checked = false;
      return;
    }

    //check if expense account is seleced in all lines
    if (event.target.checked) {

      if (hdr.DocumentLine == null) {
        this.msgs.push({ severity: 'Info', summary: 'Expense Account is a required field', detail: 'Please select a Expense Account for bill lines.' });
        event.target.checked = false;
        return;
      }

      if (hdr.DocumentLine.length == 0) {
        this.msgs.push({ severity: 'Info', summary: 'Expense Account is a required field', detail: 'Please select a Expense Account for bill lines.' });
        event.target.checked = false;
        return;
      }

      hdr.DocumentLine.forEach(element => {
        if (element.XeroAccountID == 0) {
          this.msgs.push({ severity: 'Info', summary: 'Expense Account is a required field', detail: 'Please select a Expense Account for bill lines.' });
          event.target.checked = false;
          return;
        }
      });
    }

    hdr.Approved = event.target.checked;
    //Approve the bill
    this.api.post('Xero/ApproveXeroDocument', hdr).subscribe(
      (res1: {}) => this.successApproveDoc(res1),
      error => this.failedApproveDoc(<any>error));


  }

  successApproveDoc(resp: any) {
    console.log("successApproveDoc=>111111111111111");
  }

  failedApproveDoc(resp: any) {
    this.msgs = [];
    this.msgs.push({ severity: 'Error', summary: 'Failed to approve', detail: 'Failed to approve document.' });
  }


  // how to open PDF document
  openDocument1(document: File) {
    const fileReader: FileReader = new FileReader();
    fileReader.onload = () => {
      this.pdfViewer.openDocument(new Uint8Array(fileReader.result));
    };
    fileReader.readAsArrayBuffer(document);
  }


  viewdPdf(value: any) {
    //window.open(value.ScanBlob_Url);
    //this.ScanPdfPath = value.ScanBlob_Url;
    //this.display = true;

    //this.api.get('Scan/GetQbDocumentFile?XeroDocumentID=',value ).subscribe(
    //  (res: {}) => this.sucessDocumentFile(res),
    //  error => this.failedDocumentFile(<any>error));

    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    this.http.get(this.api.apiBaseUrl + 'Scan/GetQbDocumentFile?XeroDocumentID=' + value, { headers: headers, responseType: 'blob' }).subscribe(
      (res: {}) => this.sucessDocumentFile(res),
      error => this.failedDocumentFile(<any>error));


  }

  sucessDocumentFile(resp: any) {
    this.display = true;
    this.openDocument1(resp);
  }

  failedDocumentFile(resp: any) {
    //    this.display = true;


    // this.openDocument1(resp);
  }


  onChangeVendor(event: any) {

    this.xeroDocumentSelected.XeroVendorID = event.value;

    //alert(event.value);
    var vend = this.xeroVendorsTemp.find(xx => xx.idField == event.value)
    if (vend) {
      console.log(vend);
      this.xeroVendorSelected.Addr1 = vend.billAddrField.line1Field;
      this.xeroVendorSelected.City = vend.billAddrField.cityField;
      this.xeroVendorSelected.State = vend.billAddrField.countrySubDivisionCodeField;
      this.xeroVendorSelected.Zip = vend.billAddrField.postalCodeField;
      this.xeroVendorSelected.Country = vend.billAddrField.countryField;
      this.xeroVendorSelected.XeroVendorName = vend.displayNameField;


    }
  }

  onChangeAccount(line: any, accountlst: any) {
    if (line) {
      line.XeroAccountID = accountlst.XeroAccountID;
      line.XeroAccountName = accountlst.XeroAccountName;
    }
  }

  onXeroDocumentSelect(event) {

    this.xeroDocumentSelected = event.data;
    this.xeroVendorSelected.XeroVendorID = this.xeroDocumentSelected.XeroVendorID;
    this.xeroDocumentLines = event.data.DocumentLine;
  }

  openPdfDocument(document: any) {
    alert('123123');
    this.pdfViewer.openDocument(this.api.apiBaseUrl + "TempPdfDownload/temp.pdf");
  }



  // how to open PDF document
  openDocument(File: any) {

    // how to open PDF document


    this.pdfViewer.openDocument(File);

  }

  // how to create bookmark
  createBookmark() {
    this.pdfViewer.createBookmark().then(bookmark => {
      if (bookmark) {
        this.bookmarks.push(bookmark);
      }
    })
  }


}
