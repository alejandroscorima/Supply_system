import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { AnalyticsService } from 'src/app/analytics.service';
import { LogisticaService } from 'src/app/logistica.service';
import { Mobility } from 'src/app/mobility';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-analytic-mobility',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './analytic-mobility.component.html',
  styleUrl: './analytic-mobility.component.css'
})
export class AnalyticMobilityComponent {
  mobilityData: Mobility[] = [];
  page: number = 1;
  totalPages: number = 0;
  pageSize: number = 5;
  totalItems: number = 0;

  // Filtros
  campusFilter: string = 'TODOS';
  stateFilter: string = 'TODOS';

  startDate: string = '';
  endDate: string = '';


  stDate: Date = new Date();  // Changed to English
  edDate: Date = new Date();  // Changed to English

  // Datos para filtros
  allCampus: any[] = [];
  allStates: any[] = ['REGISTRADO','ANULADO'  ];

  paginatedMobility: Mobility[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private logisticaService:LogisticaService
  ) {}

  ngOnInit() {
    this.startDate=this.getCurrentDate();
    this.endDate=this.getCurrentDate();
    //this.getMobility();
    this.getCampus();
  }

  getMobility() {
    //this.startDate = this.formatDate(this.stDate);  // Updated startDateFilter
    //this.endDate = this.formatDate(this.edDate);  // Updated endDateFilter


    this.analyticsService.getnalyticsMobility(this.campusFilter,this.stateFilter,this.startDate,this.endDate).subscribe((data: Mobility[]) => {
      this.mobilityData = data
      console.log(data)
      this.totalItems = this.mobilityData.length;
      this.totalPages = Math.ceil(this.totalItems/this.pageSize);
      this.paginatedMobility = this.paginateMobility();
    });
  }
/* 
  filterMobility(mobility: Mobility): boolean {
    const campusMatch = this.campusFilter === 'ALL' || mobility.campus === this.campusFilter;
    const dateMatch = this.stDate === '' || this.edDate === '' || 
                      (new Date(mobility.fecha) >= new Date(this.stDate) && new Date(mobility.fecha) <= new Date(this.edDate));
    return campusMatch && dateMatch;
  }
 */
  paginateMobility(): Mobility[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.mobilityData.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    this.page = page;
    this.paginatedMobility = this.paginateMobility();
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.mobilityData);
    const workbook = { Sheets: { 'Mobility': worksheet }, SheetNames: ['Mobility'] };
    XLSX.writeFile(workbook, 'mobility.xlsx');
  }

  exportToPDF() {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['ID', 'Fecha', 'Campus', 'Monto', 'Estado', 'Usuario', 'Hora Gen', 'Fecha Gen', 'Número']],
      body: this.mobilityData.map(mobility => [mobility.id, mobility.fecha, mobility.campus, mobility.monto, mobility.estado, mobility.first_name+' '+mobility.paternal_surname+' ',mobility.hora_gen, mobility.fecha_gen, mobility.numero])
    });
    doc.save('mobility.pdf');
  }

  oldFormatDate(date: any): string {
    const validDate = new Date(date);

    if (isNaN(validDate.getTime())) {
      return ''; 
    }

    const year = validDate.getFullYear();
    const month = ('0' + (validDate.getMonth() + 1)).slice(-2);
    const day = ('0' + validDate.getDate()).slice(-2);

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

  getCampus() {
    this.logisticaService.getAllCampus().subscribe((data:any) => {
      this.allCampus = data;
    });
  }
}