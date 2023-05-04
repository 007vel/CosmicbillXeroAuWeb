
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Message, SelectItem } from 'primeng/primeng';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { StoreService } from '../store.service';
import { ApiService } from '../api.service';
import './signup.component.css';
import { EncryptingService } from '../encrypting.service';
import { ParameterHashLocationStrategy } from '../ParameterHashLocationStrategy';



@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  //styleUrls: ['./signup.component.css'],
  providers: [ApiService, EncryptingService],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {

  public signupform: FormGroup;
  public loading: boolean;
  public msgs: Message[] = [];
  public responseDB: any;
  public countries: any = [];
  loadingMessage: string = "Please wait...";
  public termAndCondsion: boolean;

  public Recaptcha: boolean;

  constructor(private fb: FormBuilder,
    private ss: StoreService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public api: ApiService,

    private encApi: EncryptingService
  ) {

    this.signupform = this.fb.group({
      UserName: ['', Validators.required],
      Password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      NewPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      Email: ['', Validators.required],
      Phone: ['', Validators.nullValidator],
      CountryOfOrigin: ['', Validators.required]
    });

  }

  ngOnInit() {
    this.termAndCondsion = false;
    this.bindCountries();
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
    this.Recaptcha = true;

}

  onSubmit(value: any) {
    this.msgs = [];

    console.log('termAndCondision')
    console.log(this.termAndCondsion)
    if (this.termAndCondsion == false) {
      this.msgs.push({ severity: 'warn', summary: 'Please Select Terms of Use and Privacy Policy', detail: '' });
      return;
    }

    if (this.signupform.valid) {

      this.ss.storeEmail(this.signupform.value.Email);
      this.ss.storeUserName(this.signupform.value.UserName);
      var encryptPassword =  this.encApi.encrypt(this.signupform.value.Password);
      this.ss.storePassword(encryptPassword );
      if (this.signupform.value.Password != this.signupform.value.NewPassword) {
        this.msgs.push({ severity: 'warn', summary: 'Confirm Password', detail: 'Password does not match.' });
        return;
      }

      this.signupform.value.Password =encryptPassword;

      event.preventDefault();
      this.loading = true;
      this.spinner.show();

      console.log(this.signupform.value);
      ParameterHashLocationStrategy.signinFlow = true;
      this.api.postAsEndUser('Account/Save', this.signupform.value).subscribe(
        (res: {}) => this.validateSave(res, this.signupform.value),
        error => this.validateError(<any>error));
    }
  }

  bindCountries() {
    this.countries.push({ label: '', value: '' });
    this.countries.push({ label: 'Australia', value: 'AU' });
    //this.countries.push({ label: 'United Kingdom', value: 'UK' });
    this.countries.push({ label: 'NewZealand', value: 'NZ' });

  }

  validateSave(res: any, login: any) {
    this.spinner.hide();
    this.loading = false;
    console.log(res);

    console.log(login);

    console.log('login');

    if (res.StatusCode == 0) {

      console.log('>>>>>>>>>>signup-login');
      this.api.postAsEndUser('login/DoLogin', login).subscribe(
        (res: {}) => this.validateLoginSave(res),
        error => this.validateError(<any>error));

    } else {
      this.msgs.push({ severity: 'error', summary: 'Oops..', detail: 'Error found while creating account.' });
    }
  }

  validateError(res: any) {
    this.loading = false;
    this.spinner.hide();
    this.msgs.push({ severity: 'error', summary: 'Oops..', detail: 'Invalid sign up' });
  }

  validateLoginSave(res: any) {
    this.spinner.hide();

    console.log(res);
    this.loading = false;
    if (res.StatusCode == 0) {

      this.ss.storeEmail(res.Data.EmailAddress.toString());
     // this.router.navigate(['/initlogin/' + res.Data.Token.toString() + '/0/login']);
      this.router.navigate(['/initlogin/'], { queryParams: { IsLoginFlow: true }, queryParamsHandling: 'merge' });

    } else {
      this.msgs.push({ severity: 'error', summary: 'Oops..', detail: 'Incorrect credentials' });
    }
  }

  handleData(event: any) {

    this.termAndCondsion = event;
    console.log(event)
    console.log(this.termAndCondsion)
  }


}
