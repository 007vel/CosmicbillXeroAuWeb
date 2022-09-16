import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocApproveComponent } from './doc-approve.component';

describe('DocApproveComponent', () => {
  let component: DocApproveComponent;
  let fixture: ComponentFixture<DocApproveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocApproveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
