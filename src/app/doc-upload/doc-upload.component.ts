import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { Router } from '@angular/router';
import { StoreService } from '../store.service';
import { ApiService } from '../api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpHeaders, HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import Swal from 'sweetalert2';

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
  connectCompanyMessage: string= "";
  clientFiles:any=[];
  fileIndex:number = 0;
  AsyncBackEndScanning:boolean=false;
  DirectPostfromEmail:boolean=false;
  totalDocumentProcessed:any=[];
  loadingMessage: any = "Loading...";



  constructor(private router: Router, private store: StoreService,
     private http: HttpClient, private api: ApiService, 
     private spinner: NgxSpinnerService) {
    this.postDocApiUrl = api.apiBaseUrl + "scan/UploadDocumentXero?sessionID=1"
  
  }
  
  validateConnectCompany() {
    this.getXeroDetail();
    var companyName = this.store.fetchCompanyName();
    if (companyName == '' || companyName == null) {
      this.connectCompanyMessage = "No company is connected, Connect a company from Switch Company menu";
    }else{

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


  }

  getXeroDetail(){
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
      if (companyName == '' || companyName === null) {
        this.connectCompanyMessage = "No company is connected, Connect a company from Switch Company menu";
      }
      this.AsyncBackEndScanning=res.Data[0].AsyncBackEndScanning;
      this.DirectPostfromEmail=res.Data[0].DirectPostfromEmail
    }
  }


  checkXeroToken() {
    var xeroID =this.store.fetchXeroConnectID();
    this.api.get('Xero/CheckXeroToken?XeroID='+ xeroID,"").subscribe(
      (res: {}) => this.validateCheckXeroToken(res),
      error => this.failedCheckXeroToken(<any>error));
  }
  
  validateCheckXeroToken(res: any) {
    var token = this.store.fetchToken();
     if (res.StatusCode == 0) {
   
       if (res.Data.XeroTokenMinute < 0) {
         window.location.href = this.api._xeroConnectUrl + token.toString();
       }
       
     }
   }
  
  failedCheckXeroToken(res: any) {
    var token = this.store.fetchToken();
    this.router.navigate(['/initlogin/' + token.toString() + '/0/login']);
  }

  onUpload(event) {

    
    this.totalFiles = 0;
    this.spinner.hide();

    for (let file of event.files) {

      this.uploadedFiles.push(file);
    }

    // this.router.navigateByUrl('/docreview');
    //this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
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

    this.indexOfFileInProgress = 1;
    this.totalFiles = this.totalFiles + event.files.length;
    
    for (let file of event.files) {
      this.fileIndex++
      this.uploadedFiles.push( {myfile: file, fileId:this.fileIndex, ScanInvoiceID:0,DocumentID:0, status:0,progressMessage:''});
    }
  }

  myUploader(event) {
   
    this.uploadedFiles.forEach(element => {
      console.log('element'+element);
      console.log('element'+element.myfile);
      console.log('element'+element.myfile.name);
      element.progressMessage = "Uploading...";
      this.upload(element);
    });
  }

  upload(element) {
  
    element.status = 1;
    this.spinner.show();

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
    token = token===null?"":token;
    xeroConnectID = xeroConnectID === null?"":xeroConnectID;
    return new HttpHeaders(
      {
        'CosmicBill-UserToken': token.toString(),
        'CosmicBill-XeroConnectID': xeroConnectID.toString(),
        'CosmicBill-PlatformID': '3',

      }
    );
  }

  sucessUpload(resp: any) {
this.spinner.hide();
    console.log(resp);
    if (resp != null) {
      if (resp.body != null) {
        if (resp.body.StatusCode === 0 && resp.body.Data!=undefined ) {

          var myfile = this.uploadedFiles.find(ff=> ff.fileId == resp.body.Data[0].ClientFileID);
          if(myfile != null){
            if(this.AsyncBackEndScanning==true || this.DirectPostfromEmail==true){

              var myfile = this.uploadedFiles.find(ff=> ff.fileId == resp.body.Data[0].ClientFileID);
              if(myfile != null && this.totalFiles>0){
                myfile.ScanInvoiceID = resp.body.Data[0].ScanInvoiceID;
                myfile.DocumentID = resp.body.Data[0].DocumentID;
                this.totalDocumentProcessed.push(resp.body.Data[0].DocumentID);
                
                
                myfile.status = 3
                myfile.progressMessage = "Upload Completed.";
                this.indexOfFileInProgress = this.indexOfFileInProgress + 1;
                this.loadingMessage= "Processing "+this.indexOfFileInProgress+" / " +this.totalFiles;
                if ((this.indexOfFileInProgress - 1) == this.totalFiles) {
            
                  this.indexOfFileInProgress = this.indexOfFileInProgress - 1;
                  this.loadingMessage= "Processing "+this.indexOfFileInProgress+" / " +this.totalFiles;
    
                  setTimeout(() => {
                  
                    this.insertQboJob(this.totalDocumentProcessed.toString())
                    
                   
                  }, 1000);
            
                }
    
              }
            }
            else{
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

  insertQboJob(documentIDs:any){
    this.api.get('Scan/InsertQboJob?documentIDs=',documentIDs.toString()).subscribe(
      (res: {}) => this.successInsertQboJob(res),
      error => this.failedInsertQboJob());
  }
  successInsertQboJob(resp:any){
    if(resp.StatusCode==0){
    this.spinner.hide();
    if(this.DirectPostfromEmail==true){
      Swal.fire('','No need to wait!..\n We will scan & post the documents and notify you by the email.You will then see your documents in your Accounting System ','info');
    }else 
       Swal.fire('','No need to wait!..\n We will scan the Documents and notify you by the email.You will then approve at step 3 and post the documents at step 4','info');
    if(this.uploadedFiles != null)
      this.uploadedFiles = [];

    this.fileIndex = 0;
    this.indexOfFileInProgress = 1;
    this.totalFiles = 0;
    this.totalDocumentProcessed=[];
  }
  }
  failedInsertQboJob(){
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
          var myfile = this.uploadedFiles.find(ff=> ff.ScanInvoiceID == resp.Data.ScanInvoiceID);
          if(myfile != null){
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


  clearAll(event){
    
    if(this.uploadedFiles != null)
      this.uploadedFiles = [];

      this.fileIndex = 0;
      this.indexOfFileInProgress = 1;
      this.totalFiles = 0;
  }

  removeFile(my:any){
    const index: number = this.uploadedFiles.indexOf(my);
    if (index !== -1) {
        this.uploadedFiles.splice(index, 1);

    if(this.uploadedFiles.length == 0){
      
      this.clientFiles = [];
      this.fileIndex = 0;
      this.indexOfFileInProgress = 1;
      this.totalFiles = 0;
    }

    }  
  }

}

