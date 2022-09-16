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
   stripePaymentUrl: 'http://localhost:51152/PayInvoice?token=',
   xerocallbackUrl: "http://localhost:4200/xero",
   XeroClientId: "277BDB35BF49482DB8291CFECCC5C241"
  

  // production:true,
  // apiBaseUrl: 'https://cosmicinv.com/xerocoreapi/api/',
  // apiPreBaseUrl: 'https://cosmicinv.com/xerocoreapi/',
  // urlPostPDF: 'https://cosmicinv.com/xerocoreapi/api/Scan/UploadDocumentXero/',
  // xeroConnectUrl: 'https://cosmicinv.com/CoreConnect/ConnectXero?token=',
  // stripePaymentUrl: 'https://cosmicinv.com/CorePayment/PayInvoice?token=',
  // xerocallbackUrl: "https://cosmicbills.com/xero/",
  // XeroClientId: "277BDB35BF49482DB8291CFECCC5C241"

};
