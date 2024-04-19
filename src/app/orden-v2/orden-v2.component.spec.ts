import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenV2Component } from './orden-v2.component';

describe('OrdenV2Component', () => {
  let component: OrdenV2Component;
  let fixture: ComponentFixture<OrdenV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenV2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdenV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
