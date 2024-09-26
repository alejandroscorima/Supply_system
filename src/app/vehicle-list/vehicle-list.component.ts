import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Business } from '../business';
import { Vehicle } from '../vehicle';
import { LogisticaService } from '../logistica.service';
import { Campus } from '../campus';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css'
})
export class VehicleListComponent  implements OnInit {

  showForm: boolean = false; 
  /////NUEVO VEHÍCULO//////
  vehicles: Vehicle[] =[];
  newVehicle: Vehicle = new Vehicle('','','','','','','','',0);
  allBusiness:Business[]=[];
  allcampus:Campus[]=[];

  ///////////////////////
 ///// /Paginator
  displayedVehicles:Vehicle[];
  allvehicles
  itemsPerPage: number =10; // Número de elementos por página
  currentPage: number = 1;
  totalPages: number = 0;
  sortDirection: string = 'asc'; // Dirección de clasificación inicial
  sortKey: string = ''; // Columna de clasificación inicial

//////////////////////

  constructor(
  private logisticaservise:LogisticaService,   private toastr: ToastrService
  ){}
  ngOnInit(): void {
    initFlowbite();
    this.allVehicles();
  
    console.log(this.newVehicle)
    this.logisticaservise.getAllBusiness().subscribe((bus:Business[])=>{
    this.allBusiness = bus;   
      console.log('Datos recibidos:', bus); 
      console.log(this.allBusiness)

    
    });
  
    console.log('Dispositivos obtenidos y procesados:', this.vehicles);
    this.calculateTotalPages(this.vehicles);
    this.updateDisplayedVehicle(this.vehicles);

  }
    

   /////////////////////////PAGINACIón///////////////

  padLeft(value: number, padChar: string, length: number): string {
    return (String(padChar).repeat(length) + String(value)).slice(-length);
  }

  calculateTotalPages(allVehicles: Vehicle[]) {
      this.totalPages = Math.ceil(allVehicles.length / this.itemsPerPage);
  }
    
  updateDisplayedVehicle(allVehicles: Vehicle[]) {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.displayedVehicles = allVehicles.slice(startIndex, endIndex);
      console.log(this.displayedVehicles)
  }

  nextPage(dpP: Vehicle[],allMov: Vehicle[]){
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedVehicle(allMov);
    }
  }

  previousPage(dpP: Vehicle[],allMov: Vehicle[]) {
    if (this.currentPage >1) {
      this.currentPage--;
      this.updateDisplayedVehicle(allMov);
    }
  }
  checkLength(dpP: Vehicle [],allMov: []) {
    console.log(dpP.length);

    if (dpP.length > 0) {
      console.log(this.displayedVehicles);
      const toastrString: string =
        'Mostrando :' +dpP.length.toString() + ' register';
      console.log(toastrString);
      this.toastr.success(toastrString);

      this.calculateTotalPages(allMov);
      this.updateDisplayedVehicle(allMov);
    } else {      
      this.toastr.error('No se encontró el archivo');
    }
  }
  sortTable(column: string,dpP: Vehicle [],allMov: Vehicle []): void {
    if (this.sortKey === column) {
      // Si ya estamos clasificando por esta columna, cambia la dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una nueva columna, establece la columna y la dirección predeterminada
      this.sortKey = column;
      this.sortDirection = 'asc';
    }

    // Lógica de clasificación
    this.vehicles.sort((a, b) => {
      const valueA = a[this.sortKey as keyof typeof a];
      const valueB = b[this.sortKey as keyof typeof b];

      // Convertir a números si es posible

      const numericValueA = parseFloat(String(valueA));
      const numericValueB = parseFloat(String(valueB));

      if (!isNaN(numericValueA) && !isNaN(numericValueB)) {
        // Si ambos valores son números, comparar numéricamente
        return this.sortDirection === 'asc'
          ? numericValueA - numericValueB
          : numericValueB - numericValueA;
      } else {
        // Si al menos uno de los valores no es un número, comparar como cadenas
        return this.sortDirection === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      }
    });

    this.updateDisplayedVehicle(allMov);
  }

  ///////////////////////////////////////////////////
  toggleVehicle() {
    this.showForm = !this.showForm;  // Cambia el estado de la variable
  }
  saveVehicle() {
    console.log('Datos del vehículo:', this.newVehicle);

    this.logisticaservise.postVehicle(this.newVehicle).subscribe(
        (vehicleRes: any) => {
            if (vehicleRes && vehicleRes['resultado'] === true) {
                this.toastr.success('El vehículo fue agregado exitosamente');
                
                // Reinicia el objeto newVehicle después de agregarlo
                this.newVehicle = new Vehicle('', '', '', '', '', '', '', '', 0);
                
                // Actualiza la lista completa de vehículos
                this.allVehicles();
            } else {
                this.toastr.error('Error al agregar el vehículo.');
            }
            console.log('Vehículo creado con éxito:', vehicleRes);
        },
        (error: HttpErrorResponse) => {
            console.error('Error al crear el vehículo:', error);
        }
    );
  }
  
  allVehicles(){
    this.logisticaservise.getAllVehicles().subscribe((allvehicleres:Vehicle[])=>{
      this.displayedVehicles=allvehicleres;
      console.log('Vehículos actualizados:', this.displayedVehicles);
    })
  }
  
  
  
  

}
