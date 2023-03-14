import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, LOCAL_STORAGE, StorageService } from 'angular-webstorage-service';


// key that is used to access the data in local storage
const STORAGE_KEY = 'local_todolist';
const TOKEN_KEY = 'local_token';
const COSMIC_ACCOUNT_ID = 'cosmic_account_id';
const USER_KEY = 'local_user';
const PASSWORD = 'password';

const EMAIL_KEY = 'local_email';
const KEY_COMPANYID = 'local_companyId';
const KEY_COMPANY_NAME = 'local_companyName';

const XERO_VENDOR_KEY = 'local_XeroVendor';
const XERO_ACCOUNT_KEY = 'local_XeroAccount';

const PAID_PDF_COUNT = 'paid_pdf_count';
const TRIAL_PDF_COUNT = 'trial_pdf_count';

const TOTAL_ALLOCATED_PDF_KEY = 'total_allocated_pdf';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class StoreService {
  anotherTodolist = [];

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) { }

  public storeOnLocalStorage(taskTitle: string): void {

    //get array of tasks from local storage
    const currentTodoList = this.storage.get(STORAGE_KEY) || [];

    // push new task to array
    currentTodoList.push({
      title: taskTitle,
      isChecked: false
    });

    // insert updated array to local storage
    this.storage.set(STORAGE_KEY, currentTodoList);

    console.log(this.storage.get(STORAGE_KEY) || 'LocaL storage is empty');
  }

  public storeToken(token: string): void {
    this.storage.set(TOKEN_KEY, token);
    console.log(this.storage.get(TOKEN_KEY) || 'LocaL storage is empty');
  }
  public storeCsomicAccountID(token: string): void {
    this.storage.set(COSMIC_ACCOUNT_ID, token);
    console.log(this.storage.get(COSMIC_ACCOUNT_ID) || 'LocaL storage is empty');
  }

  public storePassword(password: string): void {
    this.storage.set(PASSWORD, password);
    console.log(this.storage.get(PASSWORD) || 'LocaL storage is empty');
  }

  public storeUserName(userName: string): void {
    this.storage.set(USER_KEY, userName);

  }



  public fetchToken(): String {
    return this.storage.get(TOKEN_KEY)
  }


  public fetchUserName(): String {
    return this.storage.get(USER_KEY)
  }

  public storeEmail(email: string): void {
    this.storage.set(EMAIL_KEY, email);
    console.log(this.storage.get(EMAIL_KEY) || 'LocaL storage is empty');
  }

  public fetchEmail(): String {
    return this.storage.get(EMAIL_KEY)
  }

  public fetchPassword(): String {
    return this.storage.get(PASSWORD)
  }

  public storeXeroConnectID(value: string): void {
    this.storage.set(KEY_COMPANYID, value);
    console.log(this.storage.get(KEY_COMPANYID) || 'LocaL storage is empty');
  }

  public fetchXeroConnectID(): String {
    return this.storage.get(KEY_COMPANYID)
  }
  public fetchCosmicAccountID(): String {
    return this.storage.get(COSMIC_ACCOUNT_ID)
  //return "5292";
  }

  public storeCompanyName(value: string): void {
    this.storage.set(KEY_COMPANY_NAME, value);
    console.log(this.storage.get(KEY_COMPANY_NAME) || 'LocaL storage is empty');
  }

  public fetchCompanyName(): String {
// return "jhvhjv"
       return this.storage.get(KEY_COMPANY_NAME)
  }

  public storeXeroVendors(data: any): void {
    this.storage.set(XERO_VENDOR_KEY, data);
    console.log(this.storage.get(XERO_VENDOR_KEY) || 'LocaL storage is empty');
  }

  public fetchXeroVendors(): any {
    return this.storage.get(XERO_VENDOR_KEY)
  }

  public storeXeroAccounts(data: any): void {
    this.storage.set(XERO_ACCOUNT_KEY, data);
    console.log(this.storage.get(XERO_ACCOUNT_KEY) || 'LocaL storage is empty');
  }
  public storeTotalAllocatedPDF(data: any): void {
    this.storage.set(TOTAL_ALLOCATED_PDF_KEY, data);
    console.log(this.storage.get(TOTAL_ALLOCATED_PDF_KEY) || 'LocaL storage is empty');
  }

  public fetchTotalAllocatedPDF(): any {
    return this.storage.get(TOTAL_ALLOCATED_PDF_KEY)
  }

  public fetchXeroAccounts(): any {
    return this.storage.get(XERO_ACCOUNT_KEY)
  }

  public fetchTrialPdfCount(): any {
    return this.storage.get(TRIAL_PDF_COUNT)
  }
  public fetchPaidPdfCount(): any {
    return this.storage.get(PAID_PDF_COUNT)
  }
  public storePaidPdfCount(value: any, invalidateTrialCount: boolean): void {
    this.storage.set(PAID_PDF_COUNT, value);
    if(invalidateTrialCount === true)
    {
      this.storeTrialPdfCount(0, false);
    }

  }
  public storeTrialPdfCount(value: any,  invalidatePaidCount: boolean): void {
    this.storage.set(TRIAL_PDF_COUNT, value);

    if(invalidatePaidCount === true)
    {
      this.storePaidPdfCount(0, false);
    }

  }

  public clearAll(): any {
    console.log("ClearAll preference");
    this.storage.set(XERO_ACCOUNT_KEY, null);
    this.storage.set(XERO_VENDOR_KEY, null);
    this.storage.set(KEY_COMPANYID, null);
    this.storage.set(EMAIL_KEY, null);
    this.storage.set(TOKEN_KEY, null);
    this.storage.set(KEY_COMPANY_NAME, null);
    this.storage.set(USER_KEY, null);
    this.storage.set(PASSWORD, null);
    this.storage.set(COSMIC_ACCOUNT_ID, null);
    this.storage.set(PAID_PDF_COUNT, null);
    this.storage.set(TRIAL_PDF_COUNT, null);
  }

}
