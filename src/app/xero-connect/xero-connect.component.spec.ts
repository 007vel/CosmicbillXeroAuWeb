import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XeroConnectComponent } from './xero-connect.component';

describe('XeroConnectComponent', () => {
  let component: XeroConnectComponent;
  let fixture: ComponentFixture<XeroConnectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XeroConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XeroConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
