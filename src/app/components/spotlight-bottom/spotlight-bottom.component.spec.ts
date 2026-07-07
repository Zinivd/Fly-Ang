import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightBottomComponent } from './spotlight-bottom.component';

describe('SpotlightBottomComponent', () => {
  let component: SpotlightBottomComponent;
  let fixture: ComponentFixture<SpotlightBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotlightBottomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotlightBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
