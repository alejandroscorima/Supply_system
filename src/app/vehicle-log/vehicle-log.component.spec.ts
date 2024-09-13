import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleLogComponent } from './vehicle-log.component';

describe('VehicleLogComponent', () => {
  let component: VehicleLogComponent;
  let fixture: ComponentFixture<VehicleLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleLogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VehicleLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
