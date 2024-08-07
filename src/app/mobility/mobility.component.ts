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
import { Collaborator } from '../collaborator';


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
  mobilitiesFiltered: Mobility[];
  mobilitiesDisplayed: Mobility[];
  mobility: Mobility = new Mobility('','','','',0,'','','','','','','');


  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string = '';

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

  mobilitiesPageSize = 10;
  mobilitiesCurrentPage = 1;
  mobilitiesTotalPages = 1;
  mobilitiesFilterValue = '';


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

  changePage(page: number) {
    this.mobilitiesCurrentPage = page;
    this.updateTable();
  }

  updateTable() {
    const start = (this.mobilitiesCurrentPage - 1) * this.mobilitiesPageSize;
    const end = start + this.mobilitiesPageSize;

    if(this.mobilitiesFilterValue!=''){
      this.mobilitiesFilterValue = this.mobilitiesFilterValue.trim().toLowerCase();
      // Filtrar el array de datos
      this.mobilitiesFiltered = this.mobilities.filter(item => {
        if(item.estado){
          return (
            item.fecha.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.campus.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.numero.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.monto.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.personal.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.estado.toLowerCase().includes(this.mobilitiesFilterValue) 
          );
        }
        else{
          return (
            item.fecha.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.campus.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.numero.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.monto.toLowerCase().includes(this.mobilitiesFilterValue) ||
            item.personal.toLowerCase().includes(this.mobilitiesFilterValue)
          );
        }
      })

    }
    else{
      this.mobilitiesFiltered=this.mobilities;
    }

    this.mobilitiesTotalPages = Math.ceil(this.mobilitiesFiltered.length / this.mobilitiesPageSize);

    this.mobilitiesDisplayed=this.mobilitiesFiltered.slice(start,end);
  }
  
  
  
  applyFilterD() {

    this.mobilitiesCurrentPage = 1;


    this.updateTable();

  }

  applyFilterL(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFondoLiq.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceFondoLiq.paginator) {
      this.dataSourceFondoLiq.paginator.firstPage();
    }
  }

  fechaChange(){
/*       var year= this.fechaStart.getFullYear();
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
    this.mobility.fecha+=' a '+year+'-'+month+'-'+day; */
    this.mobility.fecha=this.fechaStart+' a '+this.fechaEnd;
      
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
      this.usersService.getUserByIdNew(mob.user_id).subscribe((usReg:User)=>{
        mob.personal=usReg.first_name+' '+usReg.paternal_surname+''+usReg.maternal_surname;
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
/*       var year= this.fechaStart.getFullYear();
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
    this.mobility.fecha+=' a '+year+'-'+month+'-'+day; */

    this.mobility.fecha=this.fechaStart+' a '+this.fechaEnd;


/*       var fechaActual = new Date();
    year= fechaActual.getFullYear();
    month = fechaActual.getMonth()+1;
    if(month<10){
      month='0'+month;
    }
    day = fechaActual.getDate();
    if(day<10){
      day='0'+day;
    } */
    this.mobility.fecha_gen=this.getCurrentDate();

/*       var hour = this.fechaStart.getHours();
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
    } */

    this.mobility.hora_gen = this.getCurrentHour(); 


    //this.mobility.campus=this.sala;
    this.mobility.estado='REGISTRADO';
    this.mobility.monto=this.mobility.monto;
    this.mobility.user_id=this.user.user_id;
    this.mobility.personal=this.user.first_name+' '+this.user.paternal_surname+' '+this.user.maternal_surname;

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

    this.fechaStart=this.getCurrentDate();
    this.fechaEnd=this.getCurrentDate();


    if(this.cookiesService.checkToken('user_id')){
      this.user_id = parseInt(this.cookiesService.getToken('user_id'));
      this.user_role = this.cookiesService.getToken('user_role');

      this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
        this.user=u;




        this.usersService.getCollaboratorByUserId(this.user.user_id).subscribe((c:Collaborator)=>{
          this.colab=c;
          this.logisticaService.getAreaById(this.colab.area_id).subscribe((ar:Area)=>{
            if(ar){
              this.user_area=ar;
              this.logisticaService.getCampusById(this.colab.campus_id).subscribe((camp:Campus)=>{
                if(camp){
                  this.user_campus=camp;

                  this.sala=this.user_campus.name;

                  this.mobility.empresa=this.user_campus.company;
                  this.mobility.campus=this.sala;
                  this.mobility.numero=this.user_campus.supply_ord_suffix;
                  this.mobility.campus_dir=this.user_campus.address;

                  if(this.user.supply_role=='ADMINISTRADOR'||this.user.supply_role=='SUPER USUARIO'||this.user_area.name=='ABASTECIMIENTO'){
                    this.logisticaService.getAllCampus().subscribe((resi:Campus[])=>{
                      if(resi){
                        this.campus=resi;
                        this.logisticaService.getMobility(this.sala).subscribe((rspM:Mobility[])=>{
                          console.log(rspM);
                          this.mobilities=rspM;
                          this.mobilitiesFiltered=this.mobilities;
                          this.updateTable();
                          this.dataSourceMobility = new MatTableDataSource(this.mobilities);
                          this.dataSourceMobility.paginator = this.paginator.toArray()[0];
                          this.dataSourceMobility.sort = this.sort.toArray()[0];
                        });
                      }
                    })
                  }

                  if(this.user.supply_role=='USUARIO AVANZADO'&&(this.colab.area_id==13||this.colab.area_id==12)){
                    this.logisticaService.getMobility(this.sala).subscribe((rspM:Mobility[])=>{
                      console.log(rspM);
                      this.mobilities=rspM;
                      this.mobilitiesFiltered=this.mobilities;
                      this.updateTable();
                      this.dataSourceMobility = new MatTableDataSource(this.mobilities);
                      this.dataSourceMobility.paginator = this.paginator.toArray()[0];
                      this.dataSourceMobility.sort = this.sort.toArray()[0];
                    });
                  }
  
                }
              })
  
            }
          })
        })



      });


    }
    else{
      this.router.navigateByUrl('/login');
    }


  }


  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = now.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  getCurrentHour() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
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

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,0,'','','','','','','','','','','',null);
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

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,0,'','','','','','','','','','','',null);
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
