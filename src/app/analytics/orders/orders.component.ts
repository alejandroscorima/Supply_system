import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { AnalyticsService } from 'src/app/analytics.service';
import { Area } from 'src/app/area';
import { Campus } from 'src/app/campus';
import { LogisticaService } from 'src/app/logistica.service';
import { Orden } from 'src/app/orden';
import { Requerimiento } from 'src/app/requerimiento';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {

  orders: Orden[] = []; // Changed requerimientos to orders
  page: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;

  // Filters
  sedeFilter: string = 'TODOS';  // Changed to English
  areaFilter: string = 'TODOS';  // Changed to English
  startDate: string = '';
  endDate: string = '';

  stDate: Date = new Date();  // Changed to English
  edDate: Date = new Date();  // Changed to English

  allStatus = [
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
  ];

  allCampus: Campus[] | any = [];  // Changed allCampus to allCampuses
  allAreas: Area[] | any = [];

  constructor(
    private analyticsService: AnalyticsService,
    private logisticaService: LogisticaService,
  ) {}

  async ngOnInit() {
    this.allCampus = await this.logisticaService.getAllCampus().toPromise();  // Changed getAllCampus to getAllCampuses
    this.allAreas = await this.logisticaService.getAllAreas().toPromise();
  }

  // Date formatting
  formatDate(date: any): string {
    const validDate = new Date(date);
  
    if (isNaN(validDate.getTime())) {
      return ''; 
    }
  
    const year = validDate.getFullYear();
    const month = ('0' + (validDate.getMonth() + 1)).slice(-2);
    const day = ('0' + validDate.getDate()).slice(-2);
  
    return `${year}-${month}-${day}`;
  }
  
  // Fetching orders data
  getOrders() {  // Changed getRequerimientos to fetchOrders
    this.startDate = this.formatDate(this.stDate);  // Updated startDateFilter
    this.endDate = this.formatDate(this.edDate);  // Updated endDateFilter

  
    console.log('sedeFilter:', this.sedeFilter);  // Changed sedeFilter to campusFilter
    console.log('areaFilter:', this.areaFilter);
    console.log('startDate:', this.startDate);
    console.log('endDate:', this.endDate);
    console.log('startDateFilter:', this.stDate);
    console.log('endDateFilter:', this.edDate);

    this.analyticsService.getAnalyticsOrders(this.sedeFilter,this.areaFilter, this.startDate, this.endDate, ).subscribe((orders: Orden[]) => {  // Replaced Requerimiento with Order
      this.orders = orders;
      console.log(orders);
      this.totalItems = this.orders.length;
    });
  }

  get paginatedOrders(): Orden[] {  // Changed paginatedRequerimientos to paginatedOrders
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.orders.slice(start, end);  // Replaced requerimientos with orders
  }

  // Export to Excel
  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.orders);  // Replaced requerimientos with orders
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'orders.xlsx');  // Changed the file name to orders.xlsx
  }

  // Export to PDF

  exportToPDF(): void {
    const doc = new jsPDF();
    const columns = ["Número", "RUC", "Razón Social", "Subtotal", "IGV", "Total", "Fecha", "Estado"];
    const rows = this.orders.map(order => [
      order.numero, 
      order.ruc, 
      order.razon_social, 
      order.subtotal, 
      order.igv, 
      order.total, 
      this.formatDate(order.fecha), // Usar la función de formato de fecha si es necesario
      order.estado
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 10, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [22, 160, 133] },
      theme: 'striped',
    });

    doc.save('orders.pdf');
  }


  // Change page
  changePage(page: number): void {
    this.page = page;
  }
}
