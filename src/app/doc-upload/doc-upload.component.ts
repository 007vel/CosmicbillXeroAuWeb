
import { style } from '@angular/animations';
import { Component, Injectable, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { StoreService } from '../store.service';
import { ApiService } from '../api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpHeaders, HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
//import Swal from 'sweetalert2';
//import Swal from 'sweetalert2';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import { PackagePurchaseHelper } from '../PackagePurchaseHelper';
import { forEach } from '@angular/router/src/utils/collection';
import { CosmicNotifyService } from '../CosmicNotifyService';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { Message, SelectItem } from 'primeng/primeng';
import { AppComponent } from '../app.component';
import { ok } from 'assert';
@Component({
  selector: 'app-doc-upload',
  templateUrl: './doc-upload.component.html',
  styleUrls: ['./doc-upload.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ApiService]
})

export class DocUploadComponent implements OnInit {

  steps: MenuItem[];
  activeIndex: number = 1;
  uploadedFiles: any[] = [];
  value: number = 0;
  postDocApiUrl: string;
  totalFiles: number = 0;
  indexOfFileInProgress: number = 0;
  progress: any;
  Scanning: any;

  clientFiles: any = [];
  fileIndex: number = 0;
  AsyncBackEndScanning: boolean = false;
  DirectPostfromEmail: boolean = false;
  totalDocumentProcessed: any = [];
  loadingMessage: any = "Loading...";
  disableUploadButton: boolean = false;

  public companyName: String = "No company is connected, Connect a company ";


  msgs: Message[] = [];

  constructor(private router: Router, private store: StoreService,private http: HttpClient, private api: ApiService,
    private spinner: NgxSpinnerService , private confirmationService: ConfirmationService, private packagePurchaseHelper: PackagePurchaseHelper,
     protected cosmicNotifyService: CosmicNotifyService, private appComponent: AppComponent, private ss: StoreService) {
      
    this.postDocApiUrl = api.apiBaseUrl + "scan/UploadDocumentXero?sessionID=1"


    this.companyName = this.ss.fetchCompanyName();

    if (!this.companyName) {
      this.companyName = "No company is connected, Connect a company";
    }


  }

  validateConnectCompany() {

    this.getXeroDetail();

    var companyName = this.ss.fetchCompanyName();
    var IsAuthorize = this.ss.fetchIsAuthorize();
    // //
    if (!IsAuthorize) {
      this.appComponent.connectCompanyMessage = "No company is connected, Connect a company";
      //  //
      this.confirmationService.confirm({
        message: 'No company is connected, Connect a company',
        accept: () => {
        },

        header: 'Error',
        acceptLabel: 'Ok',
        rejectVisible: false,


      });
    } else {
      this.appComponent.connectCompanyMessage = "";
    }



  }



  async ngOnInit() {
    this.spinner.show(); 
    await this.delay(5000);
    this.loadingMessage = "Package Validation...";
    this.validateConnectCompany();
    this.spinner.hide();
    

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
      }];
    this.packagePurchaseHelper.getSubscribedPlan();

  }

  getXeroDetail() {
    this.api.get('Xero/GetByAccountID', '').subscribe(
      (res: {}) => this.sucessXeroMaster(res),
      error => this.failedXeroMaster(<any>error));
  }

  failedXeroMaster(res: any) {
    this.spinner.hide();
  }

  sucessXeroMaster(res: any) {
    this.spinner.hide();
    if (res.StatusCode == 0 && res.Data[0]) {
      this.store.storeXeroConnectID(res.Data[0].XeroID);
      this.store.storeCompanyName(res.Data[0].CompanyName);

      var companyName = res.Data[0].CompanyName;

      this.AsyncBackEndScanning = res.Data[0].AsyncBackEndScanning;
      this.DirectPostfromEmail = res.Data[0].DirectPostfromEmail
    }
  }


  checkXeroToken() {
    var xeroID = this.store.fetchXeroConnectID();
    this.api.get('Xero/CheckXeroToken?XeroID=' + xeroID, "").subscribe(
      (res: {}) => this.validateCheckXeroToken(res),
      error => this.failedCheckXeroToken(<any>error));
  }

  validateCheckXeroToken(res: any) {
    var token = this.store.fetchToken();
    if (res.StatusCode == 0) {

      if (res.Data.XeroTokenMinute < 0) {
        //window.location.href = this.api._xeroConnectUrl + token.toString();
        alert("Error in validateCheckXeroToken");
      }

    }
  }

  failedCheckXeroToken(res: any) {
    var token = this.store.fetchToken();
    this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
  }

  onUpload(event) {

    // //
    this.totalFiles = 0;
    this.spinner.hide();

    for (let file of event.files) {

      this.uploadedFiles.push(file);
    }

  }

  onBeforeSend(event) {
    //Not being triggred
    var xeroConnectID = this.store.fetchXeroConnectID();
    var token = this.store.fetchToken();

    event.xhr.setRequestHeader("CosmicBill-UserToken", token);
    event.xhr.setRequestHeader("CosmicBill-XeroConnectID", xeroConnectID);
    event.xhr.setRequestHeader("CosmicBill-PlatformID", '3');
  }

  onProgress(event) {
    //Not being triggred
  }

  onSelect(event) {

    console.log("onSelect");
    this.indexOfFileInProgress = 1;
    this.totalFiles = this.totalFiles + event.files.length;
    console.log("totalFiles" + this.totalFiles);
    var availableTotalPdfCount = this.packagePurchaseHelper.GetAvailablePDf();
    console.log("availableTotalPdfCount" + availableTotalPdfCount);

    if (!this.packagePurchaseHelper.IsAutoRenewal && !this.packagePurchaseHelper.IsPaidPlan) {
      if (this.totalFiles > availableTotalPdfCount) {
        console.log("this.totalFiles > availableTotalPdfCount" + availableTotalPdfCount);
        this.msgs = [];
        this.msgs.push({ severity: 'Info', summary: 'You Do Not Have Enough Package To Process Please Subscribe Above', detail: 'You have available( ' + availableTotalPdfCount + ') pdfs cannot exceed the limit .' });
        this.uploadedFiles = [];
        this.totalFiles = 0;

        return;
      }
    }

    for (let file of event.files) {
      this.fileIndex++
      this.uploadedFiles.push({ myfile: file, fileId: this.fileIndex, ScanInvoiceID: 0, DocumentID: 0, status: 0, progressMessage: '' });
    }
  }

  ShowPlanSelectionWindow() {
    this.packagePurchaseHelper.NavigateToPackageApp();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async myUploader(event) {
     
    if (this.uploadedFiles.length == 0) {
      return;
    }
    var processingCount = 0;
    this.disableUploadButton = true;
    this.spinner.show();

    this.loadingMessage = "Package Validation...";
    this.packagePurchaseHelper.getSubscribedPlan();

    await this.delay(4000);
     
    var availableTotalPdfCount = this.packagePurchaseHelper.GetAvailablePDf();

    if ((availableTotalPdfCount < 1 || availableTotalPdfCount == undefined ) && !this.packagePurchaseHelper.UserIsEligibleForXeroPlanOws) {
      if (this.packagePurchaseHelper.IsAutoRenewal && this.packagePurchaseHelper.IsPaidPlan) {
         
        this.loadingMessage = "Auto Renewal...";
        console.log(" IsAutoRenewal true");
        this.api.post('Admin/AutoRenewal', null).subscribe(
          (res1: {}) => this.autorenewalSuccess(),
          error => this.autorenewalfailed());
        await this.delay(15000);
        this.packagePurchaseHelper.getSubscribedPlan();
        await this.delay(4000);
        var availableTotalPdfCount = this.packagePurchaseHelper.GetAvailablePDf();
        if (availableTotalPdfCount < 1 || availableTotalPdfCount == undefined) {
          return;
        }
      } else {
         
        this.SHowLowpDfcountDialog();
        this.spinner.hide();
        this.disableUploadButton = false;
        return;
      }

    }
    this.loadingMessage = "Processing...";
    if (availableTotalPdfCount < this.uploadedFiles.length && !this.packagePurchaseHelper.UserIsEligibleForXeroPlanOws) // uploding more than count
    {
       
      console.log("========== no pdf count=" + this.uploadedFiles.length);
      console.log("======== available count=" + availableTotalPdfCount);
      var sliced = this.uploadedFiles.slice(0, availableTotalPdfCount);
      console.log("========== no count after slice length=" + sliced.length);
      this.uploadedFiles = sliced;
      this.totalFiles = this.uploadedFiles.length;
      sliced.forEach(el => {
        el.progressMessage = "Uploading...";
        this.onUploadclick(el);
      });

    } else {
       
      console.log("========== count available");
      this.uploadedFiles.forEach(el => {
        el.progressMessage = "Uploading...";
        this.onUploadclick(el);
      });
    }
  }
  autorenewalSuccess() {
    console.log("autorenewalSuccess");
  }
  autorenewalfailed() {
    console.log("autorenewalfailed");
  }
  onUploadclick(event) {
     
    if (this.packagePurchaseHelper.CheckAvailablePackageCount() || this.packagePurchaseHelper.UserIsEligibleForXeroPlanOws) {
      this.uploadBills(event);
    } else {
      // //
      this.SHowLowpDfcountDialog();
    }
  }

  private SHowLowpDfcountDialog() {
    this.confirmationService.confirm({
      message: "You don't have enough package to process bills, please select package...",
      accept: () => {
        this.loadingMessage = "Package selection...";
        this.packagePurchaseHelper.NavigateToPackageApp();
        // window.close();
      },
      reject: () => {
      }
    });
  }

  clickMethod(name: string): boolean {
    if (confirm("Are you sure to delete " + name)) {
      console.log("Implement delete functionality here");
      return true;
    } else {
      return false;
    }
  }
  public openConfirmationDialog(element: any) {
    // this.confirmationDialogService.confirm('Alert..', 'Upgrade your membership to upload bills ... ?');
  }
  // upload(element) {
  //   this.uploadBills(element);

  // }

  uploadBills(element) {

    element.status = 1;
    //this.spinner.show();

    const formData = new FormData();

    // for (let file of files)
    //   formData.append(file.name, file);

    formData.append(element.fileId, element.myfile);

    const uploadHdr = this.getHeader();

    const uploadReq = new HttpRequest('POST', this.postDocApiUrl, formData, {
      headers: uploadHdr
      // reportProgress: true,

    });

    this.http.request(uploadReq).subscribe(
      (res: {}) => this.sucessUpload(res),
      error => this.failedUpload(<any>error));

  }

  getHeader(): any {
    let xeroConnectID = this.store.fetchXeroConnectID();
    let token = this.store.fetchToken();
    token = token === null ? "" : token;
    xeroConnectID = xeroConnectID === null ? "" : xeroConnectID;
    return new HttpHeaders(
      {
        'CosmicBill-UserToken': token.toString(),
        'CosmicBill-XeroConnectID': xeroConnectID.toString(),
        'CosmicBill-PlatformID': '3',

      }
    );
  }

  sucessUpload(resp: any) {
    //this.spinner.hide();
    console.log(resp);
    if (resp != null) {
      if (resp.body != null) {
        if (resp.body.StatusCode === 0 && resp.body.Data != undefined) {

          var myfile = this.uploadedFiles.find(ff => ff.fileId == resp.body.Data[0].ClientFileID);
          if (myfile != null) {
            if (this.AsyncBackEndScanning == true || this.DirectPostfromEmail == true) {

              var myfile = this.uploadedFiles.find(ff => ff.fileId == resp.body.Data[0].ClientFileID);
              if (myfile != null && this.totalFiles > 0) {
                myfile.ScanInvoiceID = resp.body.Data[0].ScanInvoiceID;
                myfile.DocumentID = resp.body.Data[0].DocumentID;
                this.totalDocumentProcessed.push(resp.body.Data[0].DocumentID);


                myfile.status = 3
                myfile.progressMessage = "Upload Completed.";
                this.indexOfFileInProgress = this.indexOfFileInProgress + 1;
                this.loadingMessage = "Processing " + this.indexOfFileInProgress + " / " + this.totalFiles;
                if ((this.indexOfFileInProgress - 1) == this.totalFiles) {

                  this.indexOfFileInProgress = this.indexOfFileInProgress - 1;
                  this.loadingMessage = "Processing " + this.indexOfFileInProgress + " / " + this.totalFiles;
                  this.DoRightAfterUpload();
                  setTimeout(() => {

                    this.insertQboJob(this.totalDocumentProcessed.toString())


                  }, 1000);

                }

              }
            }
            else {
              this.DoRightAfterUpload();
              myfile.ScanInvoiceID = resp.body.Data[0].ScanInvoiceID;
              myfile.DocumentID = resp.body.Data[0].DocumentID;

              myfile.status = 2
              myfile.progressMessage = "Scanning...";
              //look for scan invoice id

              this.scanDocument(resp.body.Data[0]);
            }

          }
        }
      }
    }
  }

  insertQboJob(documentIDs: any) {
    this.api.get('Scan/InsertQboJob?documentIDs=', documentIDs.toString()).subscribe(
      (res: {}) => this.successInsertQboJob(res),
      error => this.failedInsertQboJob());
  }
  successInsertQboJob(resp: any) {
    if (resp.StatusCode == 0) {
      this.spinner.hide();
      if (this.DirectPostfromEmail == true) {
        Swal.fire('', 'No need to wait!..\n We will scan & post the documents and notify you by the email.You will then see your documents in your Accounting System ', 'info');
        //   this.confirmationService.confirm({
        //     message: "No need to wait!..\n We will scan & post the documents and notify you by the email.You will then see your documents in your Accounting System ",
        // });
      } else
        Swal.fire('', 'No need to wait!..\n We will scan the Documents and notify you by the email.You will then approve at step 3 and post the documents at step 4', 'info');
      //  this.confirmationService.confirm({
      //   message: "No need to wait!..\n We will scan the Documents and notify you by the email.You will then approve at step 3 and post the documents at step 4",
      //  });
      if (this.uploadedFiles != null)
        this.uploadedFiles = [];

      this.fileIndex = 0;
      this.indexOfFileInProgress = 1;
      this.totalFiles = 0;
      this.totalDocumentProcessed = [];
    }
  }

  private DoRightAfterUpload() {
    this.cosmicNotifyService.myEventEmiter.emit();
    this.packagePurchaseHelper.getSubscribedPlan();
    this.disableUploadButton = false;
  }
  failedInsertQboJob() {
    this.spinner.hide();

  }
  failedUpload(resp: any) {

  }

  sucessDocumentToBill(resp: any) {
    console.log(resp);
    this.spinner.hide();
    this.router.navigateByUrl('/docreview');

  }

  failedDocumentToBill(resp: any) {
    console.log(resp);
    this.spinner.hide();
    this.router.navigateByUrl('/docreview');


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


          //Getting File uploaded object
          var myfile = this.uploadedFiles.find(ff => ff.ScanInvoiceID == resp.Data.ScanInvoiceID);
          if (myfile != null) {
            myfile.status = 3
            myfile.progressMessage = "Scanning Completed.";
          }


          this.indexOfFileInProgress = this.indexOfFileInProgress + 1;

          if ((this.indexOfFileInProgress - 1) == this.totalFiles) {

            this.indexOfFileInProgress = this.indexOfFileInProgress - 1;
            setTimeout(() => {
              this.spinner.hide();
              this.router.navigateByUrl('/docreview');
            }, 2000);

          }
        }

      }
    }

  }

  failedScanDocument(resp: any) {
    console.log(resp);
    this.spinner.hide();
  }


  clearAll(event) {

    if (this.uploadedFiles != null)
      this.uploadedFiles = [];

    this.fileIndex = 0;
    this.indexOfFileInProgress = 1;
    this.totalFiles = 0;
  }

  removeFile(my: any) {
    const index: number = this.uploadedFiles.indexOf(my);
    if (index !== -1) {
      this.uploadedFiles.splice(index, 1);

      if (this.uploadedFiles.length == 0) {

        this.clientFiles = [];
        this.fileIndex = 0;
        this.indexOfFileInProgress = 1;
        this.totalFiles = 0;
      }

    }
  }

}

