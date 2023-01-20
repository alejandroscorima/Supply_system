import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { UsersService } from '../users.service';
import { CookiesService } from '../cookies.service';
import { Session } from 'protractor';
import { UserSession } from '../user_session';
import { Area } from '../area';
import { Campus } from '../campus';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LoginComponent implements OnInit {

  username='';
  password='';

  hide = true;

  user: User = new User(null,null,null,null,null,null,null,null,null,null);

  req: Requerimiento = new Requerimiento(null,null,null,null,null,null,null,[],null,'PENDIENTE',null);

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);

  listaReq: Item[]= [];

  dataSourceReq: MatTableDataSource<Item>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(    private clientesService: ClientesService,
    private logisticaService: LogisticaService,
    private usersService: UsersService,
    private cookiesService: CookiesService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  searchItem(){

  }



  dateChange(value){

  }

  createSession(user_id: number){
    var dateAux= new Date();
    var created= dateAux.getTime();
    var s = new UserSession(String(user_id),String(created),String(created+36000000));
    return s;
  }

  onKeyup(e){

  }

  login(){
    this.usersService.getUser(this.username,this.password).subscribe((res:User)=>{
      if(res){
        this.user=res;

        var newS = this.createSession(this.user.user_id);
        this.usersService.addSession(newS).subscribe(resSes=>{


          if(parseInt(resSes['session_id'])!=0){

            this.cookiesService.setToken('session_id',resSes['session_id']);
            this.router.navigateByUrl('/');
          }
        })
      }
      else{
        if(this.username==''||this.password==''){
          this.toastr.warning('Ingresa un usuario y contraseña');
        }
        else{
          this.toastr.error('Usuario y/o contraseña incorrecto(s)');
        }

      }
    })
  }


  ngOnInit() {

    if(this.cookiesService.checkToken('session_id')){

      this.router.navigateByUrl('/');

    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

  onSubmit() {
  }





}





