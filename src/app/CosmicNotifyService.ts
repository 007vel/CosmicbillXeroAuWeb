import { EventEmitter, Injectable } from "@angular/core";

@Injectable()
export class CosmicNotifyService
{
    emit() {
      throw new Error('Method not implemented.');
    }
    subscribe(arg0: () => void) {
      throw new Error('Method not implemented.');
    }
    myEventEmiter:EventEmitter<void> = new EventEmitter<void>();
}