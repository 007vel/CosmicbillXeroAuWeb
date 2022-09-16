import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapAccountComponent } from './map-account.component';

describe('MapAccountComponent', () => {
  let component: MapAccountComponent;
  let fixture: ComponentFixture<MapAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
