import { Injectable } from '@angular/core';
import { HashLocationStrategy } from '@angular/common';

@Injectable()
export class ParameterHashLocationStrategy extends HashLocationStrategy {
    public static authCode: string = null;
    public static planId: string = null;
    public static signinFlow: boolean = null;
    prepareExternalUrl(internal: string): string {
        //debugger;
        console.log('preparing external url', "1>>>> " + window.location.search, "2>>>> " + super.prepareExternalUrl(internal)); // log

        var querParams = window.location.search.split('&');
        if (window.location.search != null && window.location.search != '') {
            querParams = window.location.search.split('&');
        } else if (super.prepareExternalUrl(internal) != null && super.prepareExternalUrl(internal) != '') {
            var internalurl = super.prepareExternalUrl(internal).split('?');

            console.log("after internal  split>>>> " + internalurl[1]);
            if (internalurl !== null && internalurl !== undefined && internalurl.length > 1) {
                querParams = internalurl[1].split('&');
            }

        }

        if (querParams !== null && querParams !== undefined) {
            console.log("querParams first index " + (querParams[0])); // log
            if (querParams[0].includes("planid")) {
                ParameterHashLocationStrategy.planId = querParams[0].slice(7);
                console.log("ParameterHashLocationStrategy.planId " + ParameterHashLocationStrategy.planId); // log
            } else {
                ParameterHashLocationStrategy.authCode = querParams[0].slice(6);
                console.log("ParameterHashLocationStrategy.authCode " + ParameterHashLocationStrategy.authCode); // log
            }
        }


        console.log("after slice:" + ParameterHashLocationStrategy.authCode); // log
        return ParameterHashLocationStrategy.signinFlow ? (window.location.search + super.prepareExternalUrl(internal)) : super.prepareExternalUrl(internal);

    }
}