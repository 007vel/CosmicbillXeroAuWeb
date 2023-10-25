import { Component } from '@angular/core';
import { Message } from 'primeng/primeng';

@Component({
    templateUrl: './filedemo.component.html'
})
export class FileDemoComponent {

    msgs: Message[];
    acceptedFiles: string = ".pdf, .jpg, .png, .doc, .docx, .xls, .xlsx, .csv";
    uploadedFiles: any[] = [];

    onUpload(event) {
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }

        this.msgs = [];
        this.msgs.push({ severity: 'info', summary: 'File Uploaded', detail: '' });
    }
}
