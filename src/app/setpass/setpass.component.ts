import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup, FormBuilder  } from '@angular/forms';
import { Message } from 'primeng/primeng';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

import { StoreService } from '../store.service';
import { ApiService } from '../api.service';
import { EncryptingService } from '../encrypting.service';
import './setpass.component.css';

@Component({
  selector: 'app-setpass',
  templateUrl: './setpass.component.html',
  //styleUrls: ['./setpass.component.css'],
  providers: [ApiService,EncryptingService],
  encapsulation: ViewEncapsulation.None
})
export class SetpassComponent implements OnInit {

  public setpasswordform: FormGroup;
  public isactivationcode:boolean;
  public loading: boolean;
  public  msgs: Message[] = [];
  public responseDB:any;
  checked: boolean = false;
  loadingMessage:string;

  constructor(private fb: FormBuilder,
    private ss: StoreService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private encApi: EncryptingService,
    public api: ApiService ) {
      this.setpasswordform = this.fb.group({
        ActivationCode : ['', Validators.nullValidator],
        UserName: ['', Validators.nullValidator],
        Password:  ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        NewPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        EmailAddress:['', Validators.nullValidator]
        },
        // {
        //   validator: RegistrationValidator.validate.bind(this)
        // }
        );
    }

  ngOnInit() {
    this.setpasswordform.value.ActivationCode = '';
    this.isactivationcode = false;

  }

  onSubmit(value: any) {
    this.msgs = [];
    if (this.setpasswordform.valid) {

      if(this.setpasswordform.value.Password != this.setpasswordform.value.NewPassword)
        {
          this.msgs.push({ severity: 'warn', summary: 'Confirm Password', detail: 'Password does not match.' });
          return;
        }

      this.setpasswordform.value.EmailAddress = this.ss.fetchEmail();
      this.setpasswordform.value.UserName = this.ss.fetchUserName();
      this.setpasswordform.value.Password =  this.encApi.encrypt(this.setpasswordform.value.Password);

        event.preventDefault();
        this.loading = true;
        this.spinner.show();
        this.api.postAsEndUser('Login/ActivateAccount',this.setpasswordform.value).subscribe(
            (res: {}) => this.validateSave(res),
            error => this.validateError(<any>error));
    }
}

validateSave(res: any) {
  this.spinner.hide();
  this.loading = false;
if(res.StatusCode == 0){
  this.router.navigate(['/welcome']);
}

}

validateError(res: any) {
  this.loading = false;
  this.spinner.hide();
  this.msgs.push({ severity: 'error', summary: 'Oops..', detail: 'Please enter valid Code.' });
}

  valuechange(value: string){
      if(value != null || value != undefined){
     if(value.length == 6){
     
       
      // this.api.post('Login/ValidateActivationCode',value).subscribe(
      //   (res: {}) => this.validateActivationCode(res),
      //   error => this.validateError(<any>error));
         }
       }
    }

    validateActivationCode(res: any) {
    if(res == 0){
       this.isactivationcode = true;
     }
    }

}
