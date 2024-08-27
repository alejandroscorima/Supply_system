import { Component, OnInit } from '@angular/core'; // Asegúrate de que el servicio esté en la ruta correcta
import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { AnalyticsService } from 'src/app/analytics.service';
import { FondoItem } from 'src/app/fondo_item';
import { LogisticaService } from 'src/app/logistica.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-imprest',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './imprest.component.html',
  styleUrl: './imprest.component.css'
})
export class ImprestComponent implements OnInit {
  fondoItems: FondoItem[] = [];
  totalItems: number = 0;
  pageSize: number = 7;
  page: number = 1;

  campusFilter: string = 'TODOS';
  categoryFilter: string = 'TODOS';
  stateFilter: string = 'TODOS';

  startDate: string = '';
  endDate: string = '';

  stDate: Date = new Date();
  edDate: Date = new Date();

  allCampus: any[] = [];
  allCategories: any[] = [
    'OTROS','FERRETERIA','MENAJE','DISFRACES','TORTAS','UTILES DE OFICINA','DECORACION','SHOW MUSICAL',
  ];
  allStates: any[] = ['REGISTRADO','ANULADO'  ];

  paginatedFondoItems: FondoItem[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private logisticaService: LogisticaService
  ) {}

  ngOnInit() {
    //this.getFondoItems();
    this.getCampuses();
  

  }

  getFondoItems() {
    this.startDate = this.formatDate(this.stDate);  // Updated startDateFilter
    this.endDate = this.formatDate(this.edDate);  // Updated endDateFilter



    this.analyticsService.getAnalyticsFondoItems(this.campusFilter,this.categoryFilter,this.stateFilter,this.startDate,this.endDate).subscribe((data: FondoItem[]) => {
      this.fondoItems = data
      console.log(data)
      this.totalItems = this.fondoItems.length;
      this.paginatedFondoItems = this.paginateFondoItems();
    });
  }

  

  paginateFondoItems(): FondoItem[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.fondoItems.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    this.page = page;
    this.paginatedFondoItems = this.paginateFondoItems();
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.fondoItems);
    const workbook = { Sheets: { 'FondoItems': worksheet }, SheetNames: ['FondoItems'] };
    XLSX.writeFile(workbook, 'fondoitems.xlsx');
  }

  exportToPDF() {
    const doc = new jsPDF('p', 'mm', 'a4'); // p: portrait, mm: millimeters, a4: paper size

    // Añadir título
    doc.setFontSize(18);
    doc.text('Reporte de Fondo Items', 14, 22);

    // Añadir detalles del filtro usado, si lo deseas
    doc.setFontSize(12);
    doc.text(`Campus: ${this.campusFilter} | Categoría: ${this.categoryFilter} | Estado: ${this.stateFilter}`, 14, 32);

    // Generar tabla
    (doc as any).autoTable({
        startY: 40,
        //'ID'
        head: [[ 'Campus', 'Fecha', 'Tipo Doc', 'Serie', 'Número', 'RUC', 'Razón Social', 'Monto', 'Estado']],
        body: this.fondoItems.map(item => [
            //item.id,
            item.campus,
            item.fecha,
            item.tipo_doc,
            item.serie,
            item.numero,
            item.ruc,
            item.raz_social,
            item.monto,
            item.estado
        ]),
        theme: 'striped', // puedes cambiarlo a 'grid', 'plain', etc.
        headStyles: { fillColor: [41, 128, 185] }, // azul claro
        margin: { top: 40 },
        columnStyles: {
          //0: { cellWidth: 15 }, // ID
          0: { cellWidth: 15 }, // Campus
          1: { cellWidth: 15 }, // Fecha
          2: { cellWidth: 20 }, // Tipo Doc
          3: { cellWidth: 20 }, // Serie
          4: { cellWidth: 20 }, // Número
          5: { cellWidth: 15 }, // RUC
          6: { cellWidth: 37 }, // Razón Social
          7: { cellWidth: 20 }, // Monto
          8: { cellWidth: 28  }  // Estado
        },
      //   columnStyles: {
      //     0: { cellWidth: 'auto' }, // ID
      //     1: { cellWidth: 'auto' }, // Campus
      //     2: { cellWidth: 'auto' }, // Fecha
      //     3: { cellWidth: 'auto' }, // Tipo Doc
      //     4: { cellWidth: 'auto' }, // Serie
      //     5: { cellWidth: 'auto' }, // Número
      //     6: { cellWidth: 'auto' }, // RUC
      //     7: { cellWidth: 'auto' }, // Razón Social
      //     8: { cellWidth: 'auto' }, // Monto
      //     9: { cellWidth: 'auto' }  // Estado
      // },
        didDrawPage: function (data) {
          doc.text('Página ' + doc.internal.getNumberOfPages(), 14, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('fondoitems.pdf');
}
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

  getCampuses() {
    this.logisticaService.getAllCampus().subscribe((data: any) => {
      this.allCampus = data;
    });
  }

  
}