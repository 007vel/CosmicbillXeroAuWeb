
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { environment } from '../environments/environment';

import { Observable } from "rxjs"
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  public apiBaseUrl = environment.apiBaseUrl;
  public apiPreBaseUrl = environment.apiPreBaseUrl;
  public urlPostPDF = environment.urlPostPDF;
  public _xeroConnectUrl = environment.xeroConnectUrl;
  public stripePaymentUrl = environment.stripePaymentUrl;
  public xeroCallbackUrl = environment.xerocallbackUrl;
  public xeroclientId = environment.XeroClientId;
  public xeroScope = environment.scope;
  public Paymentapp = environment.Paymentapp;
  public PaymentappReturnUrl = environment.PaymentreturnURL;
  xeroConnectID: any;
  token: any;

  constructor(public http: HttpClient,
    private storage: StoreService,) {

    this.xeroConnectID = storage.fetchXeroConnectID();
    this.token = storage.fetchToken();
  }

  getHeader(): any {

    this.xeroConnectID = this.storage.fetchXeroConnectID();
    this.token = this.storage.fetchToken();
    return new HttpHeaders(
      
      {
        
        'Content-Type': 'application/json',
        'CosmicBill-UserToken': (this.token != null ? this.token.toString() : ""),
        'CosmicBill-XeroConnectID': (this.xeroConnectID != null ? this.xeroConnectID.toString() : 0),
        'CosmicBill-PlatformID': '3',
        'Cache-Control': 'no-cache'
      }
    );
  }


  getPlainHeader(): any {

    return new HttpHeaders(
      {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'CosmicBill-PlatformID': '3',
        'Cache-Control': 'no-cache'
      }
    );
  }


  get1(endUrl: string, request: any): Response | any {
    return this.http.get(this.apiBaseUrl + endUrl + request, { headers: this.getHeader() })
      .pipe(map(this.extractData));

  }

  post(endUrl: string, request: any): Response | any {
    return this.http.post(this.apiBaseUrl + endUrl, request, { headers: this.getHeader() })
      .pipe(map(this.extractData));
  }

  postAsEndUser(endUrl: string, request: any): Response | any {
    return this.http.post(this.apiBaseUrl + endUrl, request, { headers: this.getPlainHeader() })
      .pipe(map(this.extractData));
  };



  get(endUrl: string, request: any): Response | any {
    return this.http.get(this.apiBaseUrl + endUrl + request, { headers: this.getHeader() })
      .pipe(map(this.extractData));
    //.subscribe(this.handleError);  
    // .map(this.extractData)
    // .catch(this.handleError);
  }

  getwithoutreq(endUrl: string): Response | any {
    return this.http.get(this.apiBaseUrl + endUrl, { headers: this.getHeader() })
      .pipe(map(this.extractData));

  }

  private extractData(res: Response) {
    return res || {};
  }

  private handleError(resError: Response | any): any {
    // In a real world app, we might use a remote logging infrastructure
    //console.log('error' + error.status);
    // if(error.status === 401)
    // {
    //   // let alert = this.alertService.createAlert('Your session is expired!', 'Please relogin');
    //   // alert.present();
    //   this.sessionSer.clearAll();
    // }
    /*
     let errMsg: string;
     if (resError instanceof Response) {
       const body = resError.json() || '';
       //const err = body.error || JSON.stringify(body);
       const err = JSON.stringify(body);
       errMsg = `${resError.status} - ${resError.statusText || ''} ${err}`;
     } else {
       errMsg = resError.message ? resError.message : resError.toString();
     }
     console.error(errMsg);
     */
    //return Observable.throw(errMsg);
    console.error(resError);
    //throw new Error(resError.error.MsgForUser);
    //throw new Error('No Error');

  }
}
