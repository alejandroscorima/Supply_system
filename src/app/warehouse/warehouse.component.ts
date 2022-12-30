import { Component, ComponentFactoryResolver, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
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

import * as XLSX from 'xlsx';


@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class WarehouseComponent implements OnInit {

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

  destino_dir='';

  personal: User[]= [];

  empresas: string[] = ['SUN','VISION','GO','IMG','WARI'];
  monedas: string[] = ['SOLES','DOLARES AMERICANOS'];

  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  unidades=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  aux_dec=['','ONCE','DOCE','TRECE','CATORCE','QUINCE']

  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null);

  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null);

  listaOrd: OrdenItem[]= [];

  prefijoMoney='';
  moneyText='';

  dataSourceOrd: MatTableDataSource<OrdenItem>;
  selection = new SelectionModel<Item>(true, []);

  doc = new jsPDF();

  img = new Image();

  posTituloSala;

  igvActivated;

  igvSlideChecked: boolean;
  igvSlideDisabled: boolean;

  docname;

  dataSourceWarehouse: MatTableDataSource<any>;

  items_ord_wh: any[] = [];


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
  ) { }

  updateIgv(){
    if(this.igvActivated){
      this.igvSlideDisabled=false;
      if(this.igvSlideChecked){
        this.ord.subtotal=(0.0).toFixed(2);
        this.ord.igv=(0.0).toFixed(2);
        this.ord.total=(0.0).toFixed(2);
        this.listaOrd.forEach((oi:OrdenItem)=>{
          oi.unit_price_aux=oi.unit_price;
          oi.unit_price=((100*parseFloat(oi.unit_price))/118).toFixed(2);
          oi.subtotal=(oi.cantidad*parseFloat(oi.unit_price)).toFixed(2);
          this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(2);
          this.ord.igv=(parseFloat(this.ord.igv)+(oi.cantidad*(parseFloat(oi.unit_price_aux)-parseFloat(oi.unit_price)))).toFixed(2);
        })
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
      }
      else{
        this.ord.subtotal=(0.0).toFixed(2);
        this.ord.igv=(0.0).toFixed(2);
        this.ord.total=(0.0).toFixed(2);
        this.listaOrd.forEach((oi:OrdenItem)=>{
          oi.unit_price=oi.unit_price_aux;
          oi.subtotal=(oi.cantidad*parseFloat(oi.unit_price)).toFixed(2);
          this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(2);
        })
        this.ord.igv=((18*parseFloat(this.ord.subtotal))/100).toFixed(2);
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
      }
    }
    else{
      this.igvSlideChecked=false;
      this.igvSlideDisabled=true;
      this.ord.igv=(0.0).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
    }
  }


  onFileChange(event: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });



      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];











      /* save data */
      const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}

      console.log(data); // Data will be logged in array format containing objects

      data.splice(0,7);
      data.splice(data.length-1,1);

      var row_aux = [];
      var arr_aux = [];

      data.forEach(d=>{
        row_aux=[];
        row_aux.push(Object.values(d)[0]);
        row_aux.push(Object.values(d)[1]);
        row_aux.push(Object.values(d)[2]);
        row_aux.push(Object.values(d)[3]);
        arr_aux.push(row_aux);
        console.log(arr_aux);
      })

      console.log(arr_aux);


      this.items_ord_wh=arr_aux;

      this.dataSourceWarehouse = new MatTableDataSource(this.items_ord_wh);

      console.log(this.items_ord_wh);
    };
  }

  change(e){
    console.log(e);
    if(e.checked){
      this.igvSlideChecked=true;
    }
    if(!e.checked){
      this.igvSlideChecked=false;
    }
    console.log(this.igvSlideChecked);

    this.updateIgv();

  }


  searchItem(){

  }

  onFileChanged(event) {
    const file = event.target.files[0]
  }

  onUpload() {
    // upload code goes here
  }

  addItem(){
    if(this.orden_item.cantidad!=null&&this.orden_item.descripcion!=''&&this.orden_item.unit_price!=''){
      this.orden_item.descripcion=this.orden_item.descripcion.toUpperCase();
      this.orden_item.unit_price=parseFloat(this.orden_item.unit_price).toFixed(2);
      this.orden_item.unit_price_aux=this.orden_item.unit_price;
      this.orden_item.subtotal=(this.orden_item.cantidad*parseFloat(this.orden_item.unit_price)).toFixed(2);
      this.listaOrd.push(this.orden_item);
      this.ord.subtotal='0.0';
      this.listaOrd.forEach((oi:OrdenItem)=>{
        this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(2);
      })
      this.ord.igv=(parseFloat(this.ord.subtotal)*0.18).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
      this.orden_item = new OrdenItem('',null,'','','','');
      this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
      this.dataSourceOrd.paginator = this.paginator.toArray()[0];
      this.dataSourceOrd.sort = this.sort.toArray()[0];
    }
    else{
      this.toastr.warning('Completa correctamente el item!');
    }
  }

  deleteItem(indice){
      this.listaOrd.splice(indice,1);
      this.ord.subtotal='0.0';
      this.listaOrd.forEach((oi:OrdenItem)=>{
      this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(2);
      })
      this.ord.igv=(parseFloat(this.ord.subtotal)*0.18).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
      this.orden_item = new OrdenItem('',null,'','','','');
      this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
      this.dataSourceOrd.paginator = this.paginator.toArray()[0];
      this.dataSourceOrd.sort = this.sort.toArray()[0];
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

    this.ord.fecha=anio+'-'+mes+'-'+dia;

  }

  priorityChange(){

  }


  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceOrd.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceOrd.paginator) {
      this.dataSourceOrd.paginator.firstPage();
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
                      this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','');
                      this.orden_item=new OrdenItem('',null,'','','','');
                      this.igvActivated=true;
                      this.igvSlideDisabled=false;
                      this.prefijoMoney='';
                      this.ord.moneda='SOLES';
                      this.prefijoMoney='S/.';
                      this.ord.subtotal=parseInt('0').toFixed(2);
                      this.ord.igv=parseInt('0').toFixed(2);
                      this.ord.total=parseInt('0').toFixed(2);
                      this.ord.rebajado='';
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

                      this.ord.fecha=anio+'-'+mes+'-'+dia;
                      console.log(this.ord.empresa);
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


  asigChange(){
    this.logisticaService.getSalaByName(this.ord.destino).subscribe((res:Campus)=>{
      this.ord.destino_dir=res.address;
      this.ord.empresa=res.company;
      this.ord.numero=res.supply_ord_suffix;
      console.log(this.ord.empresa);
    })
  }

  changeRuc(){
    if(this.ord.ruc.length==11){
      this.toastr.info('Consultando RUC');
      this.logisticaService.getConsultaRUC(this.ord.ruc).subscribe(res=>{
        if(res){
          this.toastr.success('Datos obtenidos correctamente');
          this.ord.razon_social=res['data']['nombre_o_razon_social'];
          this.ord.direccion=res['data']['direccion_completa'];
        }
        else{
          this.toastr.warning('No se obtuvieron datos');
          this.ord.razon_social='';
          this.ord.direccion='';
        }
      })
    }

  }

  changeRazSoc(){
/*     if(this.ord.razon_social.length>=7){
      this.logisticaService.getProveedorByRazSoc(this.ord.razon_social).subscribe((res:Proveedor)=>{
        if(res){
          this.ord.ruc=res.ruc
          this.ord.razon_social=res.razon_social;
          this.ord.direccion=res.direccion;
        }
        else{
          this.ord.ruc='';
          this.ord.direccion='';
        }
      })
    } */

  }

  changeCant(i){
    this.ord.ordItems[i].subtotal=(this.ord.ordItems[i].cantidad*parseFloat(this.ord.ordItems[i].unit_price)).toFixed(2);
    this.ord.subtotal='0';
    this.ord.ordItems.forEach(l=>{
      this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(l.subtotal)).toFixed(2);
    })
    this.ord.igv=((18*parseFloat(this.ord.subtotal))/100).toFixed(2);
    this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
  }

  changePU(i){
    this.ord.ordItems[i].subtotal=(this.ord.ordItems[i].cantidad*parseFloat(this.ord.ordItems[i].unit_price)).toFixed(2);
    this.ord.subtotal='0';
    this.ord.ordItems.forEach(l=>{
      this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(l.subtotal)).toFixed(2);
    })
    this.ord.igv=((18*parseFloat(this.ord.subtotal))/100).toFixed(2);
    this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
  }

  asigMoneyChange(){
    if(this.ord.moneda=='SOLES'){
      this.prefijoMoney='S/.'
    }
    if(this.ord.moneda=='DOLARES AMERICANOS'){
      this.prefijoMoney='$'
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

  generarOrden(){
    this.ord.area=this.user_area.name;
    if(this.ord.rebajado==''){
      this.ord.rebajado=(0.0).toFixed(2);
    }
    else{
      this.ord.rebajado=parseFloat(this.ord.rebajado).toFixed(2);
    }

    this.ord.razon_social=this.ord.razon_social.toUpperCase();
    this.ord.direccion=this.ord.direccion.toUpperCase();
    this.logisticaService.getLastOrdCode(this.ord.numero,this.ord.destino,this.ord.empresa).subscribe(resi=>{
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
        this.ord.numero=codeArray[0]+'-'+numeracionStr;
      }
      else{
        this.ord.numero+='-0001';
      }



      if(this.ord.moneda!=''&&this.ord.empresa!=''&&this.ord.ruc!=''&&this.ord.razon_social!=''&&this.ord.direccion!=''&&this.ord.destino!=''&&this.ord.rebajado!=''&&this.ord.fecha!=''){


        this.moneyText=this.numToText9Cifras(parseInt(this.ord.total))+' CON '+String(Math.ceil((parseFloat(this.ord.total)*100.0)%100))+'/100 ' + this.ord.moneda;



  /*       this.logisticaService.getLastOrdCode(this.ord.destino).subscribe(resp=>{

        }) */

        this.logisticaService.addOrd(this.ord).subscribe(resAddOrd=>{
          console.log(resAddOrd);
          if(resAddOrd['session_id']){

            this.listaOrd.forEach((p:OrdenItem,ind)=>{
              p.ord_codigo=resAddOrd['session_id'];

              this.logisticaService.addOrdDet(p).subscribe(resAddOrdDet=>{
                if(ind==this.listaOrd.length-1){
                  this.generatePDF();

                  var anio = this.fecha.getFullYear();
                  var mes = this.fecha.getMonth()+1;
                  var dia = this.fecha.getDate();

                  if(mes<10){
                    mes='0'+mes;
                  }
                  if(dia<10){
                    dia='0'+dia;
                  }

                  this.ord.fecha=anio+'-'+mes+'-'+dia;

                  this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','');
                  this.orden_item=new OrdenItem('',null,'','','','');
                  this.listaOrd=[];
                  this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
                  this.dataSourceOrd.paginator = this.paginator.toArray()[0];
                  this.dataSourceOrd.sort = this.sort.toArray()[0];
                  this.igvActivated=true;
                  this.prefijoMoney='';
                  this.ord.moneda='SOLES';
                  this.prefijoMoney='S/.';
                  this.ord.subtotal=parseInt('0').toFixed(2);
                  this.ord.igv=parseInt('0').toFixed(2);
                  this.ord.total=parseInt('0').toFixed(2);
                  this.ord.rebajado='';
                  this.posTituloSala = 74;

                }
              });
            })
          }
          else{}
        })
      }
      else{
        this.toastr.warning('Rellena todos los campos');
      }
    })


  }

  generatePDF(){

    this.doc = new jsPDF();


    this.img.src = 'assets/logo'+this.ord.empresa+'.png';

    this.doc.addImage(this.img, 'png', 10, 10, 40, 40, '','FAST',0);
    this.doc.setFont("helvetica","bold");
    this.doc.setFontSize(18);
    this.doc.text('ORDEN DE '+ this.ord.tipo,105,35,{align:'center'});
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(14);
    this.doc.text(this.ord.destino,105,42,{align:'center'});
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(8);
    this.doc.text(this.ord.destino_dir,105,50,{align:'center'});
    this.doc.roundedRect(65, 25, 80, 20, 2, 2, 'S');
    this.doc.rect(150, 28, 50, 14);
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(183,18,18);
    this.doc.text('ORDEN DE '+ this.ord.tipo,175,33,{align:'center'});
    // this.doc.text('Nº '+ this.ord.numero,175-(((9+this.ord.numero.length)/2)*3),39);
    this.doc.text('Nº '+this.ord.numero,175,39,{align:'center'});
    this.doc.setTextColor(0,0,0);
    this.doc.text('RUC',15,65);
    this.doc.text(': '+this.ord.ruc,45,65);
    this.doc.text('PROVEEDOR',15,72);
    this.doc.text(': '+this.ord.razon_social,45,72);
    this.doc.text('DIRECCION',15,79);
    this.doc.setFontSize(9);
    this.doc.text(': '+this.ord.direccion,45,79);
    this.doc.setFontSize(9);
    this.doc.roundedRect(10, 89, 190, 14, 4, 4, 'S');
    this.doc.line(10, 96, 200, 96, 'S');
    this.doc.setFont("helvetica","bold");
    this.doc.text('CONDICIONES DE PAGO',40,94,{align:'center'});
    this.doc.text('LUGAR DESTINO',105,94,{align:'center'});
    this.doc.text('FECHA COMPRA',165,94,{align:'center'});
    this.doc.setFont("helvetica","normal");

    this.doc.text('CONTADO',40,101,{align:'center'});
    this.doc.text(this.ord.destino,105,101,{align:'center'});
    this.doc.text(this.ord.fecha,165,101,{align:'center'});

    this.doc.line(10, 113, 200, 113, 'S');
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica","bold");
    this.doc.text('CANTIDAD',24,118,{align:'center'});
    this.doc.text('DESCRIPCION',90,118,{align:'center'});
    this.doc.text('PRECIO UNIT.',156,118,{align:'center'});
    this.doc.text('SUBTOTAL',187,118,{align:'center'});
    this.doc.setFont("helvetica","normal");
    var pos_line=113;
    var pos_item=pos_line+5;
    this.listaOrd.forEach(m=>{
      pos_line+=7;
      pos_item+=7;
      this.doc.line(10, pos_line, 200, pos_line, 'S');
      this.doc.text(String(m.cantidad),24,pos_item,{align:'center'});
      //this.doc.text(m.descripcion,40,pos_item);
      this.doc.text(m.unit_price,156,pos_item,{align:'center'});
      this.doc.text(m.subtotal,187,pos_item,{align:'center'});
      this.doc.setFontSize(8);
      if(m.descripcion.length<=50){
        this.doc.text(m.descripcion,40,pos_item);
      }
      else{
        if(m.descripcion.length<=100){
          this.doc.text(m.descripcion.substring(0,50),40,pos_item);
          pos_line+=7;
          pos_item+=7;
          this.doc.text(m.descripcion.substring(50,m.descripcion.length),40,pos_item);
        }
        else{
          if(m.descripcion.length<=150){
            this.doc.text(m.descripcion.substring(0,50),40,pos_item);
            pos_line+=7;
            pos_item+=7;
            this.doc.text(m.descripcion.substring(50,100),40,pos_item);
            pos_line+=7;
            pos_item+=7;
            this.doc.text(m.descripcion.substring(100,m.descripcion.length),40,pos_item);

          }
        }
      }
    })
    pos_line+=7;
    this.doc.line(10, pos_line, 200, pos_line, 'S');
    this.doc.line(10, 113, 10, pos_line, 'S');
    this.doc.line(38, 113, 38, pos_line, 'S');
    this.doc.line(140, 113, 140, pos_line, 'S');
    this.doc.line(174, 113, 174, pos_line, 'S');
    this.doc.line(200, 113, 200, pos_line, 'S');
    pos_line+=10;
    this.doc.setFontSize(8);
    this.doc.setTextColor(183,18,18);
    this.doc.text('SON: '+this.moneyText,15,pos_line);
    pos_line+=9;
    this.doc.setFontSize(8);
    this.doc.setTextColor(0,0,0);
    this.doc.roundedRect(140, pos_line, 60, 21, 2, 2, 'S');
    this.doc.text('SUBTOTAL',142,pos_line+5);
    this.doc.text('IGV',142,pos_line+12);
    this.doc.text('MONTO INICIAL: '+this.prefijoMoney+' '+this.ord.rebajado,20,pos_line+19);
    this.doc.text('TOTAL',142,pos_line+19);
    this.doc.text(this.prefijoMoney,166,pos_line+5);
    this.doc.text(this.prefijoMoney,166,pos_line+12);
    this.doc.text(this.prefijoMoney,166,pos_line+19);
    this.doc.text(this.ord.subtotal,197,pos_line+5,{align:'right'});
    this.doc.text(this.ord.igv,197,pos_line+12,{align:'right'});
    this.doc.text(this.ord.total,197,pos_line+19,{align:'right'});
    //console.log(this.doc.internal.getFontSize());

/*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */


    window.open(URL.createObjectURL(this.doc.output("blob")));


/*     if(true){

        this.doc = new jsPDF();


        //this.doc.clear

        this.img.src = 'assets/logoVision.png'
        this.doc.addImage(this.img, 'png', 10, 10, 60, 25);
        this.doc.setFont("times","bold");
        this.doc.setFontSize(22);
        this.doc.text(this.tituloSala,this.posTituloSala,40);
        this.doc.setFont("helvetica");
        this.doc.setFontSize(16);
        this.doc.text('CASINO',91,48);
        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(12);
        this.doc.text(this.direccionSala,105-((this.direccionSala.length/2)*2),56);
        this.doc.setFont("helvetica","bold");
        this.doc.setFontSize(18);
        this.doc.text('ACTA DE ENTREGA DE PREMIO',55,70);
        this.doc.setFont("helvetica","bold");

        this.doc.setFontSize(11);
        this.doc.text('Señor(a)',20,90);
        this.doc.text('D.N.I.',20,100);
        this.doc.text('Dirección',20,110);
        this.doc.text('Fecha',20,130);
        this.doc.text('Hora de sorteo',20,140);
        this.doc.text('Premio sorteado',20,150);
        this.doc.text('Nombre de sorteo',20,160);
        this.doc.text('Número de cupón',20,170);

        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(10);
        this.doc.text(':  '+this.nombreSorteo,53,90);
        this.doc.text(':  '+this.doc_number,53,100);
        this.doc.setFontSize(8);
        this.doc.setCharSpace(10);
        this.doc.text(':  '+this.direccionSorteo,53,110);
        this.doc.text('   '+this.direccionSorteo2,53,120);
        this.doc.setFontSize(10);
        this.doc.text(':  '+this.fechaLongSorteo,53,130);
        this.doc.text(':  '+this.horaLongSorteo,53,140);
        this.doc.text(':  '+this.premioLongSorteo + ' CON 00/100 SOLES    |   S/'+this.premioSorteo,53,150);
        this.doc.text(':  '+this.nombreDeSorteo,53,160);
        this.doc.text(':  '+this.cupon_number,53,170);

        this.doc.setFont("helvetica","bold");
        this.doc.setFontSize(15);
        this.doc.text('_________________________',25,200);
        this.doc.text('_________________________',110,200);
        this.doc.text('_________________________',50,250);
        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(9);
        this.doc.text(this.nombreSorteo,85-1.9*(this.nombreSorteo.length/2),258);
        this.doc.setFont("helvetica","bold");
        this.doc.setFontSize(12);
        this.doc.text(this.doc_number,85-2.5*(this.doc_number.length/2),263);
        this.doc.text('Cliente',77,269);

        this.doc.rect(130,240,28,35);


        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(9);
        this.doc.text(this.admin_nombre,60-1.9*(this.admin_nombre.length/2),208);
        this.doc.setFont("helvetica","bold");
        this.doc.setFontSize(12);
        this.doc.text(this.admin_doc,60-2.5*(this.admin_doc.length/2),213);
        this.doc.text('Administrador(a)',42,219);


        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(9);
        this.doc.text(this.adj_nombre,146-1.9*(this.adj_nombre.length/2),208);
        this.doc.setFont("helvetica","bold");
        this.doc.setFontSize(12);
        this.doc.text(this.adj_doc,146-2.5*(this.adj_doc.length/2),213);
        this.doc.text('Adjunto(a)',135,219);

        this.toastr.success('Acta generada correctamente!','',{progressBar:true});

        window.open(URL.createObjectURL(this.doc.output("blob")));

        this.router.navigate(['']);

    }

    else{
      this.toastr.warning('Por favor, verifique que todos los campos estén completados');
    } */
  }

  onNoClick(): void {
  }




}


