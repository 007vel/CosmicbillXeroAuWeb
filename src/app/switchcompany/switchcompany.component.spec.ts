import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchcompanyComponent } from './switchcompany.component';

describe('SwitchcompanyComponent', () => {
  let component: SwitchcompanyComponent;
  let fixture: ComponentFixture<SwitchcompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchcompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchcompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
