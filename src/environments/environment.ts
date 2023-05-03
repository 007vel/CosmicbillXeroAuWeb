// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {

scope :"openid profile email accounting.transactions accounting.settings offline_access accounting.contacts.read accounting.contacts accounting.settings.read accounting.attachments",

  production: false,
   apiBaseUrl: 'http://localhost:61457/api/',
   apiPreBaseUrl: 'http://localhost:61457/',
   urlPostPDF: 'http://localhost:61457/api/Scan/UploadDocumentXero/',
   xeroConnectUrl: 'http://localhost:58224/connectxero?token=',
   stripePaymentUrl: 'http://localhost:44354/PayInvoice?token=',
   xerocallbackUrl: "http://localhost:4200/xerouiau",
   XeroClientId: "277BDB35BF49482DB8291CFECCC5C241",
   Paymentapp: "http://localhost:58216/#/plan",
   PaymentreturnURL: "http://localhost:4200/#/myaccount"


  // production: true,
  // apiBaseUrl: 'https://cosmicinv.com/xeroapiau/api/',
  // apiPreBaseUrl: 'https://cosmicinv.com/xeroapiau/',
  // urlPostPDF: 'https://cosmicinv.com/xeroapiau/api/Scan/UploadDocumentXero/',
  // xeroConnectUrl: 'https://cosmicinv.com/CoreConnect/ConnectXero?token=',
  // stripePaymentUrl: 'https://cosmicinv.com/CorePayment/PayInvoice?token=',
  // xerocallbackUrl: "https://cosmicbills.com/xerouiau",
  // XeroClientId: "277BDB35BF49482DB8291CFECCC5C241",
  // Paymentapp: "https://paymenthub.cosmicbills.com/#/plan",
  //  PaymentreturnURL: "https://cosmicbills.com/xerouiau/#/myaccount"

};
