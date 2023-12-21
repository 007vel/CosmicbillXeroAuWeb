import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  @Output() onClose = new EventEmitter<void>();

  closePopup() {
    this.onClose.emit();
  }
}