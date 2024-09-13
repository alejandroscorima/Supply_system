import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css'
})
export class VehicleListComponent  implements OnInit {

  showForm: boolean = false; 
  ngOnInit(): void {
    initFlowbite();
  }
  
  toggleForm() {
    this.showForm = !this.showForm;  // Cambia el estado de la variable
  }



}
