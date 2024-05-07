import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenSupervisor } from './orden-Supervisor.component';

describe('OrdenSupervisor', () => {
  let component: OrdenSupervisor;
  let fixture: ComponentFixture<OrdenSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenSupervisor]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdenSupervisor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
