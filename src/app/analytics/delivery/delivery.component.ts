import { Component, OnInit } from '@angular/core';
import { EntregaItem } from 'src/app/entrega_item';
import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { AnalyticsService } from 'src/app/analytics.service';
import { LogisticaService } from 'src/app/logistica.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnInit {
  entregaItems: EntregaItem[] = [];
  totalItems: number = 0;
  pageSize: number = 10;
  page: number = 1;
  totalPages: number = 0;

  campusFilter: string = 'TODOS';
  categoryFilter: string = 'TODOS';
  stateFilter: string = 'TODOS';

  startDate: string = '';
  endDate: string = '';


  stDate: Date = new Date();  // Changed to English
  edDate: Date = new Date();  // Changed to English



  allCampus: any[] = [];
  allCategories: any[] = [
    'OTROS','FERRETERIA','MENAJE','DISFRACES','TORTAS','UTILES DE OFICINA','DECORACION','SHOW MUSICAL',
  ];
  allStates: any[] = ['REGISTRADO','ANULADO'  ];

  paginatedFondoItems: EntregaItem[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private logisticaService: LogisticaService
  ) {}

  ngOnInit() {
    this.startDate=this.getCurrentDate();
    this.endDate=this.getCurrentDate();
    //this.getFondoItems();
    this.getCampuses();
  

  }

  getFondoItems() {
    //this.startDate = this.formatDate(this.stDate);  // Updated startDateFilter
    //this.endDate = this.formatDate(this.edDate);  // Updated endDateFilter


    this.analyticsService.getAnalyticsEntregaItems(this.campusFilter,this.categoryFilter,this.stateFilter,this.startDate,this.endDate).subscribe((data: EntregaItem[]) => {
      this.entregaItems = data
      console.log(data)
      this.totalItems = this.entregaItems.length;
      this.totalPages = Math.ceil(this.totalItems/this.pageSize);
      this.paginatedFondoItems = this.paginateEntregaItems();
    });
  }

  

  paginateEntregaItems(): EntregaItem[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.entregaItems.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    this.page = page;
    this.paginatedFondoItems = this.paginateEntregaItems();
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.entregaItems);
    const workbook = { Sheets: { 'FondoItems': worksheet }, SheetNames: ['FondoItems'] };
    XLSX.writeFile(workbook, 'fondoitems.xlsx');
  }

  exportToPDF() {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['ID', 'Campus', 'Fecha', 'Tipo Doc', 'Serie', 'Número', 'RUC', 'Razón Social', 'Monto', 'Estado']],
      body: this.entregaItems.map(item => [item.id, item.campus, item.fecha, item.tipo_doc, item.serie, item.numero, item.ruc, item.raz_social, item.monto, item.estado])
    });
    doc.save('fondoitems.pdf');
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

  getCampuses() {
    this.logisticaService.getAllCampus().subscribe((data: any) => {
      this.allCampus = data;
    });
  }

  
}