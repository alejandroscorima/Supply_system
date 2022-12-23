import { Component, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ClientesService } from "../clientes.service"
import { User } from "../user"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../item';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-birthday',
  templateUrl: './birthday.component.html',
  styleUrls: ['./birthday.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BirthdayComponent implements OnInit {

  expandedElement: Item ;



  fecha;
  fecha_cumple;
  fechaString;
  day;
  month;
  year;

  dataSourceHB: MatTableDataSource<User>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(
    private clientesService: ClientesService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  searchItem(){

  }

  saveCheck(){

  }

  applyFilterList(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceHB.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceHB.paginator) {
      this.dataSourceHB.paginator.firstPage();
    }
  }

  change(a){
    this.year=this.fecha.getFullYear();
    this.month=parseInt(this.fecha.getMonth())+1;
    this.day=this.fecha.getDate();

    if(parseInt(this.month)<10){
      this.month='0'+this.month;
    }

    if(parseInt(this.day)<10){
      this.day='0'+this.day;
    }

    this.fecha_cumple='-'+this.month+'-'+this.day;
    this.fechaString=this.year+'-'+this.month+'-'+this.day;

  }

  ngOnInit() {

    this.fecha=new Date();

    this.year=this.fecha.getFullYear();
    this.month=parseInt(this.fecha.getMonth())+1;
    this.day=this.fecha.getDate();

    if(parseInt(this.month)<10){
      this.month='0'+this.month;
    }

    if(parseInt(this.day)<10){
      this.day='0'+this.day;
    }

    this.fecha_cumple='-'+this.month+'-'+this.day;
    this.fechaString=this.year+'-'+this.month+'-'+this.day;

  }

  onSubmit() {
  }


/*   delete(code){

        var index = this.items.findIndex(m=>m.codigo==code);

        this.items[index].cantidad=1;
      } */

}



