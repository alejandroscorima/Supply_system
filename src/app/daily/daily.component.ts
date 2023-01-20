import { Component, ComponentFactoryResolver, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { UserSession } from '../user_session';
import { Area } from '../area';
import { Campus } from '../campus';
import { Orden } from '../orden';
import { OrdenItem } from '../orden_item';
import { SelectionModel } from '@angular/cdk/collections';
import { Proveedor } from '../proveedor';
import { FileUploadService } from '../file-upload.service';
import { runInThisContext } from 'vm';
import { Daily } from '../daily';
import { threadId } from 'worker_threads';
import { Activity } from '../activity';


@Component({
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DailyComponent implements OnInit {

  user: User = new User('','','','','','',null,null,'','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  campus = [];
  areas = [];
  prioridades = [];

  fecha;
  anio;
  mes;
  dia;

  types=['COMPRA','SERVICIO'];

  pay_type=['EFECTIVO','TRANSFERENCIA']

  destino_dir='';

  regList: Daily[]= [];
  reg: Daily = new Daily('','','','','',0);
  activities: Activity[] = [];

  empresas: string[] = ['SUN','VISION','GO','IMG','WARI'];
  monedas: string[] = ['SOLES','DOLARES AMERICANOS'];

  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  unidades=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  aux_dec=['','ONCE','DOCE','TRECE','CATORCE','QUINCE']

  prefijoMoney='';
  moneyText='';

  fechaStart;
  fechaEnd;
  fechaDisabled;


  selection = new SelectionModel<Item>(true, []);

  doc = new jsPDF();

  img = new Image();

  posTituloSala;


  dataSourceDaily: MatTableDataSource<Daily>;

  docView = new jsPDF();

  previewView: any='';
  moneyTextView='';
  prefijoMoneyView='';

  public demo1TabIndex = 1;
  
  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();


  constructor(    private clientesService: ClientesService,
    private logisticaService: LogisticaService,
    private cookiesService: CookiesService,
    private usersService: UsersService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private toastr: ToastrService,
    private fileUploadService: FileUploadService,
  ) { }

  regDaily(){
    console.log(this.reg);
    this.reg.fecha=this.reg.fecha;
    this.reg.h_inicio=this.reg.h_inicio;
    this.reg.h_fin=this.reg.h_fin;
    this.reg.descripcion=this.reg.descripcion;
    this.reg.user_id = this.user.user_id;
    this.logisticaService.addDaily(this.reg).subscribe(res=>{
      console.log(res);
      this.toastr.success('Actividad registrada correctamente');
      this.reg.h_inicio='';
      this.reg.h_fin='';
      this.reg.descripcion='';
      this.reg.actividad='';
      this.logisticaService.getDaily().subscribe((resd:Daily[])=>{
        this.regList=resd;
        console.log(this.regList);
        this.dataSourceDaily = new MatTableDataSource(this.regList);
        this.dataSourceDaily.paginator = this.paginator.toArray()[0];
        this.dataSourceDaily.sort = this.sort.toArray()[0];
      });
    });

  }


  
  dateChange(){

    var anio = this.fecha.getFullYear();
    var mes = this.fecha.getMonth()+1;
    var dia = this.fecha.getDate();

    if(mes<10){
      mes='0'+mes;
    }
    if(dia<10){
      dia='0'+dia;
    }

    this.reg.fecha=anio+'-'+mes+'-'+dia;

  }



  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDaily.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceDaily.paginator) {
      this.dataSourceDaily.paginator.firstPage();
    }
  }

  logout(){
    var session_id=this.cookiesService.getToken('session_id');
    this.usersService.deleteSession(session_id).subscribe(resDel=>{
      if(resDel){
        this.cookiesService.deleteToken('session_id');
        location.reload();
      }
    })
  }

  ngOnInit() {
    this.fecha= new Date();

    const tabCount=2;
    this.demo1TabIndex = (this.demo1TabIndex+1) % tabCount;

    this.logisticaService.getDaily().subscribe((resd:Daily[])=>{
      if(resd.length!=0){
        this.regList=[];
        this.regList=resd;

        console.log(this.regList);
        this.dataSourceDaily = new MatTableDataSource(this.regList);
        this.dataSourceDaily.paginator = this.paginator.toArray()[0];
        this.dataSourceDaily.sort = this.sort.toArray()[0];
      }
    });

    this.logisticaService.getActivities('ACTIVO').subscribe((actList:Activity[])=>{
      if(actList.length!=0){
        this.activities=actList;
      }

    })

    
    if(this.cookiesService.checkToken('session_id')){
      this.usersService.getSession(this.cookiesService.getToken('session_id')).subscribe((s:UserSession)=>{
        if(s){
          this.usersService.getUserById(s.user_id).subscribe((u:User)=>{
            this.user=u;
            this.logisticaService.getAreaById(this.user.area_id).subscribe((a:Area)=>{
              if(a){
                this.user_area=a;
                this.logisticaService.getCampusById(this.user.campus_id).subscribe((c:Campus)=>{
                  if(c){
                    this.user_campus=c;
                    this.logisticaService.getAllCampus().subscribe((cs:Campus[])=>{
                      this.campus=cs;

                      this.posTituloSala = 74;

                      var anio = this.fecha.getFullYear();
                      var mes = this.fecha.getMonth()+1;
                      var dia = this.fecha.getDate();

                      if(mes<10){
                        mes='0'+mes;
                      }
                      if(dia<10){
                        dia='0'+dia;
                      }

                      this.reg.fecha=anio + '-' + mes + '-' + dia;
                      this.reg.user_id = this.user.user_id;
                    })


                  }
                })

              }
            })

          });
        }
      })
    }
    else{
      this.router.navigateByUrl('/login');
    }

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








@Component({
  selector: 'dialog-confirmDaily',
  templateUrl: 'dialog-confirmDaily.html',
  styleUrls: ['./daily.component.css']
})
export class DialogConfirmDaily implements OnInit {


  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmDaily>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}



  ngOnInit(): void {


  }

  confirm(){

    this.dialogRef.close(true);
  }

  cancel(){
    this.dialogRef.close(false);
  }


}