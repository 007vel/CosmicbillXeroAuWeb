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

@Component({
	selector: 'app-doc-auth',
	templateUrl: './doc-auth.component.html',
	styleUrls: ['./doc-auth.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [ApiService, ConfirmationService]
})

export class DocAuthComponent implements OnInit {
	steps: MenuItem[];
	activeIndex: number = 4;
	xeroDocumentLines: any = [];
	rowGroupMetadata: any;
	msgs: Message[] = [];
	ScanPdfPath: any;
	loadingMessage: any = "Loading...";
	connectCompanyMessage: any = "";
	isViewerHidden:any= false; 
	display: boolean = false;
  
	@ViewChild(SimplePdfViewerComponent) private pdfViewer: SimplePdfViewerComponent;
	bookmarks: SimplePDFBookmark[] = [];

	constructor(private router: Router, private api: ApiService, private http: HttpClient, private spinner: NgxSpinnerService,
		private confirmationService: ConfirmationService, private ss: StoreService) { }

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
			label: 'Post to Draft',
			command: (event: any) => {
			  this.activeIndex = 3;
			  this.router.navigateByUrl('/docpost');
			}
		  }
		  ,
			  {
				label: 'Post to Authorised',
				command: (event: any) => {
				  this.activeIndex = 4;
				  this.router.navigateByUrl('/docauth');
				}
			  }
		];
	
		this.getDocumentToBill();
	 }

	 checkXeroToken() {

		var xeroID =this.ss.fetchXeroConnectID();
		this.api.get('Xero/CheckXeroToken?XeroID='+ xeroID,"").subscribe(
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


	  getDocumentToBill() {

		this.spinner.show();
		this.api.get('Scan/GetXeroDocumentToAuth', '').subscribe(
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

	  onSort() {
		this.updateRowGroupMetaData();
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


	  
  selectAllAsDefault(){
    this.xeroDocumentLines.forEach(element => {
      element.SelectToBill = true;

    });
	}
	
	postToXero() {


    var xeroSelectedDocument = this.xeroDocumentLines.filter(xx => xx.SelectToBill == true);

    if (xeroSelectedDocument == null) {

      this.msgs = [];
      this.msgs.push({ severity: 'Info', summary: 'Please select a document atleast', detail: 'Mandatory.' });
      return;
    }


    

    this.confirmationService.confirm({
      message: 'Are you sure that you want to post all selected document(s) to Auth',
      accept: () => {
        this.spinner.show();
        this.loadingMessage = "Posting to Auth...";
        this.api.post('Xero/BillAuthProcess', xeroSelectedDocument).subscribe(
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
    this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Document posted to Auth successfully' });
    this.getDocumentToBill();
  }

  failedCreateBill(resp: any) {
    this.spinner.hide();
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Failed', detail: 'Please try again' });
  }

  showHideViewer(){
    this.isViewerHidden = !this.isViewerHidden;
  }
	

	getRecordClass(index:any, docType:any)
  {
      if(docType == "CreditNote"){
        return 'creditNote'
      }
      else{
       return (index % 2 === 0) ? 'odd' : 'even' ;
      }
    
	}
	
	failedDocumentFile(resp: any) {
    this.spinner.hide();
  }

  onChangeApproveAll(event: any) {

    this.xeroDocumentLines.forEach(element => {
      element.SelectToBill = event.target.checked;

    });
  }

  onChangeApprove(event: any, hdr: any) {
    console.log(hdr.DocumentID);
    
    var lines = this.xeroDocumentLines.filter(xx => xx.DocumentID == hdr.DocumentID);
    if(lines != null){
      lines.forEach(element => {
        element.SelectToBill = event.target.checked;
  
      });

    }
    
  }
	
}