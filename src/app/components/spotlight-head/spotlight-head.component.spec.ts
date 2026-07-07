import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightHeadComponent } from './spotlight-head.component';

describe('SpotlightHeadComponent', () => {
  let component: SpotlightHeadComponent;
  let fixture: ComponentFixture<SpotlightHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotlightHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotlightHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
