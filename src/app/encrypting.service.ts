import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptingService {

    private key: string = CryptoJS.enc.Utf8.parse('AMINHAKEYTEM32NYTES1234567891234');
    private iv: string = CryptoJS.enc.Utf8.parse('7061737323313233');

    constructor() {
    }

    encrypt(dataToEncrypt: any):  string  {
        const encrypted  = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(dataToEncrypt), this.key,
        {
            keySize: 128 / 8,
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return  encrypted.toString();
    }

    decrypt(dataToDecrypt: any):  string  {
        const decrypted = CryptoJS.AES.decrypt(dataToDecrypt, this.key, {
            keySize: 128 / 8,
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString();
    }

    randomNumber(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }
}
