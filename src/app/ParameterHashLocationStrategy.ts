import { Injectable } from '@angular/core';
import { HashLocationStrategy } from '@angular/common';

@Injectable()
export class ParameterHashLocationStrategy extends HashLocationStrategy {
    public static authCode : string = null;
    public static planId : string = null;
    public static signinFlow : boolean = null;
	prepareExternalUrl(internal: string): string {

		console.log('preparing external url', "1"+window.location.search, "2"+super.prepareExternalUrl(internal)); // log

        var querParams= window.location.search.split('&');
        console.log("querParams first ndex"+(querParams[0])); // log
        if(querParams[0].includes("planid"))
        {
            ParameterHashLocationStrategy.planId =querParams[0].slice(8);
        }else{
            ParameterHashLocationStrategy.authCode =querParams[0].slice(6);
        }

        console.log("after slice:"+ ParameterHashLocationStrategy.authCode); // log
		return ParameterHashLocationStrategy.signinFlow?(window.location.search + super.prepareExternalUrl(internal)):super.prepareExternalUrl(internal);

	}
}