import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { Message, SelectItem, ConfirmationService } from 'primeng/primeng';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { StoreService } from '../store.service';
@Component({
  selector: 'app-xero-connect',
  templateUrl: './xero-connect.component.html',
  styleUrls: ['./xero-connect.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class XeroConnectComponent implements OnInit {

  code :string;
  xeroTokenTemp: any = [];
  constructor(private router: Router, private api: ApiService, private http: HttpClient,
    private spinner: NgxSpinnerService, private ss: StoreService) { }

  ngOnInit() {
  }

  getToken(){
    console.log(this.xeroTokenTemp);
    alert(222);
console.log(this.code);
    this.xeroTokenTemp.Code =this.code
    this.api.post('Xero/GetXeroTokenByUrl',this.xeroTokenTemp).subscribe(
      (res1: {}) => this.successToken(res1),
      error => this.failed(<any>error));
  }

  successToken(res:any){
    console.log(res);
    this.router.navigate(['/initlogin']);
  }

  failed(res:any){
    
  }

  getRequest(){
    
    this.api.post('Xero/GetXeroRequestUrl',"").subscribe(
      (res1: {}) => this.successUrl(res1),
      error => this.failed(<any>error));
  }
  
  successUrl(res:any){
    console.log("xero");
    console.log(res);
   
      this.xeroTokenTemp = res;
       console.log('this.xeroTokenTemp');
       alert(this.xeroTokenTemp.XeroUrl)

       window.open(
        this.xeroTokenTemp.XeroUrl,
        '_blank' // <- This is what makes it open in a new window.
      );

      // var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
     //  window.open(this.xeroTokenTemp.XeroUrl);
      // window.open(this.xeroTokenTemp.XeroUrl, "_blank", strWindowFeatures);
      // console.log(this.xeroTokenTemp.XeroUrl);
      // window.open().location.href = this.xeroTokenTemp.XeroUrl;
  }

}
