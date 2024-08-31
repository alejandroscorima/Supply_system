import { Component } from '@angular/core';
import { Requerimiento } from 'src/app/requerimiento';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { AnalyticsService } from 'src/app/analytics.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Campus } from 'src/app/campus';
import { Area } from 'src/app/area';
import { LogisticaService } from 'src/app/logistica.service';
@Component({
  selector: 'app-requirements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './requirements.component.html',
  styleUrl: './requirements.component.css'
})
export class RequirementsComponent {

  requerimientos: Requerimiento[] = []; // Datos de ejemplo o reales
  page: number = 1;
  totalPages: number = 0;
  pageSize: number = 5;
  totalItems: number = 0;

  //FILTERS
  statusFilter:string ='TODOS';
  sedeFilter: string ='TODOS';

  areaFilter ='TODOS';
  startDate:string ='';
  endDate:string ='';

  stDate:Date = new Date();
  edDate:Date = new Date();

  allStatus =[
    'PENDIENTE',
    'PROCESO',
    'FINALIZADO',
    'NO DEFINIDO'
  ]
  allCampus: Campus[]|any=[];
  allAreas: Area[]|any=[];


  constructor(
    private analyticsService: AnalyticsService,
    private logisticaService: LogisticaService,
  ) {}

  async ngOnInit() {
    //this.requerimientos = this.getRequerimientos(); // Simula una carga de datos

    this.startDate=this.getCurrentDate();
    this.endDate=this.getCurrentDate();
  
    this.allCampus = await this.logisticaService.getAllCampus().toPromise();
    this.allAreas = await this.logisticaService.getAllAreas().toPromise();
  }
  //fechas
  oldFormatDate(date: any): string {
    // Verificar si es un valor válido y convertir a Date si es necesario
    const validDate = new Date(date);
  
    // Asegurarse de que sea una fecha válida
    if (isNaN(validDate.getTime())) {
      return '';  // Si no es una fecha válida, devolver cadena vacía o manejar el error
    }
  
    const year = validDate.getFullYear();
    const month = ('0' + (validDate.getMonth() + 1)).slice(-2);  // Mes correcto
    const day = ('0' + validDate.getDate()).slice(-2);  // Día con dos dígitos
  
    return `${year}-${month}-${day}`;
  }

  //Obtener la fecha actual
  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = now.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  //Obtener la hora actual
  getCurrentHour() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  }
  

  // Simulando datos de requerimientos
  getRequirements(){
    //this.startDate=this.formatDate(this.stDate);
    //this.endDate=this.formatDate(this.edDate);
    // Loguear las variables al inicio del componente
    console.log('statusFilter:', this.statusFilter);
    console.log('sedeFilter:', this.sedeFilter);
    console.log('areaFilter:', this.areaFilter);
    console.log('startDate:', this.startDate);
    console.log('endDate:', this.endDate);
    console.log('stDate:', this.stDate);
    console.log('edDate:', this.edDate);

    console.log
    this.analyticsService.getRequirements(this.statusFilter,this.sedeFilter,this.startDate,this.endDate,this.areaFilter).subscribe((reqs:Requerimiento[])=>{
      this.requerimientos= reqs;
      console.log(reqs)
      this.totalItems = this.requerimientos.length;
      this.totalPages = Math.ceil(this.totalItems/this.pageSize);
    })
    //this.paginatedRequerimientos
  }

  get paginatedRequirements(): Requerimiento[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.requerimientos.slice(start, end);
  }

  // Exportar a Excel
  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.requerimientos);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'requerimientos.xlsx');
  }

  // Exportar a PDF
  exportToPDF(): void {
    const doc = new jsPDF('p', 'pt', 'a4');
    const columns = ["Código", "Fecha", "Área", "Encargado", "Sala", "Prioridad", "Estado"];
    const rows = this.requerimientos.map(r => [
      r.codigo, 
      r.fecha, 
      r.area, 
      r.encargado, 
      r.sala, 
      r.prioridad, 
      r.estado
    ]);
  
    // Estilo del título
    doc.setFontSize(18);
    doc.text('Requerimientos', 40, 40);
  
    // Estilo de la tabla
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 60, // posición de inicio de la tabla
      styles: {
        fontSize: 10, // Tamaño de la fuente
        halign: 'center', // Alineación horizontal
        valign: 'middle', // Alineación vertical
      },
      headStyles: {
        fillColor: [22, 160, 133], // Color del encabezado
      },
      theme: 'striped', // Tema de la tabla
    });
  
    // Guarda el PDF con un nombre específico
    doc.save('requerimientos.pdf');
  }
  

  // Cambiar página
  changePage(page: number): void {
    this.page = page;
  }

  


}
