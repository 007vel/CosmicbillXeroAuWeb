import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetpassComponent } from './setpass.component';

describe('SetpassComponent', () => {
  let component: SetpassComponent;
  let fixture: ComponentFixture<SetpassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetpassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetpassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
