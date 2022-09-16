import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocEditComponent } from './doc-edit.component';

describe('DocEditComponent', () => {
  let component: DocEditComponent;
  let fixture: ComponentFixture<DocEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
