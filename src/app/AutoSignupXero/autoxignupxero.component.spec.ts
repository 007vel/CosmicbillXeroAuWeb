import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoxignupxeroComponent } from './autoxignupxero.component';


describe('SignupComponent', () => {
  let component: AutoxignupxeroComponent;
  let fixture: ComponentFixture<AutoxignupxeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AutoxignupxeroComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoxignupxeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
