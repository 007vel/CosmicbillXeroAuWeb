import { Component, OnDestroy, OnInit, ViewEncapsulation, Output, EventEmitter, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params, Data, NavigationEnd } from '@angular/router';
import { StoreService } from '../store.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../api.service';
import './init-login.component.css';
import { appendFile } from 'fs';
//import { authService } from 'auth-service';
import { Issuer } from 'openid-client';
import { EncryptingService } from '../encrypting.service';
import { ParameterHashLocationStrategy } from '../ParameterHashLocationStrategy';
import { HomelayoutComponent } from '../homelayout/homelayout.component';
import { Console } from 'console';
import { AppComponent } from '../app.component';
import { stringhelper } from '../stringhelper';
import { forEach } from '@angular/router/src/utils/collection';


@Component({
  selector: 'app-init-login',
  templateUrl: './init-login.component.html',
  providers: [ApiService],
  encapsulation: ViewEncapsulation.None
})
export class InitLoginComponent implements OnInit, OnDestroy {

  token: string = null;
  code: string = null;
  IsloginFlow: boolean = null;
  ReAuthXeroUI: boolean = null;
  paramToken: string = null;
  xeroConnectID: string;
  returnUrl: string;
  loadingMessage: string = "Please wait...";
  private sub: any;
  xeroTokenTemp: any = {};
  companyInfo:any;
  Listcompany: any[];
  private encrypt: EncryptingService;
  private accountName: string = "";
  defaultVendors: any;
  xeroCompany: any[] =[];
  documentCompany :any[] ;
  allCompanies: any = [];
  CurrentAccountId : any ;
  constructor(private route: ActivatedRoute, private router: Router, private ss: StoreService, private api: ApiService, private spinner: NgxSpinnerService, private _encrypt: EncryptingService, private appComponent: AppComponent) {
    this.encrypt = _encrypt;
  }
  show : boolean= false;

  openpopup(){
    this.show =true;
  }
  showSelectCompany : boolean =false;
  navigate : boolean = false;
  // @Output() usernameEmitter = new EventEmitter<string>();

  // PostData() {  
  //     this.usernameEmitter.emit(this.accountName);  
  // } 
  async ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      this.documentCompany = this.defaultVendors;
      this.code = ParameterHashLocationStrategy.authCode;
      ParameterHashLocationStrategy.authCode = null;
      ParameterHashLocationStrategy.signinFlow = false;
      this.IsloginFlow = params['IsLoginFlow'];
      this.ReAuthXeroUI = params['ReAuthXeroUI'];
      //
      debugger;
      console.log("Auth code:" + this.code);
      this.delay(1000);
      var accessTokenFromStore = this.ss.fetchToken();
      debugger;
      if (accessTokenFromStore != null) {
        debugger;
        if (ParameterHashLocationStrategy.planId != null) {
          this.router.navigate(['/myaccount']);
        } else {
          debugger;
          // NOrmal login work flow
          console.log("Init flow 1 ==========>");
          this.GetAccount();

          // Get Company Call
          // if(confirm("Are You Want to add company")){                              
          //   this.openpopup();
          // }
           

          // if(this.navigate){
          //   //this.router.navigate(['/docupload']);  
          // }
          // me
          //this.router.navigate(['/docupload']);
        }

      } else {
        debugger;
        if (this.code && this.code.length > 20) {
          console.log("Init flow 2 ==========>");
          var email = this.ss.fetchEmail();
          var email = this.ss.fetchUserName();
          //
          if (!stringhelper.IsNullOrEmptyOrDefault(email) || !stringhelper.IsNullOrEmptyOrDefault(email)) {
            this.ReAuthXeroUI = this.ss.fetchIsReAuthFlow();
            this.getToken();
            this.ss.storeIsReAuthFlow(false);
          } else {
            this.ss.storeXeroAuthUrl(ParameterHashLocationStrategy.authUrl);
            this.router.navigate(['/signup']);
          }

        } else if (this.IsloginFlow) {
          console.log("Init flow 3 ==========>");
          this.ss.storeIsReAuthFlow(this.ReAuthXeroUI);
          this.delay(1000);
          var connectUrl = "https://login.xero.com/identity/connect/authorize?response_type=code&client_id=" + this.api.xeroclientId + "&redirect_uri=" + this.api.xeroCallbackUrl + "&scope=" + this.api.xeroScope;
          console.log(connectUrl);
          window.location.href = connectUrl;
        } else {
          console.log("Init flow 4 ==========>");
          this.router.navigate(['/login']);
        }
      }
    });
  }  

  onnavigatetoUpload(){
    this.router.navigate(['/docupload']);
  }

  OnSaveClick(){
    if(confirm("Save Clicked")){
      debugger;
      //this.show = false;
      var allcompany = this.allCompanies;
      var selectedCompany = this.documentCompany;
      let selectedCompanyObject : any = [];
    
      allcompany.forEach(element => {
        element.Name;
        element.LegalName;
        
        debugger;
        if(selectedCompany == element.Name) {
          debugger;
          selectedCompanyObject = element;
        }
      });

      
      if(selectedCompanyObject != null){
        if(this.CurrentAccountId != null){
          selectedCompanyObject.AccountID = this.CurrentAccountId;
          console.log("Current Account Id : "+this.CurrentAccountId);
        }
        // API Call => if Sucess then navigation
         this.api.post('Xero/SaveSelectedCompany', selectedCompanyObject).subscribe(
        (res1: {}) => this.successSaveSelectedCompany(res1),
        error => this.failedSaveSelectedCompany(<any>error));
      }
      alert("Save Ok Clicked");
    }else{
      this.show = false;
      alert("Save No Clicked");
 
    }
  }
  successSaveSelectedCompany(res1: any){
    // Navigates to Upload
    debugger;
    this.show = false;
    alert("Navigate To Upload Page");
    this.DoLoginAftergettingCode();
  }
  failedSaveSelectedCompany(res: any){
    debugger;
    this.DoLoginAftergettingCode();
  }

  OnCancelClick(){
    if(confirm("Cancel Clicked")){
      alert("Cancel Ok Clicked");
      this.show = false;
    }else{
      alert("Cancel No Clicked");
    }
  }

  onChangeCompany(event: any) {
    // save company in var on the dropdown event changed
    debugger;
    this.documentCompany = event.value;
  }
  getToken() {
    console.log('getToken entered' + this.ss.fetchUserName());
    this.xeroTokenTemp.Code = this.code
    this.xeroTokenTemp.UserName = this.ss.fetchUserName();
    console.log('getToken request:', JSON.stringify(this.xeroTokenTemp));
    this.api.post('Xero/GetXeroAccessTokenByCode', this.xeroTokenTemp).subscribe(
      (res1: {}) => this.successGetXeroAccessTokenByCode(res1),
      error => this.failed(<any>error));
  }

  successGetXeroAccessTokenByCode(res: any) {
    console.log("successGetXeroAccessTokenByCode " + JSON.stringify(res));
     
      // show 
      var result = res;
      this.CurrentAccountId = res.AccountID;
      if(res.UIOrgList != null){
        console.log(res.UIOrgList);
        //this.DoLoginAftergettingCode();
        var length = res.UIOrgList.length;
        console.log("Company Count/Length -"+length);
        
          debugger;
          // Define the object you want to add
          //let newObj = { key: 'example', value: 42 };
           
          // Use a for loop to add the object to the array
          for (let i = 0; i < length; i++) {
            this.allCompanies.push(res.UIOrgList[i]);
          }
           
          // Print the updated array
          // console.log(this.allCompanies);
          // for (const company of this.allCompanies) {
          //   console.log("--- Loop 1 for---");
          //   console.log("--- Company : "+ company);
          //   this.xeroCompany.push({ label: company.Name, value: company.Name });
          // }
          debugger;
          this.xeroCompany.push({ label: "Select Company", value: "" });
          this.allCompanies.forEach(element => {
            console.log("--- Loop 2 foreach---");
            console.log("--- Company  : "+ element);
            this.xeroCompany.push({ label: element.Name, value: element.Name });
          });
           
          
      }
      else{
        console.log("")
        //this.DoLoginAftergettingCode();
      }
      console.log("All Companies Count  from Xero -"+this.allCompanies.length);
      debugger;
      if(confirm("Are You Want to add company")){
        this.openpopup();
      }

    // me 
    // this.DoLoginAftergettingCode();
  }

  failed(res: any) {

  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  DoLoginAftergettingCode() {
    var loginData = { 'UserName': this.ss.fetchUserName(), 'Password': this.ss.fetchPassword() }

    console.log('>>>>>>>>>>init-login');
    this.api.postAsEndUser('login/DoLogin', loginData).subscribe(
      (res: {}) => this.SaveLoginresponse(res),
      error => this.SaveLoginresponse(<any>error));
  }

  GetAccount() {
    console.log('GetAccounts entered');
    this.appComponent.GetAccount();// there are two account GET, this one is invokes the appcomponent to fetch the IsAuthorize
    this.api.get('Xero/GetByAccountID', '').subscribe( 
      (res: {}) => this.SaveAccount(res),
      error => this.failedXeroMaster(<any>error));
  }

  SaveLoginresponse(res: any) {
    // //
    console.log("SaveLoginresponse" + JSON.stringify(res));
    if (res.StatusCode == 0) {

      this.ss.storeToken(res.Data.Token.toString());
      this.ss.storeCsomicAccountID(res.Data.AccountID.toString());
      //
      this.ss.storeIsAuthorize(res.Data.IsAuthrorize);
      if (this.ReAuthXeroUI + "" == "true") {
      } else {
        this.DefaultPlanAssign();
      }

    }
    this.GetAccount();
  }

  private DefaultPlanAssign() {
    this.api.post('Admin/SaveSubscriptionMasterinCosmic', { 'PlanID': 8988, "IsDefaultSubscription": true }).subscribe(
      (res1: {}) => this.DefaultPlanAssignSuccess(),
      error => this.DefaultPlanAssignError());
  }

  DefaultPlanAssignSuccess() {

  }

  DefaultPlanAssignError() {

  }
  getRequest() {

    this.api.post('Xero/GetXeroRequestUrl', "").subscribe(
      (res1: {}) => this.successUrl(res1),
      error => this.failed(<any>error));
  }

  successUrl(res: any) {
    console.log("xero");
    console.log("succcessUrl", JSON.stringify(res));
    //this.getToken();
    this.xeroTokenTemp = res;
    console.log('this.xeroTokenTemp');
    alert(this.xeroTokenTemp.XeroUrl)

    window.open(
      this.xeroTokenTemp.XeroUrl,
      '_blank' // <- This is what makes it open in a new window.
    );
  }
  SaveAccount(res: any) {
    if (res.StatusCode == 0) {
      if (res.Data != null) {

        if (res.Data.length > 0) {

          var token = this.ss.fetchToken();

          if (res.Data.length == 1) {
            this.ss.storeXeroConnectID(res.Data[0].XeroID);
            this.ss.storeCompanyName(res.Data[0].CompanyName);

            this.returnUrl = 'login';
            this.getAllXeroAccount();

          }
          else {
            this.router.navigate(['/switchcompany']);
          }

        }
        else {
          var token = this.ss.fetchToken();
          //window.location.href = this.api._xeroConnectUrl + token + "&xeroConnectID=" + this.xeroConnectID;
          alert("Error in Account save");
        }
      }
    }
  }

  failedXeroMaster(res: any) {
    console.log('failedXeroMaster entered');
  }

  getAllXeroAccount() {
    this.loadingMessage = "Getting Chart of Accounts...";
    this.spinner.show();
    this.api.get('Xero/GetAllAccount?isRefresh=true', '').subscribe(
      (res: {}) => this.saveAllXeroAccount(res),
      error => this.failedAllXeroAccount(<any>error));

  }

  saveAllXeroAccount(resp: any) {
    console.log(resp);
    this.ss.storeXeroAccounts(resp.Data);
    this.getXeroVendor();
  }

  failedAllXeroAccount(resp: any) {
    // //
    console.log(resp);
    console.log(resp.statusText);
    console.log(resp.error)
    console.log(resp.error.Error)
    this.spinner.hide();
    if (resp != null) {
      if (resp.error.Error == "XERO_TOKEN_EXPIRED") {
        var token = this.ss.fetchToken();
        //window.location.href = this.api._xeroConnectUrl + token + "&xeroConnectID=" + this.xeroConnectID;
        alert("Error in XERO_TOKEN_EXPIRED ");
      }
      else { 
        // me
        // this.router.navigate(['/docupload']); 
      }
    }
  }

  getXeroVendor() {
    this.loadingMessage = "Getting suppliers...";
    this.spinner.show();
    this.api.get('Xero/GetAllVendor?isRefresh=true', '').subscribe(
      (res: {}) => this.sucessXeroVendor(res),
      error => this.failedXeroVendor(<any>error));
  }

  sucessXeroVendor(resp: any) {
    console.log(resp);
    // //
    this.ss.storeXeroVendors(resp.Data);

    this.loadingMessage = "Redirecting in a second...";

    if (this.returnUrl == 'login') {
      var tempVendors = this.ss.fetchXeroVendors();

      if (tempVendors != null) {

        if (tempVendors.find(xx => xx.XeroAccountID == 0 || xx.XeroAccountID == null) == null) {

          ParameterHashLocationStrategy.signinFlow = null;
          // me
          //this.router.navigate(['/docupload']);
          //  this.router.navigate(['/docpost']);
          this.spinner.hide();
        }
        else {
          this.router.navigate(['/mapaccount']);
        }
      }
      else {
        this.router.navigate(['/mapaccount']);
        this.spinner.hide();
      }
    }


    if (this.returnUrl == 'switchcompany') {
      this.router.navigate(['/switchcompany']);
      this.spinner.hide();
    }

  }

  failedXeroVendor(resp: any) {
    console.log(resp);
    this.spinner.hide();
    // me
    //this.router.navigate(['/docupload']);
  }

}
function newEventEmitter<T>() {
  throw new Error('Function not implemented.');
}

