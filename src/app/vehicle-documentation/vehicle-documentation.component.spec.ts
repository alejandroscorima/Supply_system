import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleDocumentationComponent } from './vehicle-documentation.component';

describe('VehicleDocumentationComponent', () => {
  let component: VehicleDocumentationComponent;
  let fixture: ComponentFixture<VehicleDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleDocumentationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VehicleDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
