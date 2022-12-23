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
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HistoryComponent implements OnInit {

  expandedElement: Item ;


  salas: string[]=['MEGA','PRO','HUARAL'];

  fecha;
  fechaString;

  sala;

  day;
  month;
  year;

  dataSourceHistory: MatTableDataSource<any>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(
    private clientesService: ClientesService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  searchItem(){

  }

  saveCheck(){

  }

  applyFilterList(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceHistory.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceHistory.paginator) {
      this.dataSourceHistory.paginator.firstPage();
    }
  }

  salaChange(){

  }

  change(a){

  }

  viewDetail(vis){
    var dialogRef;

    dialogRef=this.dialog.open(DialogHistoryDetail,{
      data:{data:vis,dataSala:this.sala}
    })

    dialogRef.afterClosed().subscribe((res:User) => {
    })
  }

  viewLudops(){
    var dialogRef;

    dialogRef=this.dialog.open(DialogLudops,{
      data:""
    })

    dialogRef.afterClosed().subscribe((res:User) => {
    })
  }

  ngOnInit() {

    this.sala='';

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

    this.fechaString=this.year+'-'+this.month+'-'+this.day;

    this.toastr.info('Selecciona una sala y fecha para mostrar el historial');
/*     this.clientesService.getHistoryByDate(this.fechaString,this.sala).subscribe((vList:Visit[])=>{
      this.visits=vList;
      this.dataSourceHistory = new MatTableDataSource(this.visits);
      this.dataSourceHistory.paginator = this.paginator.toArray()[0];
      this.dataSourceHistory.sort = this.sort.toArray()[0];
    }); */
  }

  onSubmit() {
  }



}







@Component({
  selector: 'dialog-history-detail',
  templateUrl: 'dialog-history-detail.html',
  styleUrls: ['./history.component.css']
})
export class DialogHistoryDetail implements OnInit {


  dataSourceHistoryClient: MatTableDataSource<any>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();


  constructor(
    public dialogRef: MatDialogRef<DialogHistoryDetail>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {


  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}







@Component({
  selector: 'dialog-ludops',
  templateUrl: 'dialog-ludops.html',
  styleUrls: ['./history.component.css']
})
export class DialogLudops implements OnInit {


  dataSourceHistoryClient: MatTableDataSource<any>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();


  constructor(
    public dialogRef: MatDialogRef<DialogLudops>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
