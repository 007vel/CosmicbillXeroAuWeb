import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocPostComponent } from './doc-post.component';

describe('DocPostComponent', () => {
  let component: DocPostComponent;
  let fixture: ComponentFixture<DocPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
