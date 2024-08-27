import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticMobilityComponent } from './analytic-mobility.component';

describe('AnalyticMobilityComponent', () => {
  let component: AnalyticMobilityComponent;
  let fixture: ComponentFixture<AnalyticMobilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticMobilityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnalyticMobilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
