import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCompanyDialogComponent } from './select-company-dialog.component';

describe('SelectCompanyDialogComponent', () => {
  let component: SelectCompanyDialogComponent;
  let fixture: ComponentFixture<SelectCompanyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCompanyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCompanyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
