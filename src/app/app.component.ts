import { Component, ViewEncapsulation } from '@angular/core';
import './app.component.css';
import { ConfirmationService } from 'primeng/api';
import { ParameterHashLocationStrategy } from './ParameterHashLocationStrategy';
import { StoreService } from './store.service';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ConfirmationService],
})
export class AppComponent {
    public isConnectedToXero: boolean = false;
    connectCompanyMessage: string = "";
    public showDisconnectConfirmation: boolean = false;
    constructor(private ss: StoreService, private router: Router, private api: ApiService, private spinner: NgxSpinnerService) {
        this.GetAccount();
    }

    public ReAuthXeroUI() {
        var username = this.ss.fetchUserName();
        var password = this.ss.fetchPassword();
        this.ss.clearAll();
        this.ss.storeUserName(username as string);
        this.ss.storePassword(password as string);
        ParameterHashLocationStrategy.signinFlow = true;
        this.router.navigate(['/initlogin/'], { queryParams: { IsLoginFlow: true, ReAuthXeroUI: true }, queryParamsHandling: 'merge' });
    }

    GetAccount() {
        console.log('GetAccounts entered');
        this.spinner.show();
        this.api.get('Xero/GetByAccountID', '').subscribe(
            (res: {}) => this.SaveAccount(res),
            error => this.failedGetAccount(<any>error));
    }
    SaveAccount(res: any) {
        this.spinner.hide();
        console.log("res ", JSON.stringify(res));
        if (res.Data != null) {
            if (res.Data.length > 0) {
                this.ss.storeIsAuthorize(res.Data[0].IsAuthrorize);
                this.ss.storeXeroConnectID(res.Data[0].XeroID);
                this.ss.storeCompanyName(res.Data[0].CompanyName);
                this.isConnectedToXero = this.ss.fetchIsAuthorize();
                if (this.showDisconnectConfirmation) {
                    if (!res.Data[0].IsAuthrorize) {
                        alert("You are no longer connected to Xero.");
                    }
                }
            }

            var IsAuthorize = this.ss.fetchIsAuthorize();

            if (!IsAuthorize) {
                this.connectCompanyMessage = "No company is connected, Connect a company";
            } else {
                this.connectCompanyMessage = "";
            }
        }
    }

    failedGetAccount(re: any) {
        console.log(JSON.stringify(re));
    }
}

