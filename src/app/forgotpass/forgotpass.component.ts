
import { Component, OnInit ,ViewEncapsulation} from '@angular/core';
import { Validators, FormGroup, FormBuilder  } from '@angular/forms';
import { Message } from 'primeng/primeng';

import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';


import { StoreService } from '../store.service';
import { ApiService } from '../api.service';
import './forgotpass.component.css';

@Component({
  selector: 'app-forgotpass',
  templateUrl: './forgotpass.component.html',
  //styleUrls: ['./forgotpass.component.css'],
  providers: [ApiService],
  encapsulation: ViewEncapsulation.None
})
export class ForgotpassComponent implements OnInit {

  public frogotform: FormGroup;
  public  msgs: Message[] = [];
  public responseDB: any;

  constructor(  private fb: FormBuilder,
    private ss: StoreService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public api: ApiService) {
       this.frogotform = this.fb.group({
        UserName: ['', Validators.required]
      }); }

  ngOnInit() {
  }

  onSubmit(value: any) {

console.log(this.frogotform.value)
    this.msgs = [];
    if (this.frogotform.valid) {
        event.preventDefault();
        this.spinner.show();
        this.api.post('Login/ProcessForgotPass',this.frogotform.value).subscribe(
            (res: {}) => this.validateSave(res),
            error => this.validateError(<any>error));
    }
}

validateSave(res: any) {
  this.spinner.hide();
  console.log(res)
  console.log(res.Data.EmailAddress)
  this.ss.storeEmail(res.Data.EmailAddress);
  this.ss.storeUserName(res.Data.UserName);
      this.router.navigate(['/setpass']);
  //else {
    //  this.msgs.push({ severity: 'error', summary: 'Opps..', detail: 'Error found while retrieving your account.' });
  //}
}

validateError(res: any) {
  this.spinner.hide();
  this.msgs.push({ severity: 'error', summary: 'Oops..', detail: 'Could not find account by given User Name.' });
}

}
