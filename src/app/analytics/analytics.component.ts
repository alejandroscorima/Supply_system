import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
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
import { Requerimiento } from '../requerimiento';
import { LogisticaService } from '../logistica.service';
import { CookiesService } from '../cookies.service';
import { UsersService } from '../users.service';
import { Area } from '../area';
import { Campus } from '../campus';
import { Orden } from '../orden';
import { OrdenItem } from '../orden_item';
import { SelectionModel } from '@angular/cdk/collections';
import { Proveedor } from '../proveedor';

import * as XLSX from 'xlsx';
import { Product } from '../product';
import { Chart, registerables } from 'chart.js';
import { Collaborator } from '../collaborator';
import { initFlowbite } from 'flowbite';
Chart.register(...registerables);


@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AnalyticsComponent implements OnInit, AfterViewInit {

  userOnSession: User|any = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colabOnSession: Collaborator|any = new Collaborator(0,0,'',0,'','','','','','','','','');
  userArea: Area|any = new Area('',null);
  userCampus: Campus|any = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string = '';

  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  unidades=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  aux_dec=['','ONCE','DOCE','TRECE','CATORCE','QUINCE'];

  allCampus: Campus[]|any=[];
  allAreas: Area[]|any=[];

  requisitionsCampusFilter: Campus[]=[];
  requisitionsAreasFilter: Area[]=[];
  requisitionsDateStartFilter: string;
  requisitionsDateEndFilter: string;
  requisitionsStatusFilter: string[]=[];

  constructor(
    private logisticaService: LogisticaService,
    private cookiesService: CookiesService,
    private usersService: UsersService,
    public dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  async ngOnInit() {
    if(this.cookiesService.checkToken('user_id')){
      this.user_id = parseInt(this.cookiesService.getToken('user_id'));
      this.user_role = this.cookiesService.getToken('user_role');
      this.getUserInfo(this.user_id);

      this.allCampus = await this.logisticaService.getAllCampus().toPromise();
      this.allAreas = await this.logisticaService.getAllAreas().toPromise();
    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

  async getUserInfo(user_id: number){
    this.userOnSession = await this.usersService.getUserByIdNew(this.user_id).toPromise();
    this.colabOnSession = await this.usersService.getCollaboratorByUserId(this.userOnSession.user_id).toPromise();
    this.userArea = await this.logisticaService.getAreaById(this.colabOnSession.area_id).toPromise();
    this.userCampus = await this.logisticaService.getCampusById(this.colabOnSession.campus_id).toPromise();
  }

  numToText3Cifras(n:number){
    var text:string='';
    var centenas:number=Math.floor(n/100);
    var decenas:number=Math.floor(Math.floor(n%100)/10);
    var unidades:number=Math.floor(n%10);
    text+=this.centenas[centenas];
    if(centenas>0&&(decenas!=0||unidades!=0)){
      if(centenas==1){
        text+='TO';
      }
      text+=' ';
    }
    if(decenas>0){
      if(unidades==0){
        text+=this.decenas[decenas];
      }
      else{
        if(decenas==1){
          if(unidades<6){
            text+=this.aux_dec[unidades];
          }
          else{
            text+='DIECI';
            text+=this.unidades[unidades];
          }
        }
        if(decenas==2){
          text+='VEINTI';
          text+=this.unidades[unidades];
        }
        if(decenas>2){
          text+=this.decenas[decenas];
          text+=' Y ';
          text+=this.unidades[unidades];
        }
      }
    }
    else{
      text+=this.unidades[unidades];
    }
    return text;
  }

  numToText9Cifras(n:number){
    var text:string='';
    var mill: number = Math.floor(n/(Math.pow(10,6)));
    var mil: number = Math.floor(Math.floor(n%(Math.pow(10,6)))/(Math.pow(10,3)));
    var und: number = Math.floor(n%(Math.pow(10,3)));

    if(mill>0){
      if(mill==1){
        text+='UN MILLON';
      }
      else{
        text+=this.numToText3Cifras(mill);
        text+=' MILLONES';
      }
      if(mil!=0||und!=0){
        text+=' ';
      }
    }
    if(mil>0){
      if(mil==1){
        text+='MIL';
      }
      else{
        text+=this.numToText3Cifras(mil);
        text+=' MIL';
      }
      if(und!=0){
        text+=' ';
      }
    }
    if(und>0){
      text+=this.numToText3Cifras(und);
    }

    return text;
  }

}


