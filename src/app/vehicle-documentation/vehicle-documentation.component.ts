import { Component } from '@angular/core';

@Component({
  selector: 'app-vehicle-documentation',
  templateUrl: './vehicle-documentation.component.html',
  styleUrl: './vehicle-documentation.component.css'
})
export class VehicleDocumentationComponent {


    
  showDocument: boolean = false; 
  toggleDocument() {
    this.showDocument = !this.showDocument;  // Cambia el estado de la variable
  }
}
