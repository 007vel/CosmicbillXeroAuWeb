import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '../store.service';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Message, SelectItem, ConfirmationService } from 'primeng/primeng';
import { CosmicNotifyService } from '../CosmicNotifyService';

@Component({
	selector: 'app-my-profile',
	templateUrl: './my-profile.component.html',
	providers: [ApiService, ConfirmationService],
	encapsulation: ViewEncapsulation.None
})

export class MyProfileComponent implements OnInit {
	loadingMessage: string = "loading...";
	userform: FormGroup;
	msgs: any;
	xeromaster: any;
	AsyncBackEndScanning: boolean = false;
	DirectPostfromEmail: boolean = false;
	docPostAsList: SelectItem[] = [];
	docPostAs: any;

	constructor(private router: Router, private api: ApiService,
		private spinner: NgxSpinnerService, private ss: StoreService,
		private fb: FormBuilder, private confirmationService: ConfirmationService,private cosmicNotifyService: CosmicNotifyService) { }

	ngOnInit() {
		this.docPostAs = "";
		this.docPostAsList.push({ label: 'Draft', value: 'DR' });
		this.docPostAsList.push({ label: 'Waiting Approval', value: 'AP' });
		this.docPostAsList.push({ label: 'Approved', value: 'WAP' });
		this.userform = this.fb.group({
			'UserName': new FormControl(''),
			'Email': new FormControl(''),
			'Phone': new FormControl(''),

			// 'password': new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),

		});
		this.getMyAccount();
		//this.cosmicNotifyService.myEventEmiter.emit();
	}

	getMyAccount() {

		this.spinner.show();
		this.loadingMessage = "Please wait..."

		this.api.get('Account/Get', '').subscribe(
			(res: {}) => this.sucessGetMyAccount(res),
			error => this.failedGetMyAccount(<any>error));
	}

	sucessGetMyAccount(res: any) {
		//this.myAccountDetail = res.Data;
		this.userform = this.fb.group({
			UserName: [res.Data.UserName],
			Email: [res.Data.Email],
			Phone: [res.Data.Phone]
		});
		this.getXeroDetail();
		this.spinner.hide();


	}

	failedGetMyAccount(res: any) {
		this.spinner.hide();
	}

	onSubmit(value: string) {
		if (this.userform.valid) {
			console.log('this.userform.value')
			console.log(this.userform.value)
			this.spinner.show();


			this.api.post('Account/UpdatePhoneByAccountID?phone=' + this.userform.value.Phone+'&Email='+this.userform.value.Email, "").subscribe(
				(res: {}) => this.sucess(res),
				error => this.faild(<any>error));

		}
	}
	saveChecked() {
	//	//debugger;
		this.xeromaster.AsyncBackEndScanning = this.AsyncBackEndScanning;
		this.xeromaster.DirectPostfromEmail = this.DirectPostfromEmail;
		this.xeromaster.XeroDocPostAs = this.docPostAs;
		console.log(this.xeromaster);
		this.api.post('Account/UpdateXeroMaster', this.xeromaster).subscribe(
			(res: {}) => this.sucessUpdateXeroMaster(res),
			error => this.failedUpdateXeroMaster(<any>error));
	}

	sucessUpdateXeroMaster(res: any) {
		this.msgs = [];
		this.msgs.push({ severity: 'Info', summary: 'Updated Successfully.', detail: 'Success.' });

	}

	failedUpdateXeroMaster(failed: any) {

	}
	getXeroDetail() {
		this.spinner.show();
		this.loadingMessage = "Please wait..."
		this.api.get('Xero/GetByAccountID', '').subscribe(
			(res: {}) => this.sucessXeroMaster(res),
			error => this.failedXeroMaster(<any>error));
	}

	failedXeroMaster(res: any) {
		this.spinner.hide();
	}

	sucessXeroMaster(res: any) {
		this.spinner.hide();
		this.xeromaster = res.Data[0];

		if (res.StatusCode == 0) {
			this.AsyncBackEndScanning = res.Data[0].AsyncBackEndScanning;
			this.DirectPostfromEmail = res.Data[0].DirectPostfromEmail;
			this.docPostAs = res.Data[0].XeroDocPostAs;
		}
	}
	onChangeItem(event: any) {
		this.docPostAs = event.value;
	}
	directPostMailChange(event: any) {
		this.directPostChange(event,2);
	}

	directPostChange(event: any, selected: number) {
		console.log("change");
		if (event.target.checked == true) {
			if (selected == 1) {
				this.AsyncBackEndScanning = true;
				this.DirectPostfromEmail = false;
			} else if (selected == 2) {
				this.DirectPostfromEmail = true;
				this.AsyncBackEndScanning = false;
			}
		}
		if (event.target.checked == true && selected == 2) {

			if (this.docPostAs == null) {
				this.msgs = [];

				this.msgs.push({ severity: 'Error', summary: 'Please select Approve Doc As if you want to direct post to Accounting System.', detail: 'Failed.' });
				this.DirectPostfromEmail = false;
				event.target.checked = false;

			} else {
				if (this.docPostAs.length == 0) {
					this.msgs = [];
					this.msgs.push({ severity: 'Error', summary: 'Please select Approve Doc As if you wnt to direct post to Accounting System.', detail: 'Failed.' });
					this.DirectPostfromEmail = false;
					event.target.checked = false;

				} else {

					console.log("change");
					var message = 'Are you sure you want to direct post your document to Accounting System?';
					this.confirmationService.confirm({
						message: message,
						accept: () => {
							this.DirectPostfromEmail = true;
							//this.spinner.show();
							//this.loadingMessage = "Please wait..";

						},
						reject: () => {
							this.DirectPostfromEmail = false;
							this.docPostAs = "";
							//this.qboAccountIDSelected = 0;
						}
					});
				}
			}
		}
	}
	sucess(resp: any) {
		console.log(resp);

		this.spinner.hide();

	}

	faild(resp: any) {
		console.log(resp);
		this.spinner.hide();
	}
}