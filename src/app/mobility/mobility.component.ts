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
import { UserSession } from '../user_session';
import { Console } from 'console';
import { SelectionModel } from '@angular/cdk/collections';
import { Orden } from '../orden';
import { OrdenItem } from '../orden_item';
import { Proveedor } from '../proveedor';
import { FondoItem } from '../fondo_item';
import { Area } from '../area';
import { Campus } from '../campus';
import { FondoLiquidacion } from '../fondo_liquidacion';
import { Mobility } from '../mobility';
import { runInThisContext } from 'vm';
import { TouchSequence } from 'selenium-webdriver';


@Component({
  selector: 'app-mobility',
  templateUrl: './mobility.component.html',
  styleUrls: ['./mobility.component.css']
})
export class MobilityComponent implements OnInit {


  @ViewChild("content",{static:true}) content:ElementRef;

  dias=['SELECCIONAR','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'];

  meses=['SELECCIONAR','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SETIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];


  fondoItems: FondoItem[]=[];
  fondoLiquidaciones: FondoLiquidacion[]=[];
  mobilities: Mobility[];
  mobility: Mobility = new Mobility('','','','',0,'','','','','','','');


  user: User = new User('','','','','','',null,null,'','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  selection = new SelectionModel<FondoItem>(true, []);

  fechaStart;
  fechaEnd;
  fechaStr;
  sala;
  campus:Campus[]=[];

  fondoItem;



  total_amount=0;

  prefijoMoney='S/.';

  fondoLiquidacion: FondoLiquidacion;


  dataSourceFondoItem: MatTableDataSource<FondoItem>;
  dataSourceFondoLiq: MatTableDataSource<FondoLiquidacion>;

  dataSourceMobility: MatTableDataSource<Mobility>;


  doc = new jsPDF();
  img = new Image();

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();




  constructor(private clientesService: ClientesService, private dialogo: MatDialog,
    private snackBar: MatSnackBar, private router: Router,
    private logisticaService: LogisticaService,
    private cookiesService: CookiesService,
    private usersService: UsersService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    ) { }



    editItem(it:Mobility){

      var dialogRef;
  
      dialogRef=this.dialog.open(DialogEditItemMobility,{
        data:it,
      })
  
      dialogRef.afterClosed().subscribe(res => {
        if(res){
          this.logisticaService.getMobility(this.sala).subscribe((rspM:Mobility[])=>{
            console.log(rspM);
            this.mobilities=rspM;
            this.dataSourceMobility = new MatTableDataSource(this.mobilities);
            this.dataSourceMobility.paginator = this.paginator.toArray()[0];
            this.dataSourceMobility.sort = this.sort.toArray()[0];
          });
        }
      })
  
    }
  
    delItem(it:FondoItem){
      var dialogRef;
      dialogRef=this.dialog.open(DialogConfirmMobility,{
        data:"Segur@ que desea eliminar el Item?",
      })
  
      dialogRef.afterClosed().subscribe(res => {
        if(res){
          console.log(it.id);
          this.logisticaService.deleteFondoItem(it.id).subscribe(resi=>{
            this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res2:FondoItem[])=>{
              this.fondoItems=res2;
              this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
              this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
              this.dataSourceFondoItem.sort = this.sort.toArray()[0];
            })
          })
        }
      })
    }
  
    anular(fond: FondoLiquidacion){
      var dialogRef;
      dialogRef=this.dialog.open(DialogConfirmMobility,{
        data:"Segur@ que desea anular el Registro?",
      })
  
      dialogRef.afterClosed().subscribe(res => {
        if(res){
          this.logisticaService.getFondoItemsByLiquidacionId(String(fond.id)).subscribe((resi:FondoItem[])=>{
            fond.estado='ANULADO';
            this.logisticaService.updateFondoLiquidacion(fond).subscribe();
            resi.forEach((it,indi)=>{
              it.estado='ANULADO';
              this.logisticaService.updateFondoItem(it).subscribe(a=>{
                it.estado='PENDIENTE';
                it.liquidacion_id=0;
                this.logisticaService.addFondoItem(it).subscribe(m=>{

                  if(indi==resi.length-1){
                    this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res2:FondoItem[])=>{
                      this.fondoItems=res2;
                      this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
                      this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
                      this.dataSourceFondoItem.sort = this.sort.toArray()[0];
                    })
                  }
                });
              });

            })
          })
        }
      })
    }
  
  
  
    applyFilterD(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSourceFondoItem.filter = filterValue.trim().toLowerCase();
  
      if (this.dataSourceFondoItem.paginator) {
        this.dataSourceFondoItem.paginator.firstPage();
      }
    }
  
    applyFilterL(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSourceFondoLiq.filter = filterValue.trim().toLowerCase();
  
      if (this.dataSourceFondoLiq.paginator) {
        this.dataSourceFondoLiq.paginator.firstPage();
      }
    }
  
    fechaChange(){
      var year= this.fechaStart.getFullYear();
      var month = this.fechaStart.getMonth()+1;
      if(month<10){
        month='0'+month;
      }
      var day = this.fechaStart.getDate();
      if(day<10){
        day='0'+day;
      }
      this.mobility.fecha=year+'-'+month+'-'+day;

      var year= this.fechaEnd.getFullYear();
      var month = this.fechaEnd.getMonth()+1;
      if(month<10){
        month='0'+month;
      }
      var day = this.fechaEnd.getDate();
      if(day<10){
        day='0'+day;
      }
      this.mobility.fecha+=' a '+year+'-'+month+'-'+day;
        
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
  
    salaChange(){
      this.logisticaService.getSalaByName(this.sala).subscribe((res4:Campus)=>{
        if(res4){
          //this.user_campus=res4;

          this.mobility.numero=res4.supply_ord_suffix;

          this.mobility.empresa=res4.company;
          this.mobility.campus=res4.name;
          this.mobility.campus_dir=res4.address;

          this.logisticaService.getMobility(this.sala).subscribe((rspM:Mobility[])=>{
            console.log(rspM);
            this.mobilities=rspM;
            this.dataSourceMobility = new MatTableDataSource(this.mobilities);
            this.dataSourceMobility.paginator = this.paginator.toArray()[0];
            this.dataSourceMobility.sort = this.sort.toArray()[0];
          });

        }
      })
  
    }
  
  
  
  
    reCreatePDF(mob:Mobility){

      this.logisticaService.getSalaByName(mob.campus).subscribe((s:Campus)=>{
        mob.empresa=s.company;
        mob.campus_dir=s.address;
        this.usersService.getUserById(mob.user_id).subscribe((usReg:User)=>{
          mob.personal=usReg.first_name+' '+usReg.last_name;
          this.generatePDF(mob);
        })
      })



    }
  
  
    generatePDF(mob:Mobility){
      var empresaCompleto='';
      if(mob.empresa=='VISION'){
        empresaCompleto='VISION GAMES CORPORATION S.A.C.'
      }
      if(mob.empresa=='SUN'){
        empresaCompleto='SUN INVERSIONES S.A.C.'
      }
      if(mob.empresa=='IMG'){
        empresaCompleto='INVERSIONES MEGA GAMING S.A.C.'
      }
      if(mob.empresa=='GO'){
        empresaCompleto='GRUPO OSCORIMA S.A.C.'
      }
      if(mob.empresa=='WARI'){
        empresaCompleto='INVERSIONES WARI S.A.C.'
      }
  
      this.doc = new jsPDF();
  
      if(mob.campus.includes('OFICINA')){
        this.img.src = 'assets/logo'+mob.empresa+'.png';
      }
      else{
        this.img.src = 'assets/logo'+mob.campus+'.png';
      }
  
      this.doc.addImage(this.img, 'png', 10, 10, 40, 40, '','FAST',0);
      this.doc.setFont("helvetica","bold");
      this.doc.setFontSize(12);
      this.doc.text(empresaCompleto,100,29,{align:'center'});
      this.doc.setFont("helvetica","normal");
      this.doc.setFontSize(12);
      this.doc.text(mob.campus,100,36,{align:'center'});
      this.doc.setFont("helvetica","normal");
      this.doc.setFontSize(8);
      if(mob.campus_dir.length<63){
        this.doc.text(mob.campus_dir,100,43,{align:'center'});
      }
      else{
        var direccionArray=mob.campus_dir.split(',');
        this.doc.text(direccionArray[0],100,43,{align:'center'});
        this.doc.text(direccionArray[1],100,48,{align:'center'});
      }
  
      //this.doc.roundedRect(65, 25, 80, 20, 2, 2, 'S');
  
  

      this.doc.rect(150, 28, 50, 14);

      this.doc.setFont("helvetica","italic");
      this.doc.setFontSize(10);

      this.doc.setTextColor(183,18,18);
      this.doc.text('Nº '+mob.numero,175,25,{align:'center'});

      this.doc.setFont("helvetica","normal");
      this.doc.setFontSize(10);
      this.doc.setTextColor(0,0,0);
      this.doc.text(mob.fecha_gen,175,33,{align:'center'});
      this.doc.text('S/. '+mob.monto,175,39,{align:'center'});

      this.doc.setTextColor(0,0,0);
      this.doc.setFontSize(15);
      this.doc.setFont("helvetica","bold");
      this.doc.text('LIQUIDACION DE MOVILIDAD',110,70,{align:'center'});

      this.doc.setFont("helvetica","normal");
      this.doc.setFontSize(10);
      this.doc.setTextColor(0,0,0);
      this.doc.text('RENDIDO POR: '+mob.personal,110,80,{align:'center'});
      this.doc.text('SALA: '+mob.campus,110,88,{align:'center'});
      this.doc.text('FECHA: '+mob.fecha,110,96,{align:'center'});
      this.doc.text('FONDO: '+'S/. '+mob.monto,110,104,{align:'center'});

  /*     this.doc.text('DIRECCION',15,79);
      this.doc.setFontSize(11); */
  /*     this.doc.text(': '+fondliq.campus_dir,45,79);
      this.doc.setFontSize(12); */
      this.doc.line(80, 118, 140, 118,'S');
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica","bold");
      this.doc.text('CONCEPTO',95,123,{align:'center'});
      this.doc.text('MONTO (S/.)',125,123,{align:'center'});
      var pos_line=118;
      var pos_item=pos_line+5;
      this.doc.setFont("helvetica","normal");
      pos_line+=7;
      pos_item+=7;
      this.doc.line(80, pos_line, 140, pos_line, 'S');
      this.doc.text('MOVILIDAD',95,pos_item,{align:'center'});
      this.doc.text(mob.monto,125,pos_item,{align:'center'});
      pos_line+=7;
      pos_item+=7;
      this.doc.setFont("helvetica","bold");
      this.doc.line(80, pos_line, 140, pos_line, 'S');
      this.doc.text('TOTAL',95,pos_item,{align:'center'});
      this.doc.text('S/. '+mob.monto,125,pos_item,{align:'center'});
      this.doc.setFont("helvetica","normal");
      pos_line+=7;
      this.doc.line(80, pos_line, 140, pos_line, 'S');
  
      this.doc.line(80, 118, 80, pos_line, 'S');
      this.doc.line(110, 118, 110, pos_line, 'S');
      this.doc.line(140, 118, 140, pos_line, 'S');
  
  
      window.open(URL.createObjectURL(this.doc.output("blob")));
  
  
    }
  
  
    addMobility(){
      var year= this.fechaStart.getFullYear();
      var month = this.fechaStart.getMonth()+1;
      if(month<10){
        month='0'+month;
      }
      var day = this.fechaStart.getDate();
      if(day<10){
        day='0'+day;
      }
      this.mobility.fecha=year+'-'+month+'-'+day;

      year= this.fechaEnd.getFullYear();
      month = this.fechaEnd.getMonth()+1;
      if(month<10){
        month='0'+month;
      }
      day = this.fechaEnd.getDate();
      if(day<10){
        day='0'+day;
      }
      this.mobility.fecha+=' a '+year+'-'+month+'-'+day;


      var fechaActual = new Date();
      year= fechaActual.getFullYear();
      month = fechaActual.getMonth()+1;
      if(month<10){
        month='0'+month;
      }
      day = fechaActual.getDate();
      if(day<10){
        day='0'+day;
      }
      this.mobility.fecha_gen=year+'-'+month+'-'+day;

      var hour = this.fechaStart.getHours();
      var min = this.fechaStart.getMinutes();
      var sec = this.fechaStart.getSeconds();

      if(hour<10){
        hour='0'+hour;
      }
      if(min<10){
        min='0'+min;
      }
      if(sec<10){
        sec='0'+sec;
      }

      this.mobility.hora_gen = hour+':'+min+':'+sec; 


      //this.mobility.campus=this.sala;
      this.mobility.estado='REGISTRADO';
      this.mobility.monto=this.mobility.monto;
      this.mobility.user_id=this.user.user_id;
      this.mobility.personal=this.user.first_name+' '+this.user.last_name;

      this.logisticaService.getLastMobCode(this.mobility.numero,this.mobility.campus).subscribe(resi=>{
        console.log(resi);
        if(resi){
  
          var codeArray=String(resi['numero']).split('-');
          var numeracion = parseInt(codeArray[1])+1;
          var numeracionStr = '';
          if(numeracion<10){
            numeracionStr='000'+numeracion;
          }
          else if(numeracion<100){
            numeracionStr='00'+numeracion;
          }
          else if(numeracion<1000){
            numeracionStr='0'+numeracion;
          }
          else{
            numeracionStr=String(numeracion);
          }
          this.mobility.numero=codeArray[0]+'-'+numeracionStr;
        }
        else{
          this.mobility.numero+='-0001';
        }

        this.logisticaService.addMobility(this.mobility).subscribe(rspM=>{
          if(rspM){
            console.log(this.mobility);
            this.generatePDF(this.mobility);

            console.log(rspM);
            this.logisticaService.getMobility(this.sala).subscribe((rspM:Mobility[])=>{
              console.log(rspM);
              this.mobilities=rspM;
              this.dataSourceMobility = new MatTableDataSource(this.mobilities);
              this.dataSourceMobility.paginator = this.paginator.toArray()[0];
              this.dataSourceMobility.sort = this.sort.toArray()[0];
              this.mobility = new Mobility('','','','',0,'','','','','','','');
            });
          }

        });

      })


    }
  
    ngOnInit() {
  
      this.fechaStart=new Date();
      this.fechaEnd=new Date();

  
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
                      this.sala=this.user_campus.name;

                      this.mobility.empresa=this.user_campus.company;
                      this.mobility.campus=this.sala;
                      this.mobility.numero=this.user_campus.supply_ord_suffix;
                      this.mobility.campus_dir=this.user_campus.address;
  
                      if(this.user.supply_role=='ADMINISTRADOR'||this.user.supply_role=='SUPERUSUARIO'||this.user_area.name=='ABASTECIMIENTO'){
                        this.logisticaService.getAllCampus().subscribe((resi:Campus[])=>{
                          if(resi){
                            this.campus=resi;
                            this.logisticaService.getMobility(this.sala).subscribe((rspM:Mobility[])=>{
                              console.log(rspM);
                              this.mobilities=rspM;
                              this.dataSourceMobility = new MatTableDataSource(this.mobilities);
                              this.dataSourceMobility.paginator = this.paginator.toArray()[0];
                              this.dataSourceMobility.sort = this.sort.toArray()[0];
                            });
                          }
                        })
                      }
  
                      if(this.user.position=='ADMINISTRADOR'){
                        this.logisticaService.getMobility(this.sala).subscribe((rspM:Mobility[])=>{
                          console.log(rspM);
                          this.mobilities=rspM;
                          this.dataSourceMobility = new MatTableDataSource(this.mobilities);
                          this.dataSourceMobility.paginator = this.paginator.toArray()[0];
                          this.dataSourceMobility.sort = this.sort.toArray()[0];
                        });
                      }
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

}





@Component({
  selector: 'dialog-newItemMobility',
  templateUrl: 'dialog-newItemMobility.html',
  styleUrls: ['./mobility.component.css']
})
export class DialogNewItemMobility implements OnInit {

  salas = [];
  areas = [];
  prioridades = [];

  fecha;
  anio;
  mes;
  dia;

  destino_dir='';

  personal: User[]= [];

  empresas: string[] = ['SUN','VISION','GO','IMG','WARI'];
  monedas: string[] = ['SOL','DOLAR'];
  docs: string[] = ['FACTURA','BOLETA','RECIBO'];

  req: Requerimiento = new Requerimiento(null,null,null,null,null,null,null,[],null,'PENDIENTE',null);

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);
  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);

  listaReq: Item[]= [];
  campus:any= [];

  prefijoMoney='';

  dataSourceReq: MatTableDataSource<Item>;
  selection = new SelectionModel<Item>(true, []);

  doc = new jsPDF();

  img = new Image();

  posTituloSala;

/*   @ViewChild(MatPaginator, { static: false }) paginator2= new QueryList<MatPaginator>();
  @ViewChild(MatSort, { static: false }) sort2= new QueryList<MatSort>(); */

  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogNewItemMobility>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReq.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceReq.paginator) {
      this.dataSourceReq.paginator.firstPage();
    }
  }

  changeRuc(){
    if(this.data['item'].ruc.length==11){
      this.logisticaService.getConsultaRUC(this.data['item'].ruc).subscribe(res=>{
        if(res){
          this.data['item'].raz_social=res['data']['nombre_o_razon_social'];
        }
        else{
          this.data['item'].raz_social='';
        }
      })
    }

  }


  ngOnInit(): void {
    this.logisticaService.getAllCampus().subscribe(res=>{
      if(res){
        this.campus=res;
      }
    })

  }

  save(){
    this.data['item'].monto=parseFloat(this.data['item'].monto).toFixed(2);
    this.logisticaService.addFondoItem(this.data['item']).subscribe(res=>{
      if(res){
        this.dialogRef.close(this.data['item']);
      }
    })
  }

  dateChange(value){
    var year= this.data['date'].getFullYear();
    var month = this.data['date'].getMonth()+1;
    if(month<10){
      month='0'+month;
    }
    var day = this.data['date'].getDate();
    if(day<10){
      day='0'+day;
    }
    this.data['item'].fecha=year+'-'+month+'-'+day;
    console.log(this.data['item']);
  }


  ChangeCampus(){
  }

}




@Component({
  selector: 'dialog-editItemMobility',
  templateUrl: 'dialog-editItemMobility.html',
  styleUrls: ['./mobility.component.css']
})
export class DialogEditItemMobility implements OnInit {

  salas = [];
  areas = [];
  prioridades = [];

  fecha;
  anio;
  mes;
  dia;

  date;

  destino_dir='';

  personal: User[]= [];

  empresas: string[] = ['SUN','VISION','GO','IMG','WARI'];
  monedas: string[] = ['SOL','DOLAR'];
  docs: string[] = ['FACTURA','BOLETA','RECIBO'];

  req: Requerimiento = new Requerimiento(null,null,null,null,null,null,null,[],null,'PENDIENTE',null);

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);
  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);

  listaReq: Item[]= [];

  campus:any= [];

  prefijoMoney='';

  dataSourceReq: MatTableDataSource<Item>;
  selection = new SelectionModel<Item>(true, []);

  doc = new jsPDF();

  img = new Image();

  posTituloSala;

/*   @ViewChild(MatPaginator, { static: false }) paginator2= new QueryList<MatPaginator>();
  @ViewChild(MatSort, { static: false }) sort2= new QueryList<MatSort>(); */

  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogEditItemMobility>,
    @Inject(MAT_DIALOG_DATA) public data:FondoItem,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReq.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceReq.paginator) {
      this.dataSourceReq.paginator.firstPage();
    }
  }

  changeRuc(){
    if(this.data.ruc.length==11){
      this.logisticaService.getConsultaRUC(this.data.ruc).subscribe(res=>{
        if(res){
          this.data.raz_social=res['data']['nombre_o_razon_social'];
        }
        else{
          this.data.raz_social='';
        }
      })
    }

  }


  ngOnInit(): void {
    var dateArr=this.data.fecha.split('-');
    this.date= new Date(parseInt(dateArr[0]),parseInt(dateArr[1])-1,parseInt(dateArr[2]));
    console.log(this.date);
    this.logisticaService.getAllCampus().subscribe(res=>{
      if(res){
        this.campus=res;
      }
    })

  }

  save(){
    this.data.monto=parseFloat(this.data.monto).toFixed(2);
    this.logisticaService.updateFondoItem(this.data).subscribe(res=>{
      if(res){
        this.dialogRef.close(true);
      }
    })
  }

  dateChange(value){
    var year= this.date.getFullYear();
    var month = this.date.getMonth()+1;
    if(month<10){
      month='0'+month;
    }
    var day = this.date.getDate();
    if(day<10){
      day='0'+day;
    }
    this.data.fecha=year+'-'+month+'-'+day;
  }

  ChangeCampus(){
  }

}




@Component({
  selector: 'dialog-confirmMobility',
  templateUrl: 'dialog-confirmMobility.html',
  styleUrls: ['./mobility.component.css']
})
export class DialogConfirmMobility implements OnInit {


  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmMobility>,
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
