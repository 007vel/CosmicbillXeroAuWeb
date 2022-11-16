export const environment = {
  scope :"openid profile email accounting.transactions accounting.settings offline_access accounting.contacts.read accounting.contacts accounting.settings.read accounting.attachments",
  production: true,

  apiBaseUrl: 'https://cosmicinv.com/xeroapiau/api/',
  apiPreBaseUrl: 'https://cosmicinv.com/xeroapiau/',
  urlPostPDF: 'https://cosmicinv.com/xeroapiau/api/Scan/UploadDocumentXero/',
  xeroConnectUrl: 'https://cosmicinv.com/CoreConnect/ConnectXero?token=',
  stripePaymentUrl: 'https://cosmicinv.com/CorePayment/PayInvoice?token=',
  xerocallbackUrl: "https://cosmicbills.com/xerouiau",
   XeroClientId: "277BDB35BF49482DB8291CFECCC5C241",
   Paymentapp: "https://paymenthub.cosmicbills.com/#/plan",
   PaymentreturnURL: "https://cosmicbills.com/xerouiau/#/myaccount"

};
