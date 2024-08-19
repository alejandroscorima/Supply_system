import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ClientesService } from "../clientes.service"
import { User } from "../user"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Item } from '../item';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MAT_SORT_HEADER_INTL_PROVIDER_FACTORY } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LogisticaService } from '../logistica.service';
import { Requerimiento } from '../requerimiento';
import { CookiesService } from '../cookies.service';
import { UsersService } from '../users.service';
import { Console } from 'console';
import { SelectionModel } from '@angular/cdk/collections';
import { Orden } from '../orden';
import { OrdenItem } from '../orden_item';
import { Proveedor } from '../proveedor';
import { Area } from '../area';
import { Campus } from '../campus';
import { FileUploadService } from '../file-upload.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatStepper } from '@angular/material/stepper';
import { Collaborator } from '../collaborator';
import { initFlowbite } from 'flowbite';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit {

  user_id;
  user_role;
  user_area;
  user_campus;

  user:User|any = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab:Collaborator|any = new Collaborator(0,0,'',0,'','','','','','','','','');

  constructor(private clientesService: ClientesService,
    private snackBar: MatSnackBar, private router: Router,
    private logisticaService: LogisticaService,
    private cookiesService: CookiesService,
    private usersService: UsersService,
    private toastr: ToastrService,
    ) { }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  getCurrentDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Añadir 1 al mes porque getMonth() devuelve meses 0-indexados
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getCurrentHour(): string {
    const date = new Date();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${hours}:${minutes}:${seconds}`;
  }  

  logout(){

    this.cookiesService.deleteToken('user_id');
    this.cookiesService.deleteToken('user_role');
    location.reload();
  
  }

  async getUserinfo(){
    this.user = await this.usersService.getUserByIdNew(this.user_id).toPromise();
    this.colab = await this.usersService.getCollaboratorByUserId(this.user.user_id).toPromise();
    this.user_area =  await this.logisticaService.getAreaById(this.colab.area_id).toPromise();
    this.user_campus = await this.logisticaService.getCampusById(this.colab.campus_id).toPromise();
  }

  ngOnInit() {
    if(this.cookiesService.checkToken('user_id')){
      this.user_id=parseInt(this.cookiesService.getToken('user_id'));
      this.user_role=this.cookiesService.getToken('user_role');
      
      this.getUserinfo();

    }
    else{
      this.router.navigateByUrl('/login');
    }

  }

}


