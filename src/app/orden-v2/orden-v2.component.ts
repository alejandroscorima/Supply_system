import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ClientesService } from "../clientes.service"
import { User } from "../user"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
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
import { FileUploadService } from '../file-upload.service';
import { runInThisContext } from 'vm';
import { element } from 'protractor';
import { FondoItem } from '../fondo_item';
import { Doc } from '../doc';
import { Collaborator } from '../collaborator';

import * as XLSX from 'xlsx';
import { Signature } from '../signature';
import { FLAGS } from 'html2canvas/dist/types/dom/element-container';
import { initFlowbite } from 'flowbite';
import { OrdersValidation } from '../order_validation';
import { OrdersValidationRules } from '../order_validation _rules';
import { get } from 'http';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DialogAddReceipt, DialogConfirmOrden, DialogEditReceipt, DialogNewDoc, DialogShowDocs } from '../orden/orden.component';
import { Folder } from '../folder';
import { Filep } from '../file';
import { EMPTY } from 'rxjs';
import { PushNotificationService } from '../push-notification.service';


@Component({
  selector: 'app-nuevo',
  templateUrl: './orden-v2.component.html',
  styleUrls: ['./orden-v2.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('myAnimation', [
      transition('* => active', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition('active => *', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateX(-100%)', opacity: 0 })),
      ]),
    ]),


  ],
})
export class OrdenV2Component implements OnInit, AfterViewInit {

  appFirebase;
  analyticsFirebase;

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');
  campusToView: Campus = new Campus('','','','','','');
  ordenCampus: Campus = new Campus('','','','','','');
  ordenCampusView: Campus = new Campus('','','','','','');

  allCampus: Campus[]=[];


  user_id: number = 0;
  user_role: string = '';

  campus = [];

  signature :Signature = new Signature(0,'');

  areas = [];
  prioridades = [];

  fileUploaded: File = null;



  docname;


  //fecha;
  anio;
  mes;
  dia;

  actualProvider:Proveedor=new Proveedor('','','','','','');
  listaProviders: Proveedor[]= [];
 
  listOrd: OrdenItem[]= [];

  items_ord_wh: any[] = [];


  types=['COMPRA','SERVICIO'];
  actualType:string;


  

  pay_type=['EFECTIVO','TRANSFERENCIA','CREDITO 30 DIAS','CREDITO 45 DIAS'];



  destino_dir='';


  monedas: string[] = ['SOLES','DOLARES AMERICANOS'];
  actualMoneda



  personal: User[]= [];

  empresas: string[] = ['SUN','VISION','GO','IMG','WARI'];
  destiny: string;

  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  unidades=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  aux_dec=['','ONCE','DOCE','TRECE','CATORCE','QUINCE']

  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,'','','','','','',0,'18','NO','NO','OFICINA','');



  
  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);



  listaOrd: OrdenItem[]= [];

  prefijoMoney='';
  moneyText='';

  dataSourceOrd: MatTableDataSource<OrdenItem>;
  selection = new SelectionModel<Item>(true, []);

  selectionTxt = new SelectionModel<Orden>(true, []);

  doc = new jsPDF();

  img = new Image();
  sello = new Image();




  posTituloSala;

  igvActivated;

  descActivated;

  retencionActivated;
  percepcionActivated;

  igvSlideChecked: boolean;
  igvSlideDisabled: boolean;

  descSlideChecked: boolean;
  descSlideDisabled: boolean;

  retencionSlideChecked: boolean;
  retencionSlideDisabled: boolean;

  percepInput;

  //View orders----------------------------------

  campusView: Campus[] = [];
  areasView: Area[] = [];
  prioridadesView = [];

  fechaView;
  anioView;
  mesView;
  diaView;

  imgView = new Image();

  areaView;
  salaView;

  userView: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colabView: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  area_chiefView='';
  user_areaView: Area = new Area('',null);
  user_campusView: Campus = new Campus('','','','','','');

  reqView: Requerimiento = new Requerimiento('','','','','','','',[],0,'PENDIENTE',null);
  ordView: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,null,null,null,null,null,null,'','NO','NO','OFICINA','');

  itemView: Item = new Item('',null,'','COMPRA','PENDIENTE','',null,0,'','','','','','','','','','','',null);


  ordersPendingFolder:Orden[] = [];
  ordersSentFolder: Orden[] = [];
  listaOrdChangeStep: Orden[] = [];

  listaOrdView: OrdenItem[]= [];

  ordersPendingFolderFiltered:Orden[] = [];
  ordersPendingFolderDisplayed:Orden[] = [];

  ordersPendingFolderPageSize = 10;
  ordersPendingFolderCurrentPage = 1;
  ordersPendingFolderTotalPages = 1;
  ordersPendingFolderFilterValue = '';

  ordersSentFolderFiltered:Orden[] = [];
  ordersSentFolderDisplayed:Orden[] = [];

  ordersSentFolderPageSize = 10;
  ordersSentFolderCurrentPage = 1;
  ordersSentFolderTotalPages = 1;
  ordersSentFolderFilterValue = '';

  dataSourceOrdersView: MatTableDataSource<Orden>;
  dataSourceOrdersPendant: MatTableDataSource<Orden>;
  //dataSourceOrdersViewAproved: MatTableDataSource<Orden>;

  docView = new jsPDF();

  previewView: any='';
  moneyTextView='';
  prefijoMoneyView='';

  receipt: FondoItem;
  fechaRegister;

  dateTemp;

  txtFileName;
  txtFileUrl;

  public demo1TabIndex = 1;

  columnsToShow=[];
  columnsToShowTb2=[];

  //VALIDATE orden

  campusToValidate:Campus;
  ordValRules:OrdersValidationRules[]= [];


  validationsOrd:OrdersValidation[]= [];



  ordValidationToPost:OrdersValidation;

  isAccepting:string = '';
  toValidateOrder:Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,'','','','','','',0,'18','NO','NO','OFICINA','');


  ///SAVE FILES TO FOLDER:
  docToPost: Doc= new Doc('','','',0)
  fileToPost: Filep;
  folderPostedId:number;

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
    private pushService: PushNotificationService
  ) { }


/////Block
  setActualType(event: any) {
    const selectedValue = event.target.value;

    switch (selectedValue) {
      case selectedValue:


        this.actualType=selectedValue;
        this.ord.tipo=selectedValue;
        console.log(this.ord.tipo);
         break;

  /*     case "SERVICIO":
        this.actualType="SERVICIO";
        this.ord.tipo="SERVICIO";
        console.log(this.ord.tipo);
        break;
     */
      default:
        // Default logic
        break;
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

  ordersPendingFolderViewChangePage(page: number) {
    this.ordersPendingFolderCurrentPage = page;
    this.ordersPendingFolderViewUpdateTable();
  }

  ordersPendingFolderViewUpdateTable() {
    const start = (this.ordersPendingFolderCurrentPage - 1) * this.ordersPendingFolderPageSize;
    const end = start + this.ordersPendingFolderPageSize;

    if(this.ordersPendingFolderFilterValue!=''){
      this.ordersPendingFolderFilterValue = this.ordersPendingFolderFilterValue.trim().toLowerCase();
      // Filtrar el array de datos
      this.ordersPendingFolderFiltered = this.ordersPendingFolder.filter(item => {
        if(true){
          return (
            item.status.toLowerCase().includes(this.ordersPendingFolderFilterValue) ||
            item.fecha.toLowerCase().includes(this.ordersPendingFolderFilterValue) ||
            item.numero.toLowerCase().includes(this.ordersPendingFolderFilterValue) ||
            item.empresa.toLowerCase().includes(this.ordersPendingFolderFilterValue) ||
            item.destino.toLowerCase().includes(this.ordersPendingFolderFilterValue) ||
            item.ruc.toLowerCase().includes(this.ordersPendingFolderFilterValue) ||
            item.total.toLowerCase().includes(this.ordersPendingFolderFilterValue) ||
            item.rebajado.toLowerCase().includes(this.ordersPendingFolderFilterValue) 
          );
        }
        else{
/*           return (
            item.fecha.toLowerCase().includes(this.ordersPendantViewFilterValue) ||
            item.campus.toLowerCase().includes(this.ordersPendantViewFilterValue) ||
            item.numero.toLowerCase().includes(this.ordersPendantViewFilterValue) ||
            item.importe.toLowerCase().includes(this.ordersPendantViewFilterValue) ||
            item.personal.toLowerCase().includes(this.ordersPendantViewFilterValue)
          ); */
        }
      })

    }
    else{
      this.ordersPendingFolderFiltered=this.ordersPendingFolder;
    }

    this.ordersPendingFolderTotalPages = Math.ceil(this.ordersPendingFolderFiltered.length / this.ordersPendingFolderPageSize);

    this.ordersPendingFolderDisplayed=this.ordersPendingFolderFiltered.slice(start,end);
  }


  ordersSentFolderViewChangePage(page: number) {
    this.ordersSentFolderCurrentPage = page;
    this.ordersSentFolderViewUpdateTable();
  }
  
  ordersSentFolderViewUpdateTable() {
    const start = (this.ordersSentFolderCurrentPage - 1) * this.ordersSentFolderPageSize;
    const end = start + this.ordersSentFolderPageSize;
  
    if (this.ordersSentFolderFilterValue != '') {
      this.ordersSentFolderFilterValue = this.ordersSentFolderFilterValue.trim().toLowerCase();
      // Filtrar el array de datos
      this.ordersSentFolderFiltered = this.ordersSentFolder.filter(item => {
        if (true) {
          return (
            item.step_status.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.status.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.fecha.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.numero.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.empresa.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.destino.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.ruc.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.total.toLowerCase().includes(this.ordersSentFolderFilterValue) ||
            item.rebajado.toLowerCase().includes(this.ordersSentFolderFilterValue)
          );
        } else {
          /* return (
            item.fecha.toLowerCase().includes(this.ordersSentViewFilterValue) ||
            item.campus.toLowerCase().includes(this.ordersSentViewFilterValue) ||
            item.numero.toLowerCase().includes(this.ordersSentViewFilterValue) ||
            item.importe.toLowerCase().includes(this.ordersSentViewFilterValue) ||
            item.personal.toLowerCase().includes(this.ordersSentViewFilterValue)
          ); */
        }
      });
    } else {
      this.ordersSentFolderFiltered = this.ordersSentFolder;
    }
  
    this.ordersSentFolderTotalPages = Math.ceil(this.ordersSentFolderFiltered.length / this.ordersSentFolderPageSize);
  
    this.ordersSentFolderDisplayed = this.ordersSentFolderFiltered.slice(start, end);
  }
  

  setCondicion(event: any) {

    
      const selectedValue = event.target.value;
      ;
      switch (selectedValue) {
        case selectedValue:

        //this.destiny=selectedValue;
        this.ord.tipo_pago=selectedValue;
          console.log(this.ord.tipo_pago);
          break;

        default:
          break;
      }
      this.asigChange()
    }
  //block//

  setMoneda(event: any) {

    
      const selectedValue = event.target.value;
      ;
      switch (selectedValue) {
        case selectedValue:

        this.actualMoneda=selectedValue;
        this.ord.moneda=selectedValue;
          console.log(this.ord.moneda);
          break;

        default:
          break;
      }
      this.  asigMoneyChange();
      
    }
  // setDestiny(event: any) {

    
  //     const selectedValue = event.target.value;
  //     ;
  //     switch (selectedValue) {
  //       case selectedValue:

  //       this.destiny=selectedValue;
  //       this.ord.destino=selectedValue;
  //         console.log(this.ord.destino);
  //         break;

  //       default:
  //         break;
  //     }
  //     this.asigChange()
  //   }

  increaseQuantityButton(){
    this.orden_item.cantidad++;
    console.log('increase',this.orden_item.cantidad);


  }
  decreaseQuantityButton(){
    if( this.orden_item!=null&& this.orden_item.cantidad>1)
    this.orden_item.cantidad--;

    
    console.log('decrease',this.orden_item.cantidad);
  }
  updateIgv(){
    if(this.igvActivated){
      this.igvSlideDisabled=false;
      if(this.igvSlideChecked){
        this.ord.subtotal=(0.0).toFixed(5);
        this.ord.igv=(0.0).toFixed(5);
        this.ord.total=(0.0).toFixed(2);
        this.listaOrd.forEach((oi:OrdenItem)=>{
          oi.unit_price_aux=oi.unit_price;
          oi.igv_unit_aux=oi.igv_unit;
          if(oi.igv_toggle){
            oi.unit_price=((100*parseFloat(oi.unit_price))/(100+parseFloat(this.ord.igv_percent))).toFixed(5);
            oi.igv_unit=(oi.cantidad*(parseFloat(oi.unit_price_aux)-parseFloat(oi.unit_price))).toFixed(5);
          }
          else{
            oi.unit_price=(parseFloat(oi.unit_price)).toFixed(5);
            oi.igv_unit=(0.0).toFixed(5);
          }
          oi.subtotal=(oi.cantidad*parseFloat(oi.unit_price)).toFixed(5);
          this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(5);
          this.ord.igv=(parseFloat(this.ord.igv)+(oi.cantidad*(parseFloat(oi.unit_price_aux)-parseFloat(oi.unit_price)))).toFixed(5);
        })
        ///ACA SE CONSIGUE LA SUMA TOTAL


        if((this.ord.descuento!=''&&this.ord.descuento!='0')&& this.descSlideChecked){
          this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.descuento)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
        }
        else{
          this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
        }

        ///



      }
      else{
        this.ord.subtotal=(0.0).toFixed(5);
        this.ord.igv=(0.0).toFixed(5);
        this.ord.total=(0.0).toFixed(2);
        this.ord.igv=(0.0).toFixed(5);
        this.listaOrd.forEach((oi:OrdenItem)=>{
          oi.unit_price=oi.unit_price_aux;
          oi.subtotal=(oi.cantidad*parseFloat(oi.unit_price)).toFixed(5);
          if(oi.igv_toggle){
            oi.igv_unit=((parseFloat(oi.subtotal)*parseFloat(this.ord.igv_percent))/100).toFixed(5);
          }
          else{
            oi.igv_unit=(0.0).toFixed(5);
          }
          this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(5);
          this.ord.igv=(parseFloat(this.ord.igv)+parseFloat(oi.igv_unit)).toFixed(5);
        })
        //this.ord.igv=((parseFloat(this.ord.igv_percent)*parseFloat(this.ord.subtotal))/100).toFixed(5);
        
        ///ACA SE CONSIGUE LA SUMA TOTAL


        if((this.ord.descuento!=''&&this.ord.descuento!='0')&& this.descSlideChecked){
          this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.descuento)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
        }
        else{
          this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
        }

        ///
      }
    }
    else{
      this.igvSlideChecked=false;
      this.igvSlideDisabled=true;
      this.ord.igv=(0.0).toFixed(5);
      ///ACA SE CONSIGUE LA SUMA TOTAL


      if((this.ord.descuento!=''&&this.ord.descuento!='0')&& this.descSlideChecked){
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.descuento)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
      }
      else{
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
      }

      ///
    }











  }

  updateRetencion(){
    
    if(this.retencionActivated){
      if(this.ord.retencion_percent==null||this.ord.retencion_percent==''){
        this.ord.retencion=(0.0).toFixed(5);
      }
      else{
        this.ord.retencion=((parseFloat(this.ord.retencion_percent)*parseFloat(this.ord.subtotal))/100).toFixed(5);
      }

      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    }
    else{
      this.ord.retencion=(0.0).toFixed(5);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    } 
  }

  updatePercepcion(){
    if(this.percepcionActivated){
      if(this.percepInput==null||this.percepInput==''){
        this.ord.percepcion=(0.0).toFixed(5);
      }
      else{
        this.ord.percepcion=(parseFloat(this.percepInput)).toFixed(5);
      }
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    }
    else{
      this.ord.percepcion=(0.0).toFixed(5);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)-parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    } 
  }

  changeIgv(){
    this.updateIgv();
  }

  changeRet(){
    this.updateRetencion();
  }

  changePercep(){
    this.updatePercepcion();
/*     this.ord.percepcion=(parseFloat(this.percepInput)).toFixed(2);
    this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2); */
  }

  changeIgvToggleUnit(a:OrdenItem){

    a.igv_toggle=!a.igv_toggle;

    console.log(a.igv_toggle);

    this.updateIgv();
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

  changedesc(e){
    console.log(e);
    if(e.checked){
      this.descSlideChecked=true;
    }
    if(!e.checked){
      this.descSlideChecked=false;
    }
    console.log(this.descSlideChecked);

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
      this.orden_item.unit_price=parseFloat(this.orden_item.unit_price).toFixed(5);
      this.orden_item.unit_price_aux=this.orden_item.unit_price;
      this.orden_item.igv_toggle=true;
      this.orden_item.subtotal=(this.orden_item.cantidad*parseFloat(this.orden_item.unit_price)).toFixed(5);
      this.orden_item.igv_unit=(parseFloat(this.orden_item.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
      this.listaOrd.push(this.orden_item);
      this.ord.subtotal='0.0';
      this.listaOrd.forEach((oi:OrdenItem)=>{
       this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(5);
      })
      this.ord.igv=(parseFloat(this.ord.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
      this.orden_item = new OrdenItem('',null,'','','','','',false,'','','',true);
      this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
      //this.dataSourceOrd.sort = this.sort.toArray()[0];
    }
    else{
      this.toastr.warning('Completa correctamente el item!');
    }
  }

  deleteItem(indice){
      this.listaOrd.splice(indice,1);
      this.ord.subtotal='0.0';
      this.listaOrd.forEach((oi:OrdenItem)=>{
      this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(5);
      })
      this.ord.igv=(parseFloat(this.ord.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
      this.orden_item = new OrdenItem('',null,'','','','','',false,'','','',true);
      this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
  }

  editItem(a:OrdenItem,i){

    console.log(a);
    this.orden_item.cantidad=a.cantidad;
    this.orden_item.descripcion=a.descripcion;
    this.orden_item.unit_price=a.unit_price;
    console.log(this.orden_item);
    this.listaOrd.splice(i,1);
    this.ord.subtotal='0.0';
    this.listaOrd.forEach((oi:OrdenItem)=>{
    this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(5);
    })
    this.ord.igv=(parseFloat(this.ord.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
    this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
    this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
  }

  
  dateChange(){

    //this.ord.fecha=anio+'-'+mes+'-'+dia;

  }

  priorityChange(){

  }


  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceOrd.filter = filterValue.trim().toLowerCase();

  }

  compareObjectsView(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.name === o2.name;
  }

//VALIDATE LOGIC
//
//
//

  viewStatusButton(a:Orden){
    document.getElementById('viewModalButton')?.click();
    this.logisticaService.getOrdersValidations(a.id).subscribe((resValsOrd:any)=>{
      this.validationsOrd= resValsOrd
    })
  }
  validateButton(a:Orden,comand: string){

   
    if(comand=='VALIDAR'){
      this.isAccepting='APROBADO'
    }
    if(comand=='RECHAZAR'){
      this.isAccepting='RECHAZADO'
    }
    this.ordValidationToPost = new OrdersValidation(a.val_user_id,a.val_order_id,'','','','',this.isAccepting,a.val_id)

    a.val_state=this.ordValidationToPost.state

   
    this.toValidateOrder=a;

 
    console.log("miau",comand,this.isAccepting)
    document.getElementById('PopUpButton')?.click();
    this.isAccepting=comand
  }
  
  changeStatus(statusChanger: string) {



  // LOGIDA DE VERIFICAR TODAS LAS VALIDACIONES PARA SETEAR ESTO:
/*     this.toValidateOrder.status=this.isAccepting;
    console.log(this.toValidateOrder.status) */
      this.logisticaService.updateOrderValidation(this.ordValidationToPost).subscribe((resVal:any)=>{
        console.log(resVal);
        if(resVal){
          this.toastr.success("Actualizado corretamente")
        }else{
          this.toastr.error("Algo malio sal")
        }



        this.logisticaService.getOrdersValidations(this.toValidateOrder.id).subscribe((resValsOrd:any)=>{
          this.validationsOrd=resValsOrd;
        var counter=0;
        var max_ord=this.validationsOrd.length;
        var acceptedCounter=0;
        var rejectedCounter=0;
        

        this.validationsOrd.forEach(element => {
          if(element.state!="PENDIENTE"){
            if(element.state=="APROBADO"){
              acceptedCounter++;
            }
            if(element.state=="RECHAZADO"){
              rejectedCounter++;
            }
            counter++;
          }
        });
        console.log("counter:",counter,"length:",max_ord)
        console.log("rejectedCounter:",rejectedCounter,"acceptedCounter:",acceptedCounter)
        if(counter==max_ord){
          ///VALIDADOR DEL ESTADO DE LA ORDEN:
          
            if(rejectedCounter==0){
              this.toValidateOrder.status="APROBADO";
            }
            if(acceptedCounter==0){
              this.toValidateOrder.status="RECHAZADO";
            }
            if(rejectedCounter>0&&acceptedCounter>0){
              this.toValidateOrder.status="CONFLICTO";
            }
    
            console.log(this.toValidateOrder.status);
          this.logisticaService.updateOrd(this.toValidateOrder).subscribe((res:any)=>{
            console.log(this.toValidateOrder);
            
            if(res){
              this.toastr.success("Actualizado corretamente")
            }else{
              this.toastr.error("Algo malio sal")
            }
          })
      
        }
    
        })
      


      });



  



}


  saveFiles( docToSave,ord_id){
    console.log(docToSave);
    if(docToSave){
      this.fileUploadService.uploadDoc(docToSave).subscribe(res=>{
        if(res){
          this.toastr.info('CARGADO CORRECTAMENTE')
          this.docToPost.url=res['filePath'];

          const currentDate = new Date();
          const day = currentDate.getDate().toString().padStart(2, '0');
          const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
          const year = currentDate.getFullYear().toString();
          const hours = currentDate.getHours().toString().padStart(2, '0');
          const minutes = currentDate.getMinutes().toString().padStart(2, '0');

          this.docToPost.date=`${day}-${month}-${year} ${hours}:${minutes}`;
          this.docToPost.name=docToSave.name;
          this.fileToPost=new Filep(
            this.docToPost.name,
            this.docToPost.url,
            'Descripción predeterminada', 
            'pdf', 
            this.docToPost.date,
            '00:00', 
            ord_id, 
            this.folderPostedId, 
          );
          this.postFilesToFoler(this.fileToPost,ord_id);
        }
        else{
          this.toastr.warning('Error al cargar archivo');
        }
      })
    }
    else{
      this.toastr.warning('No hay documento valido');
    }
  }

  postFilesToFoler(fileToPost:Filep,ord_id:number){
    if(this.folderPostedId!=null||this.folderPostedId!=0){
      fileToPost.folder_id = this.folderPostedId;
      console.log(fileToPost)
      this.logisticaService.addFile(fileToPost).subscribe((res:any)=>{
        console.log(res)
        /* this.logisticaService.addDoc(fileToPost.).subscribe((resDoc:any)=>{
          console.log(resDoc)
        }) */
      })
      this.updateAsociatedFilesFolderId(ord_id);

    }else{
      this.toastr.error('Ocurrió un error al agregar un file a Un FOLDER')
    }
  }

  updateAsociatedFilesFolderId(orden_id){
    var asociatedFiles: Filep[];
    this.logisticaService.getFilesByOrdenId(orden_id).subscribe((res:Filep[])=>{
      asociatedFiles = res
      console.log(asociatedFiles);
      console.log(res);

      asociatedFiles.forEach(element => {
        console.log(element)
        element.folder_id=(this.folderPostedId);
        console.log('folderId',this.folderPostedId)
        console.log(element)
        this.logisticaService.updateFile(element).subscribe((updateRes:any)=>{
          console.log(updateRes)
        });
      });
    
    })
    
  }



////
  initConfig(){
    //this.fecha= this.getCurrentDate();

    this.fechaRegister= this.getCurrentDate();

    const tabCount=2;
    this.demo1TabIndex = 0;

    if(this.cookiesService.checkToken('user_id')){
      this.user_id = parseInt(this.cookiesService.getToken('user_id'));
      this.user_role = this.cookiesService.getToken('user_role');
      console.log(this.user_role);
      if(this.user_role=='SUPER ADMINISTRADOR'){
        this.columnsToShow=['indicator','check','fecha','area','tipo','numero','empresa','destino','ruc','razon_social','tipo_pago','moneda','subtotal','igv','total','rebajado','retencion','percepcion','pdf','edit','receipt','comprobante','txt','docs','validar'];
        this.columnsToShowTb2=['indicator','fecha','area','tipo','numero','empresa','destino','ruc','razon_social','tipo_pago','moneda','subtotal','igv','total','rebajado','retencion','percepcion','pdf','edit','receipt','comprobante','txt','docs','validar'];
      
      }
      else if(this.user_role=='SUPERVISOR'){
        this.columnsToShowTb2=['indicator','fecha','empresa','destino','observacion','moneda','total','pdf','receipt','comprobante','docs','validar'];
        this.columnsToShow=[];
      }
      else{
        this.columnsToShow=['indicator','check','fecha','numero','empresa','destino','ruc','total','rebajado','pdf','edit','receipt','comprobante','txt','docs','validar'];
        this.columnsToShowTb2=['indicator','fecha','numero','empresa','destino','ruc','total','rebajado','pdf','edit','receipt','comprobante','txt','docs','validar'];
      }
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

                  this.campusToView= new Campus('NINGUNO','','','','','');
                  this.logisticaService.getAllCampus().subscribe((cs:Campus[])=>{

                    this.allCampus=cs;
                    console.log(this.allCampus);
                    this.logisticaService.getSignatureByUserId(this.user.user_id).subscribe((sig:Signature)=>{
                      this.signature=sig;
                      console.log('signature',this.signature)
                     // this.sello= this.signature.signature_url;
                    })

                    this.campus=cs;
                    this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','','','','','','',0,'18','NO','NO','OFICINA','');
                    this.orden_item=new OrdenItem('',null,'','','','','',false,'','','',true);
                    this.orden_item.cantidad=1;
                    this.igvActivated=true;
                    this.igvSlideDisabled=false;


                    this.descActivated=true;
                    this.descSlideDisabled=false;

                    this.prefijoMoney='';
                    this.ord.tipo='COMPRA'
                    
                    this.ord.moneda='SOLES';
                    this.ord.destino=this.campus[0]['name'];

                    console.log(this.ord.destino)

                    this.prefijoMoney='S/.';
                    this.ord.subtotal=parseInt('0').toFixed(5);
                    this.ord.igv=parseInt('0').toFixed(5);
                    this.ord.retencion=parseInt('0').toFixed(5);
                    this.ord.percepcion=parseInt('0').toFixed(5);
                    this.ord.total=parseInt('0').toFixed(2);
                    this.ord.rebajado='';
                    this.posTituloSala = 74;
  
                    this.ord.fecha=this.getCurrentDate();
                    console.log(this.ord.empresa);

                    if(this.cookiesService.checkToken('reqItems')){
                      this.ord.tipo=this.cookiesService.getToken('tipo');
                      console.log(this.cookiesService.getToken('destino'));
                      this.ord.destino=this.cookiesService.getToken('destino');
                      this.asigChange();
                      console.log(JSON.parse(this.cookiesService.getToken('reqItems')));
                      var its:Item[]=JSON.parse(this.cookiesService.getToken('reqItems'));
                      its.forEach((itel:Item)=>{
                        this.orden_item = new OrdenItem('',null,'','','','','',false,'','','',true);
                        this.orden_item.cantidad=itel.cantidad;
                        this.orden_item.descripcion=itel.descripcion.toUpperCase();
                        this.orden_item.unit_price=parseFloat('0.0').toFixed(5);
                        this.orden_item.unit_price_aux=this.orden_item.unit_price;
                        this.orden_item.igv_toggle=true;
                        this.orden_item.subtotal=(this.orden_item.cantidad*parseFloat(this.orden_item.unit_price)).toFixed(5);
                        this.orden_item.igv_unit=(parseFloat(this.orden_item.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
                        this.listaOrd.push(this.orden_item);
                        this.ord.subtotal='0.0';
                        this.listaOrd.forEach((oi:OrdenItem)=>{
                         this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(5);
                        })
                        this.ord.igv=(parseFloat(this.ord.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
                        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
                        this.orden_item = new OrdenItem('',null,'','','','','',false,'','','',true);
                        this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
                      })
                      this.cookiesService.deleteToken('reqItems');
                      this.cookiesService.deleteToken('destino');
                      this.cookiesService.deleteToken('tipo');
                    }
                    else{
                      console.log('No hay reqItems');
                    }


                  })
  
                  //vieworders
                  //this.fechaView=new Date();
                  //this.anioView=this.fechaView.getFullYear();
                  //this.mesView=this.fechaView.getMonth()+1;
                  //this.diaView=this.fechaView.getDate();
  
                  //if(this.mesView<10){
                  //  this.mesView='0'+this.mesView;
                  //}
                  //if(this.diaView<10){
                  //  this.diaView='0'+this.diaView;
                  //}
  
                  this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
                    if(as){
                      this.areasView=as;
                    }
                    this.logisticaService.getAllCampus().subscribe((ac:Campus[])=>{
                      if(ac){
                        this.campusView=ac;
                        this.campusView.unshift(new Campus('TODOS','','','','',''));
  
                      }

                      ///////////////////////////////CAMBIAR AL NUEVO PHP
                      // this.logisticaService.getAllOficinaOrders(this.user_id, this.user_role, this.campusToView.name).subscribe((resOrds:Orden[])=>{
                      //   console.log(resOrds);
                      //   console.log(this.listaOrdersView);
                      //   this.listaOrdersView=resOrds;
                      //   console.log(this.listaOrdersView);
                      //   this.dataSourceOrdersView = new MatTableDataSource(this.listaOrdersView);
                      //   this.dataSourceOrdersView.paginator = this.paginator.toArray()[1];
                      //   this.dataSourceOrdersView.sort = this.sort.toArray()[1];
                      // })
                      //if(this.user_role=='SUPER ADMINISTRADOR'){
                        if(true){
                        this.logisticaService.getOrdersbyStepStatusAddFolderId(this.user_id, this.user_role, 'TODOS','PENDIENTE',1).subscribe((resOrdPend:Orden[])=>{
                          console.log(resOrdPend);
                          console.log(this.ordersPendingFolder);
                          this.ordersPendingFolder=resOrdPend;
                          this.ordersPendingFolderFiltered=this.ordersPendingFolder;
                          this.ordersPendingFolderViewUpdateTable();
                          console.log(this.ordersPendingFolder);
                          this.dataSourceOrdersPendant = new MatTableDataSource(this.ordersPendingFolder);
                          this.dataSourceOrdersPendant.paginator = this.paginator.toArray()[0];
                          this.dataSourceOrdersPendant.sort = this.sort.toArray()[0];
                        })
                      }
                    })
                  })

  
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


  ngOnInit() {
    this.initConfig();
  }

  ngAfterViewInit() {
    initFlowbite();
  }


  asigChange(){
    this.logisticaService.getSalaByName(this.ord.destino).subscribe((res:Campus)=>{
      this.ordenCampus=res;
      this.ord.destino_dir=res.address;
      this.ord.empresa=res.company;
      this.ord.numero=res.supply_ord_suffix;
      console.log(this.ord.empresa);
    })
  }

  changeDestinoView(){
    this.logisticaService.getOrdersbyStepStatusAddFolderId(this.user_id, this.user_role, this.campusToView.name,'TODOS',2).subscribe((resOrds:Orden[])=>{
      console.log(resOrds);
      console.log(this.ordersSentFolder);
      this.ordersSentFolder=resOrds;
      console.log(this.ordersSentFolder);
      this.ordersSentFolderFiltered=this.ordersSentFolder;
      this.ordersSentFolderViewUpdateTable();
      this.dataSourceOrdersView = new MatTableDataSource(this.ordersSentFolder);
      this.dataSourceOrdersView.paginator = this.paginator.toArray()[0];
      this.dataSourceOrdersView.sort = this.sort.toArray()[0];
    })
  }

  changeRuc(){
    if(this.ord.ruc.length==11){
      this.toastr.info('Consultando RUC En Base de datos');
      this.logisticaService.getProveedorByRuc(this.ord.ruc).subscribe((provl:Proveedor)=>{
        if(provl){
          console.log(provl);
          this.toastr.success('Datos obtenidos correctamente');
          this.actualProvider=provl;
          this.ord.razon_social=provl.razon_social
          this.ord.direccion=provl.direccion
          this.ord.num_cuenta=provl.cci;
          this.actualProvider=provl;
          return;
        
        }else{
            this.toastr.warning('No se encontró coincidencia en la base de datos');
            this.toastr.info('Consultando RUC En API');
            this.logisticaService.getConsultaRUC(this.ord.ruc).subscribe(res=>{
            if(res['success']){
              console.log(res);
              this.toastr.success('Datos obtenidos correctamente');
              this.ord.razon_social=res['data']['nombre_o_razon_social'];
              this.ord.direccion=res['data']['direccion_completa'];
              this.ord.num_cuenta='';

            }
            else{
              this.toastr.warning('No se obtuvieron datos');
              this.ord.razon_social='';
              this.ord.direccion='';
              this.ord.num_cuenta='';
            }
          })
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
    this.ord.ordItems[i].subtotal=(this.ord.ordItems[i].cantidad*parseFloat(this.ord.ordItems[i].unit_price)).toFixed(5);
    this.ord.subtotal='0';
    this.ord.ordItems.forEach(l=>{
      this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(l.subtotal)).toFixed(5);
    })
    this.ord.igv=((parseFloat(this.ord.igv_percent)*parseFloat(this.ord.subtotal))/100).toFixed(5);
    this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
  }

  changePU(i){
    this.ord.ordItems[i].subtotal=(this.ord.ordItems[i].cantidad*parseFloat(this.ord.ordItems[i].unit_price)).toFixed(5);
    this.ord.subtotal='0';
    this.ord.ordItems.forEach(l=>{
      this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(l.subtotal)).toFixed(5);
    })
    this.ord.igv=((parseFloat(this.ord.igv_percent)*parseFloat(this.ord.subtotal))/100).toFixed(5);
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

  async saveProvider() {
    console.log('init saveProvider');

    if (this.ord.ruc.length == 11) {
        console.log('validate 11');
        console.log(this.ord);

        try {
            const provl = await this.logisticaService.getProveedorByRuc(this.ord.ruc).toPromise();
            console.log('provl', provl);

            if (provl) {
                this.toastr.success('Datos del proveedor actualizados correctamente');
                this.actualProvider.razon_social = this.ord.razon_social;
                this.actualProvider.direccion = this.ord.direccion;
                this.actualProvider.cci = this.ord.num_cuenta;
                this.actualProvider.ruc = this.ord.ruc;
                this.actualProvider.estado = 'ACTIVE';

                const updRes = await this.logisticaService.updateProvider(this.actualProvider).toPromise();
                console.log('updRes', updRes);
                console.log('provl', provl);

                return;
            } else {
              console.log(this.ord)
                this.actualProvider.razon_social = this.ord.razon_social;
                this.actualProvider.direccion = this.ord.direccion;
                this.actualProvider.cci = this.ord.num_cuenta;
                this.actualProvider.ruc = this.ord.ruc;
                this.actualProvider.estado = 'ACTIVE';
                this.toastr.success('Datos del proveedor subidos correctamente');
                const addRes = await this.logisticaService.addProvider(this.actualProvider).toPromise();
                console.log('addRes', addRes);
            }
        } catch (error) {
            console.error('Error:', error);
            // Manejar el error según sea necesario
        }
    }
}

  saveProvider1(){
    console.log('init saveProvider');

    if(this.ord.ruc.length==11){
      console.log('validate 11');
            console.log(this.ord);

      this.logisticaService.getProveedorByRuc(this.ord.ruc).subscribe((provl:Proveedor)=>{
        console.log('provl',provl);
        if(provl){

          this.toastr.success('Datos del proveedor actualiazados correctamente');
          this.actualProvider.razon_social=  this.ord.razon_social;
          this.actualProvider.direccion=this.ord.direccion;
          this.actualProvider.cci=this.ord.num_cuenta;

          this.logisticaService.updateProvider(this.actualProvider).subscribe(res=>{
            if(res){
              console.log('updRes',res);
            }
          })

          return;
        
        }
        else{
            this.actualProvider.razon_social=  this.ord.razon_social;
            this.actualProvider.direccion=this.ord.direccion;
            this.actualProvider.cci=this.ord.num_cuenta;
            this.actualProvider.estado='ACTIVE';
            this.logisticaService.addProvider(this.actualProvider).subscribe(res=>{
            if(res){
              console.log('addRes',res);
            }
          })
        }
      })

    }
  }

  isValidRow(row: any): boolean {
    // Validar que "cantidad" sea un entero positivo y "precio" un float positivo
    const isValidCantidad = Number.isInteger(row.cantidad) && row.cantidad > 0;
    console.log('isValidCantidad',isValidCantidad);
    console.log('cantidad',row.cantidad);
    const isValidPrecio = !isNaN(row.precio) && row.precio > 0;
    console.log('isValidPrecio',isValidPrecio);
    console.log('precio',row.precio);

    return isValidCantidad && isValidPrecio;
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
      console.log(ws);


      /* save data */
      const data = XLSX.utils.sheet_to_json(ws, { raw: true }); // to get 2d array pass 2nd parameter as object {header: 1}

      console.log(data); // Data will be logged in array format containing objects

      const normalizedData = data.map((item: any) => {
        const normalizedItem: any = {};
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            normalizedItem[key.toLowerCase()] = item[key];
          }
        }
        return normalizedItem;
      });

      normalizedData.forEach((row: any) => {
        console.log('row',row);
        // Crea una instancia de OrdItem y agrega al arreglo listOrd

        if(this.isValidRow(row)){
          console.log('isValidrow',row);
          const ordItem = new OrdenItem('',0,'','','','','',false,'','','',false);
          ordItem.cantidad = row.cantidad;
          ordItem.descripcion = row.descripcion;
          ordItem.unit_price = row.precio;
          ordItem.descripcion=row.descripcion.toUpperCase();
          ordItem.unit_price=parseFloat( ordItem.unit_price).toFixed(5);
          ordItem.unit_price_aux=ordItem.unit_price;
          ordItem.igv_toggle=true;
          ordItem.subtotal=(ordItem.cantidad*parseFloat(ordItem.unit_price)).toFixed(5);
          ordItem.igv_unit=(parseFloat(ordItem.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
          console.log(ordItem);
          this.listaOrd.push(ordItem);
      
        }
        else{
          this.toastr.error('ERROR al añadir item: ', row.descripcion)


        }
      });

      data.splice(0,7);
      data.splice(data.length-1,1);

      this.ord.subtotal='0.0';
      this.listaOrd.forEach((oi:OrdenItem)=>{
       this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(5);
      })
      this.ord.igv=(parseFloat(this.ord.subtotal)*(parseFloat(this.ord.igv_percent)/100)).toFixed(5);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
      



      this.orden_item = new OrdenItem('',null,'','','','','',false,'','','',true);
      this.dataSourceOrd = new MatTableDataSource(this.listaOrd);

      this.dataSourceOrd.sort = this.sort.toArray()[0];

      this.fileUploaded=null;



      console.log(this.items_ord_wh);
    };
  }





  
  async generarOrden(){

    this.asigChange();

    await this.saveProvider();
    await this.getOrdValRules();



    this.ord.area=this.user_area.name;
    if(this.ord.rebajado==''){
      this.ord.rebajado=(0.0).toFixed(5);
    }
    else{
      this.ord.rebajado=parseFloat(this.ord.rebajado).toFixed(5);
    }

    this.user_id=this.user.user_id;

    this.ord.user_id=this.user_id;

    this.ord.razon_social=this.ord.razon_social.toUpperCase();
    this.ord.direccion=this.ord.direccion.toUpperCase();
    this.ord.step_id=1;
    this.ord.fecha_gen=this.getCurrentDate();
    this.ord.hora_gen=this.getCurrentHour();


    var resi = await this.logisticaService.getLastOrdOficinaCode(this.ord.numero,this.ord.destino,this.ord.empresa).toPromise();

    if (resi) {
      console.log(resi);

      const [prefix, numStr] = String(resi['numero']).split('-');
      const numeracion = (parseInt(numStr) + 1).toString().padStart(4, '0');
      this.ord.numero = `${prefix}-${numeracion}`;
    } else {
      this.ord.numero += '-0001';
    }

    if(this.ord.moneda!=''&&this.ord.empresa!=''&&this.ord.ruc!=''&&this.ord.razon_social!=''&&
    this.ord.direccion!=''&&this.ord.destino!=''&&this.ord.rebajado!=''&&this.ord.fecha!=''&&this.ord.observacion&&this.ord.observacion!=''
    &&(this.listaOrd.length>0)
    ){

      this.moneyText=this.numToText9Cifras(parseInt(this.ord.total))+' CON '+String(Math.ceil((parseFloat(this.ord.total)*100.0)%100))+'/100 ' + this.ord.moneda;

      // console.log("length",this.ordValRules.length)
      console.log("cositoosdfijsoifs",this.ordValRules)
      if(this.ordValRules==null||!(this.ordValRules.length>0)){
        this.ord.status='NO APLICA'
      }
      // console.log("si debería entrar");
      // this.logisticaService.getSalaByName(this.ord.destino).subscribe((resCampByName:Campus)=>{
      //   console.log('resCampByName',resCampByName)
      //   var temCampus=resCampByName;
      //   //console.log(parseInt(p.ord_codigo),temCampus.campus_id)
      // })
      // await this.getOrdValRules()

      this.dateTemp=this.ord.fecha;

      const resAddOrd = await this.logisticaService.addOrd(this.ord).toPromise();

      // if(this.ordValRules.length>0){
      //   this.asignarOrden(resAddOrd['session_id'],this.campusToValidate.campus_id, parseFloat(this.ord.total))
      // }

      if(resAddOrd['session_id']){

        for(const p of this.listaOrd){
          p.ord_codigo=resAddOrd['session_id'];
          p.estado='REGISTRADO';
          var resAddOrdDet = await this.logisticaService.addOrdDet(p).toPromise();
        }

        if(Array.isArray(this.ordValRules)){
          if(this.ordValRules.length>0){
            for (const rule of this.ordValRules) {
              var valToPost:OrdersValidation = new OrdersValidation(rule.user_id,resAddOrd['session_id'],this.getCurrentDate(),this.getCurrentHour(),'PENDIENTE');
              console.log(valToPost);
              await this.logisticaService.addOrderValidation(valToPost).toPromise();
            }
          }
          else{
            var valToPost:OrdersValidation = new OrdersValidation(0,resAddOrd['session_id'],this.getCurrentDate(),this.getCurrentHour(),'APROBADO');
            console.log(valToPost);
            await this.logisticaService.addOrderValidation(valToPost).toPromise();
          }
        }





        console.log("si debería entrar");
        this.logisticaService.getSalaByName(this.ord.destino).subscribe((resCampByName:Campus)=>{
          console.log('resCampByName',resCampByName)
          var temCampus=resCampByName;
        });

        this.generatePDF(true);

        this.ord.fecha=this.dateTemp;

        this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','','','','','','',0,'','NO','NO','OFICINA','');
        this.orden_item=new OrdenItem('',null,'','','','','',false,'','','',true);
      
        this.listaOrd=[];
        this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
        this.igvActivated=true;   
        this.prefijoMoney='';
        this.ord.moneda='SOLES';
        this.prefijoMoney='S/.';
        this.ord.subtotal=parseInt('0').toFixed(5);
        this.ord.igv=parseInt('0').toFixed(5);
        this.ord.retencion=parseInt('0').toFixed(5);
        this.ord.percepcion=parseInt('0').toFixed(5);
        this.ord.total=parseInt('0').toFixed(2);
        this.ord.rebajado='';
        this.posTituloSala = 74;
        console.log(this.ord);

        this.toastr.success('!Exito al generar orden');
        this.initConfig();

/*           this.listaOrd.forEach((p:OrdenItem,ind)=>{
          p.ord_codigo=resAddOrd['session_id'];
          p.estado='REGISTRADO'
          this.logisticaService.addOrdDet(p).subscribe(resAddOrdDet=>{        

            if(ind==this.listaOrd.length-1){

              //this.saveProvider();
              console.log("si debería entrar");
              this.logisticaService.getSalaByName(this.ord.destino).subscribe((resCampByName:Campus)=>{
                console.log('resCampByName',resCampByName)
                var temCampus=resCampByName;
                console.log(parseInt(p.ord_codigo),temCampus.campus_id)
                //this.asignarOrden(parseInt(p.ord_codigo),temCampus.campus_id, parseInt(this.ord.total))
              })

              this.generatePDF(true);

              // var anio = this.fecha.getFullYear();
              // var mes = this.fecha.getMonth()+1;
              // var dia = this.fecha.getDate();

              // if(mes<10){
              //   mes='0'+mes;
              // }
              // if(dia<10){
              //   dia='0'+dia;
              // }

              // this.ord.fecha=anio+'-'+mes+'-'+dia;

              this.ord.fecha=this.dateTemp;

              this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','','','','','','',0,'','NO','NO','OFICINA','');
              this.orden_item=new OrdenItem('',null,'','','','','',false,'','','',true);
            
              this.listaOrd=[];
              this.dataSourceOrd = new MatTableDataSource(this.listaOrd);
              this.igvActivated=true;   
              this.prefijoMoney='';
              this.ord.moneda='SOLES';
              this.prefijoMoney='S/.';
              this.ord.subtotal=parseInt('0').toFixed(5);
              this.ord.igv=parseInt('0').toFixed(5);
              this.ord.retencion=parseInt('0').toFixed(5);
              this.ord.percepcion=parseInt('0').toFixed(5);
              this.ord.total=parseInt('0').toFixed(2);
              this.ord.rebajado='';
              this.posTituloSala = 74;
              console.log(this.ord)


              //GUARDAR








              this.toastr.success('!Exito al generar orden');
              this.initConfig();
            }
          });
        }) */
      }
      else{
              this.toastr.warning('Quizá algo salio mal');
      }
      
    }
    else{
      this.toastr.warning('Rellena todos los campos');
    }


  }
  obtenerFechaActual(): string {
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const month = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 al mes y asegurar dos dígitos
    const day = fechaActual.getDate().toString().padStart(2, '0'); // Asegurar dos dígitos para el día

    return `${year}-${month}-${day}`;
  }

  obtenerHoraActual(): string {
    const horaActual = new Date();
    let hours = horaActual.getHours();
    const minutes = horaActual.getMinutes().toString().padStart(2, '0'); // Asegurar dos dígitos para los minutos
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convertir horas al formato de 12 horas y manejar el caso de medianoche (0 AM)
    hours = hours % 12;
    hours = hours ? hours : 12; // Si hours es 0, mostrar 12 en lugar de 0

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    return formattedTime;
  }

  async getOrdValRules() {
    try {
      var resCampByName: any = await this.logisticaService.getSalaByName(this.ord.destino).toPromise();
      console.log('resCampByName', resCampByName);
      this.campusToValidate = resCampByName;
  
      var res: any = await this.logisticaService.getOrderValidationRules(resCampByName.campus_id,parseFloat(this.ord.total)).toPromise();
      if(res=='NO HAY DATOS'){
        this.ordValRules = null;
      }else{
        this.ordValRules = res;
      }
      console.log('ordValRules',res)
      
      // Aquí puedes hacer cualquier otra cosa que necesites con ordValRules
    } catch (error) {
      // Manejo de errores
    }
  }
  
  asignarOrden( orden_id:number,campus_id: number,total: number){
    console.log('Asignar Orden TOTAL',total)

    // var getOrdValRules: OrdersValidationRules [];
    // this.logisticaService.getOrderValidationRules(campus_id).subscribe((res:any)=>{
    //   getOrdValRules=res;

      ///////GENERAR LAS VALIDACIONES
      /////VALIDACION 1:
    var OrdvalToPost: OrdersValidation = new OrdersValidation(0,0,'','','PENDIENTE');
   
    OrdvalToPost.order_id= orden_id;
    OrdvalToPost.date= this.obtenerFechaActual();
    OrdvalToPost.hour= this.obtenerHoraActual();
    console.log(OrdvalToPost)
    
    var counterOfValidators = 0;
    this.ordValRules.forEach(element => {
       //OrdvalToPost.user_id=getOrdValRules[0].user_id;
      if(parseFloat(element.amount)<=total){
        OrdvalToPost.user_id=element.user_id;
        counterOfValidators++;
        this.logisticaService.addOrderValidation(OrdvalToPost).subscribe(res1=>{
          console.log(res1)
        });
      }


    });

     
      // this.logisticaService.addOrderValidation(OrdvalToPost).subscribe(res1=>{
      //   console.log(res1)
      // });
      //  /////VALIDACION 2:
      // OrdvalToPost.user_id=getOrdValRules[1].user_id;
      // this.logisticaService.addOrderValidation(OrdvalToPost).subscribe(res2=>{
      //   console.log(res2)
      //   console.log("esperemos que haya funcionado")
      // });

    // })
   
  }


//isGenerating Menciona si se usa para generar la vista(true) o solo para generar el pdf(false)
  generatePDF(isGenerating:boolean){

    this.doc = new jsPDF();

    this.img.src = 'assets/logo'+this.ord.empresa+'.png';
 

    this.doc.addImage(this.img, 'png', 15, 4, 30, 30, '','FAST',0);
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(9);
    this.doc.text('RUC: '+this.ordenCampus.ruc,30,36,{align:'center'});
    this.doc.setFont("helvetica","bold");
    this.doc.setFontSize(18);
    this.doc.text('ORDEN DE '+ this.ord.tipo,105,25,{align:'center'});
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(14);
    this.doc.text(this.ord.destino,105,32,{align:'center'});
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(8);
    this.doc.text(this.ord.destino_dir,105,40,{align:'center'});
    this.doc.roundedRect(65, 15, 80, 20, 2, 2, 'S');
    this.doc.rect(150, 18, 50, 14);
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(183,18,18);
    this.doc.text('ORDEN DE '+ this.ord.tipo,175,23,{align:'center'});
    // this.doc.text('Nº '+ this.ord.numero,175-(((9+this.ord.numero.length)/2)*3),39);
    this.doc.text('Nº '+this.ord.numero,175,29,{align:'center'});
    this.doc.setTextColor(0,0,0);
    this.doc.text('RUC',15,48);
    this.doc.text(': '+this.ord.ruc,45,48);
    this.doc.text('PROVEEDOR',15,53);
    this.doc.text(': '+this.ord.razon_social,45,53);
    this.doc.text('DIRECCION',15,58);
    this.doc.setFontSize(7);
    this.doc.text(': '+this.ord.direccion,45,58);
    this.doc.setFontSize(8);
    this.doc.roundedRect(10, 63, 190, 12, 2, 2, 'S');
    this.doc.line(10, 69, 200, 69, 'S');
    this.doc.setFont("helvetica","bold");
    this.doc.text('CONDICIONES DE PAGO',40,68,{align:'center'});
    this.doc.text('CCI',105,68,{align:'center'});
    this.doc.text('FECHA COMPRA',165,68,{align:'center'});
    this.doc.setFont("helvetica","normal");

    this.doc.text(this.ord.tipo_pago,40,73,{align:'center'});
    this.doc.text(this.ord.num_cuenta,105,73,{align:'center'});
    this.doc.text(this.ord.fecha,165,73,{align:'center'});

    this.doc.line(10, 79, 200, 79, 'S');
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica","bold");
    this.doc.text('CANTIDAD',22,83,{align:'center'});
    this.doc.text('DESCRIPCION',86,83,{align:'center'});
    this.doc.text('PRECIO UNIT.',156,83,{align:'center'});
    this.doc.text('SUBTOTAL',187,83,{align:'center'});
    this.doc.setFont("helvetica","normal");
    var pos_line=79;
    var pos_line_start=pos_line;
    var pos_item=pos_line+4;
    this.listaOrd.forEach(m=>{
      pos_line+=6;
      pos_item+=6;
      if(pos_line>230){
        this.doc.line(10, pos_line, 200, pos_line, 'S');
        this.doc.line(10, pos_line_start, 10, pos_line, 'S');
        this.doc.line(34, pos_line_start, 34, pos_line, 'S');
        this.doc.line(140, pos_line_start, 140, pos_line, 'S');
        this.doc.line(174, pos_line_start, 174, pos_line, 'S');
        this.doc.line(200, pos_line_start, 200, pos_line, 'S');

        ////AÑADIR LAS OBSERVACIONES AL PIE DE PAGINA     
       
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica","italic");
        this.doc.setTextColor(100,100,100);
        this.doc.text('*Observación: '+this.ord.observacion.toUpperCase(),20,280);
        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(8);
        this.doc.setTextColor(0,0,0);
          ////

        this.doc.addPage();

        
   

        pos_line=15;
        pos_line_start=pos_line;
        pos_item=pos_line+4;
      }
      this.doc.line(10, pos_line, 200, pos_line, 'S');
      this.doc.text(String(m.cantidad),22,pos_item,{align:'center'});
      //this.doc.text(m.descripcion,40,pos_item);
      this.doc.text(parseFloat(m.unit_price).toFixed(2),156,pos_item,{align:'center'});
      this.doc.text(parseFloat(m.subtotal).toFixed(2),187,pos_item,{align:'center'});
      this.doc.setFontSize(8);
      if(m.descripcion.length<=55){
        this.doc.text(m.descripcion,36,pos_item);
      }
      else{
        if(m.descripcion.length<=110){
          this.doc.text(m.descripcion.substring(0,55),36,pos_item);
          pos_line+=6;
          pos_item+=6;
          this.doc.text(m.descripcion.substring(55,m.descripcion.length),36,pos_item);
        }
        else{
          if(m.descripcion.length<=165){
            this.doc.text(m.descripcion.substring(0,55),36,pos_item);
            pos_line+=6;
            pos_item+=6;
            this.doc.text(m.descripcion.substring(55,110),36,pos_item);
            pos_line+=6;
            pos_item+=6;
            this.doc.text(m.descripcion.substring(110,m.descripcion.length),36,pos_item);

          }
        }
      }
    })
    pos_line+=6;
    this.doc.line(10, pos_line, 200, pos_line, 'S');
    this.doc.line(10, pos_line_start, 10, pos_line, 'S');
    this.doc.line(34, pos_line_start, 34, pos_line, 'S');
    this.doc.line(140, pos_line_start, 140, pos_line, 'S');
    this.doc.line(174, pos_line_start, 174, pos_line, 'S');
    this.doc.line(200, pos_line_start, 200, pos_line, 'S');
    pos_line+=10;
    this.doc.setFontSize(8);
    this.doc.setTextColor(183,18,18);
    this.doc.text('SON: '+this.moneyText,15,pos_line);
    pos_line+=5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(0,0,0);
    this.doc.roundedRect(140, pos_line, 60, 27, 2, 2, 'S');
    pos_line+=5;
    this.doc.text('SUBTOTAL',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(parseFloat(this.ord.subtotal).toFixed(2),197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('IGV',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(parseFloat(this.ord.igv).toFixed(2),197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('Retencion('+this.ord.retencion_percent+'%)',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(parseFloat(this.ord.retencion).toFixed(2),197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('Percepcion',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(parseFloat(this.ord.percepcion).toFixed(2),197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('MONTO INICIAL: '+this.prefijoMoney+' '+parseFloat(this.ord.rebajado).toFixed(2),20,pos_line);
    this.doc.text('TOTAL',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.total,197,pos_line,{align:'right'});
    //console.log(this.doc.internal.getFontSize());

/*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */


    //this.doc.addImage( this.sello, 'png',this.doc.internal.pageSize.width - 60,this.doc.internal.pageSize.height -60,50,40,'','FAST',0);
    
    console.log(this.signature);
    
    if(this.signature&&(this.signature.signatureURL!=null&&this.signature.signatureURL!='')){
   //this.sello.src = 'assets/selloVisionGames.png';
   this.sello.src = this.signature.signatureURL;

   
    console.log(this.signature.signatureURL)
    this.doc.addImage( this.sello, 'png',this.doc.internal.pageSize.width/2 - 25,pos_line-30,50,40,'','FAST',0);

    }
    console.log('final',pos_line)

    ////AÑADIR LAS OBSERVACIONES AL PIE DE PAGINA     
    //this.ord.observacion='Prueba super obvservación uno';
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica","italic");
    this.doc.setTextColor(100,100,100);
    this.doc.text('*Observación: '+this.ord.observacion.toUpperCase(),20,280);
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(0,0,0);
      ////


    if(isGenerating==true){
      window.open(URL.createObjectURL(this.doc.output("blob")));
    }else{
      this.doc.save(this.ord.numero+'.pdf')
      return this.doc.output('blob')
    }

  }

  onNoClick(): void {
  }

  //--------------------------------------------
  searchItemView(){

  }


  dateChangeView(value){

  }


  areaChangeView(e){

  }

  salaChangeView(e){

  }

  applyFilterDView(event: Event) {
    this.ordersSentFolderCurrentPage = 1;


    this.ordersSentFolderViewUpdateTable();

    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSourceOrdersView.filter = filterValue.trim().toLowerCase();

    // if (this.dataSourceOrdersView.paginator) {
    //   this.dataSourceOrdersView.paginator.firstPage();
    // }
  }


  reCreatePDFView(o:Orden){
    this.ordView=o;
    this.listaOrdView=[];
    if(this.ordView.moneda=='SOLES'){
      this.prefijoMoneyView='S/.'
    }
    if(this.ordView.moneda=='DOLARES AMERICANOS'){
      this.prefijoMoneyView='$'
    }
    this.moneyTextView=this.numToText9Cifras(parseInt(this.ordView.total))+' CON '+String(Math.ceil((parseFloat(this.ordView.total)*100.0)%100))+'/100 ' + this.ordView.moneda;
    this.logisticaService.getOrdenItemsByOrdenId(String(this.ordView.id)).subscribe((res:OrdenItem[])=>{
      if(res.length>0){
        this.listaOrdView=res;
        this.logisticaService.getSalaByName(this.ordView.destino).subscribe((res5:Campus)=>{
          this.ordenCampusView=res5;
        
          this.generatePDFView(true);
          
        })
      }
    })
  }

  listTxtChange(e,a){
    if(this.selectionTxt.isSelected(a)){
      this.selectionTxt.deselect(a);
    }
    else{
      this.selectionTxt.select(a);
    }

  }

  async createTxtFile(){

    console.log(this.selectionTxt.selected);

    var dataTxt = '';
    var tipoComprobante='';

    this.selectionTxt.selected.forEach((ord:Orden,indiOrd)=>{
      console.log(ord);

      this.logisticaService.getFondoItemsByOrdenId(String(ord.id)).subscribe((res:FondoItem)=>{
        console.log(indiOrd)
        console.log(res);
        if(res){
          tipoComprobante='';
          if(res.tipo_doc=='FACTURA'){
            tipoComprobante='01';
          }
          if(res.tipo_doc=='BOLETA'){
            tipoComprobante='03';
          }
          if(res.tipo_doc=='RECIBO'){
            tipoComprobante='R1';
          }
          if(res.tipo_doc=='HONORARIO'){
            tipoComprobante='R1';
          }
          var fechaArray1=res.fecha.split('-');
          if(dataTxt!=''){
            dataTxt=dataTxt+'\n';
          }
          var txtline= res.ruc+'|'+tipoComprobante+'|'+res.serie+'|'+res.numero+'|'+fechaArray1[2]+'/'+fechaArray1[1]+'/'+fechaArray1[0]+'|'+res.monto;
          dataTxt=dataTxt+txtline;

          ord.txt='SI';
          this.logisticaService.updateOrd(ord).subscribe(resGenTxt=>{  
  
            if(indiOrd==this.selectionTxt.selected.length-1){
              console.log(this.selectionTxt.selected.length);
              this.txtFileName='ListaComprobantes.txt';
    
              const blobTxt = new Blob([dataTxt], { type: 'text/plain' });
      
              this.txtFileUrl = window.URL.createObjectURL(blobTxt);
              console.log(this.txtFileUrl);
      
              const aTag = document.createElement('a');
              aTag.href = this.txtFileUrl;
              aTag.download = this.txtFileName;
              aTag.click();
              aTag.remove();
    
              this.selectionTxt.clear();
            }
          });


        }
        else{
          this.toastr.warning('La orden '+ord.numero+' no tiene comprobante asociado');
        }



      })
    })



  }

  showDocs(a:Orden){
    var dialogRef;


    dialogRef=this.dialog.open(DialogShowDocs,{
      data:a,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
      }
    })
  }

  addReceiptView(a: Orden){
    var dialogRef;

    var fechaRegisterStr = this.getCurrentDate();
  
    //this.receipt=new FondoItem(this.sala,this.fechaStr,'','','','','','','','PENDIENTE',0,this.user.user_id);
    this.receipt=new FondoItem('ORDEN',fechaRegisterStr,'','','',a.ruc,a.razon_social,a.total,'ORDEN','REGISTRADO',0,this.user.user_id,a.id);

    dialogRef=this.dialog.open(DialogAddReceipt,{
      data:{item:this.receipt,
            date:this.fechaRegister},
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        a.receipt='SI';
        this.logisticaService.updateOrd(a).subscribe();
/*         this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res2:FondoItem[])=>{
          this.fondoItems=res2;
          this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
          this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
          this.dataSourceFondoItem.sort = this.sort.toArray()[0];
        }) */
      }
    })
  }

  editReceiptView(a: Orden){
    var dialogRef;

    var fechaRegisterStr = this.getCurrentDate();
  
    //this.receipt=new FondoItem(this.sala,this.fechaStr,'','','','','','','','PENDIENTE',0,this.user.user_id);
    this.receipt=new FondoItem('ORDEN',fechaRegisterStr,'','','','','','','ORDEN','REGISTRADO',0,this.user.user_id,a.id);

    dialogRef=this.dialog.open(DialogEditReceipt,{
      data:{item:this.receipt,
            date:this.fechaRegister},
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        a.receipt='SI';
        a.txt='NO';
        this.logisticaService.updateOrd(a).subscribe();
/*         this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res2:FondoItem[])=>{
          this.fondoItems=res2;
          this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
          this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
          this.dataSourceFondoItem.sort = this.sort.toArray()[0];
        }) */
      }
    })
  }


  generatePDFView(isGenerating:boolean){

    this.docView = new jsPDF();
    

    this.imgView.src = 'assets/logo' + this.ordView.empresa+'.png';
    this.docView.addImage(this.imgView, 'png', 15, 4, 30, 30, '','FAST',0);
    this.docView.setFont("helvetica","normal");
    this.docView.setFontSize(9);
    this.docView.text('RUC: '+this.ordenCampusView.ruc,30,36,{align:'center'});
    this.docView.setFont("helvetica","bold");
    this.docView.setFontSize(18);
    this.docView.text('ORDEN DE '+ this.ordView.tipo,105,25,{align:'center'});
    this.docView.setFont('helvetica',"normal");
    this.docView.setFontSize(14);
    this.docView.text(this.ordView.destino,105,32,{align:'center'});
    this.docView.setFont("helvetica","normal");
    this.docView.setFontSize(8);
    this.docView.text(this.ordView.destino_dir,105,40,{align:'center'});
    this.docView.roundedRect(65, 15, 80, 20, 2, 2, 'S');
    this.docView.rect(150, 18, 50, 14);
    this.docView.setFont("helvetica","normal");
    this.docView.setFontSize(9);
    this.docView.setTextColor(183,18,18);
    this.docView.text('ORDEN DE '+ this.ordView.tipo,175,23,{align:'center'});
    // this.doc.text('Nº '+ this.ord.numero,175-(((9+this.ord.numero.length)/2)*3),39);
    this.docView.text('Nº '+this.ordView.numero,175,29,{align:'center'});
    this.docView.setTextColor(0,0,0);
    this.docView.text('RUC',15,48);
    this.docView.text(': '+this.ordView.ruc,45,48);
    this.docView.text('PROVEEDOR',15,53);
    this.docView.text(': '+this.ordView.razon_social,45,53);
    this.docView.text('DIRECCION',15,58);
    this.docView.setFontSize(7);
    this.docView.text(': '+this.ordView.direccion,45,58);
    this.docView.setFontSize(8);
    this.docView.roundedRect(10, 63, 190, 12, 2, 2, 'S');
    this.docView.line(10, 69, 200, 69, 'S');
    this.docView.setFont("helvetica","bold");
    this.docView.text('CONDICIONES DE PAGO',40,68,{align:'center'});
    this.docView.text('CCI',105,68,{align:'center'});
    this.docView.text('FECHA COMPRA',165,68,{align:'center'});
    this.docView.setFont("helvetica","normal");

    this.docView.text(this.ordView.tipo_pago,40,73,{align:'center'});
    this.docView.text(this.ordView.num_cuenta,105,73,{align:'center'});
    this.docView.text(this.ordView.fecha,165,73,{align:'center'});

    this.docView.line(10, 79, 200, 79, 'S');
    this.docView.setFontSize(8);
    this.docView.setFont("helvetica","bold");
    this.docView.text('CANTIDAD',22,83,{align:'center'});
    this.docView.text('DESCRIPCION',86,83,{align:'center'});
    this.docView.text('PRECIO UNIT.',156,83,{align:'center'});
    this.docView.text('SUBTOTAL',187,83,{align:'center'});
    this.docView.setFont("helvetica","normal");
    var pos_line=79;
    var pos_line_start=pos_line;
    var pos_item=pos_line+4;
    this.listaOrdView.forEach(m=>{
      pos_line+=6;
      pos_item+=6;
      if(pos_line>230){
        this.docView.line(10, pos_line, 200, pos_line, 'S');
        this.docView.line(10, pos_line_start, 10, pos_line, 'S');
        this.docView.line(34, pos_line_start, 34, pos_line, 'S');
        this.docView.line(140, pos_line_start, 140, pos_line, 'S');
        this.docView.line(174, pos_line_start, 174, pos_line, 'S');
        this.docView.line(200, pos_line_start, 200, pos_line, 'S');
          ////AÑADIR LAS OBSERVACIONES AL PIE DE PAGINA     
          //this.ordView.observacion='Prueba super obvservación uno'

        this.docView.setFontSize(8);
        this.docView.setFont("helvetica","italic");
        this.docView.setTextColor(100,100,100);

        this.docView.text('*Observación: '+this.ordView.observacion.toUpperCase(),20,280);

        this.docView.setFont("helvetica","normal");
        this.docView.setFontSize(8);
        this.docView.setTextColor(0,0,0);
          ////
        this.docView.addPage();
        
        pos_line=15;
        pos_line_start=pos_line;
        pos_item=pos_line+4;
      }
      this.docView.line(10, pos_line, 200, pos_line, 'S');
      this.docView.text(String(m.cantidad),22,pos_item,{align:'center'});
      //this.doc.text(m.descripcion,40,pos_item);
      this.docView.text(m.unit_price,156,pos_item,{align:'center'});
      this.docView.text(m.subtotal,187,pos_item,{align:'center'});
      this.docView.setFontSize(8);
      if(m.descripcion.length<=55){
        this.docView.text(m.descripcion,36,pos_item);
      }
      else{
        if(m.descripcion.length<=110){
          this.docView.text(m.descripcion.substring(0,55),36,pos_item);
          pos_line+=6;
          pos_item+=6;
          this.docView.text(m.descripcion.substring(55,m.descripcion.length),36,pos_item);
        }
        else{
          if(m.descripcion.length<=165){
            this.docView.text(m.descripcion.substring(0,55),36,pos_item);
            pos_line+=6;
            pos_item+=6;
            this.docView.text(m.descripcion.substring(55,110),36,pos_item);
            pos_line+=6;
            pos_item+=6;
            this.docView.text(m.descripcion.substring(110,m.descripcion.length),36,pos_item);

          }
        }
      }
    })
    pos_line+=6;
    this.docView.line(10, pos_line, 200, pos_line, 'S');
    this.docView.line(10, pos_line_start, 10, pos_line, 'S');
    this.docView.line(34, pos_line_start, 34, pos_line, 'S');
    this.docView.line(140, pos_line_start, 140, pos_line, 'S');
    this.docView.line(174, pos_line_start, 174, pos_line, 'S');
    this.docView.line(200, pos_line_start, 200, pos_line, 'S');
    pos_line+=10;
    this.docView.setFontSize(8);
    this.docView.setTextColor(183,18,18);
    this.docView.text('SON: '+this.moneyTextView,15,pos_line);
    pos_line+=5;
    this.docView.setFontSize(8);
    this.docView.setTextColor(0,0,0);

    this.docView.roundedRect(140, pos_line, 60, 27, 2, 2, 'S');
    pos_line+=5;
    this.docView.text('SUBTOTAL',142,pos_line);
    this.docView.text(this.prefijoMoneyView,166,pos_line);
    this.docView.text(this.ordView.subtotal,197,pos_line,{align:'right'});
    pos_line+=5;
    this.docView.text('IGV',142,pos_line);
    this.docView.text(this.prefijoMoneyView,166,pos_line);
    this.docView.text(this.ordView.igv,197,pos_line,{align:'right'});
    pos_line+=5;
    this.docView.text('Retencion('+this.ordView.retencion_percent+'%)',142,pos_line);
    this.docView.text(this.prefijoMoneyView,166,pos_line);
    this.docView.text(this.ordView.retencion,197,pos_line,{align:'right'});
    pos_line+=5;
    this.docView.text('Percepcion',142,pos_line);
    this.docView.text(this.prefijoMoneyView,166,pos_line);
    this.docView.text(this.ordView.percepcion,197,pos_line,{align:'right'});
    pos_line+=5;
    this.docView.text('MONTO INICIAL: '+this.prefijoMoneyView+' '+this.ordView.rebajado,20,pos_line);
    this.docView.text('TOTAL',142,pos_line);
    this.docView.text(this.prefijoMoneyView,166,pos_line);
    this.docView.text(this.ordView.total,197,pos_line,{align:'right'});


    if( this.signature && this.signature.signatureURL!=null && this.signature.signatureURL!=''){
    this.sello.src = this.signature.signatureURL;
    //this.sello.src = 'assets/selloVisionGames.png';

    this.docView.addImage( this.sello, 'png',this.docView.internal.pageSize.width/2 - 25,pos_line-30,50,40,'','FAST',0);
  }
    //console.log(this.doc.internal.getFontSize());

  /*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */
   ////AÑADIR LAS OBSERVACIONES AL PIE DE PAGINA     
  //this.ordView.observacion='Prueba super obvservación uno'
  this.docView.setFontSize(8);
  this.docView.setFont("helvetica","italic");
  this.docView.setTextColor(100,100,100);

   this.docView.text('*Observación: '+this.ordView.observacion.toUpperCase(),20,280);

   this.docView.setFont("helvetica","normal");
   this.docView.setFontSize(8);
   this.docView.setTextColor(0,0,0);
     ////


   
    if(isGenerating==true){
      window.open(URL.createObjectURL(this.docView.output("blob")));
    }else{
      console.log('SIENTRA martin mentiroso')
      //this.doc.save(this.ord.numero+'.pdf')
      return new File([this.docView.output('blob')], this.ord.numero+'.pdf', { type: 'application/pdf' });
      //this.docView.output('blob')
    }

  }

  viewValidationsOrder(order_id:number){
    this.logisticaService.getOrdersValidations(order_id).subscribe((resGet:any)=>{
      return resGet;
    })
  }

  toggleCheckbox( a:Orden): void {
    a.isChecked = !a.isChecked;
  }


  //Exportación de los documentos y cambio de fase

  //REFRESHER
  refreshPageIfNeeded(){
    window.location.reload();
  }
  ///MEJORAR CON LA ESCALABILIDAD
  async phaseChanger(Ord:Orden){
    Ord.step_id=2;
    Ord.step="STEP_2",
    Ord.status="Aprovado"
    Ord.folder_id=this.folderPostedId;
    console.log('Iniciando cambio de status de orden')
    var resUpdt= await this.logisticaService.updateOrdStepStatus(Ord).toPromise();
  }
 /*  exportFilesToFolder(){


    this.listaOrdersPendantView.forEach(element => {
      var folderToPush = new Folder('test','desctest',true,0,1230)
      if(element.isChecked){
        this.listaOrdChangeStep.push(element);
        this.ord=element;
        console.log(folderToPush)
        this.logisticaService.addFolder(folderToPush).subscribe((res:any)=>{
          this.folderPostedId = res.folderId;
          console.log(res, res.folderId)
          this.reCreatePDFView(element);
          var pdfToPostBlob= this.generatePDFView(false);

          ///Cambio de Fase:
          this.phaseChanger(element);

          ////////SETEO DE VALORES DE PDFTOPOSTBLOB4

          console.log(pdfToPostBlob);
          const formData = new FormData();
          formData.append('file', pdfToPostBlob, element.numero+'.pdf');
        
          this.saveFiles(pdfToPostBlob,element.id)
         // this.refreshPageIfNeeded();

          this.getPendantOrds();

          this.changeDestinoView();
        })
        
      }

    });
    
    console.log(this.listaOrdChangeStep);
  
    

  } */
  async exportFilesToFolder() {
    try {
      for (const element of this.ordersPendingFolder) {
        var folderToPush = new Folder('test','desctest',true,0,1230);
        if (element.isChecked) {
          this.listaOrdChangeStep.push(element);
          this.ord = element;
          console.log('Creando el folder',folderToPush);
          const res: any = await this.logisticaService.addFolder(folderToPush).toPromise();
          console.log('folder creado');
          this.folderPostedId = res.folderId;
          console.log(res, res.folderId);
          this.reCreatePDFView(element);
          var pdfToPostBlob = this.generatePDFView(false);
  
          // Cambio de Fase:
          await this.phaseChanger(element);
  
          ////////SETEO DE VALORES DE PDFTOPOSTBLOB4
  
          console.log(pdfToPostBlob);
          const formData = new FormData();
          formData.append('file', pdfToPostBlob, element.numero+'.pdf');
          console.log('Iniciando saveFiles asociados')
          await this.saveFiles(pdfToPostBlob, element.id);
          console.log('files asociados guardados ')
        }
      }
  
      console.log(this.listaOrdChangeStep);
      console.log('Iniciadno consulta de pendients')
      await this.getPendantOrds();
      console.log('resultado de consulta obtenida')
      this.changeDestinoView();
    } catch (error) {
      // Manejo de errores
      console.error("Ocurrió un error:", error);
    }
  }
  
  
  /*   getPendantOrds(){
    this.logisticaService.getOrdersbyStepStatusAddFolderId(this.user_id, this.user_role, 'TODOS','PENDIENTE',1).subscribe((resOrdPend:Orden[])=>{
      console.log(resOrdPend);
      console.log(this.listaOrdersPendantView);
      this.listaOrdersPendantView=resOrdPend;
      console.log(this.dataSourceOrdersPendant);
      this.dataSourceOrdersPendant = new MatTableDataSource(this.listaOrdersPendantView);
      this.dataSourceOrdersPendant.paginator = this.paginator.toArray()[0];
      this.dataSourceOrdersPendant.sort = this.sort.toArray()[0];
    })
  } */
  async getPendantOrds() {
    try {
      const resOrdPend: any = await this.logisticaService.getOrdersbyStepStatusAddFolderId(this.user_id, this.user_role, 'TODOS','PENDIENTE',1).toPromise();
      console.log(resOrdPend);
      console.log(this.ordersPendingFolder);
      this.ordersPendingFolder = resOrdPend;
      console.log(this.dataSourceOrdersPendant);
      this.dataSourceOrdersPendant = new MatTableDataSource(this.ordersPendingFolder);
      this.dataSourceOrdersPendant.paginator = this.paginator.toArray()[0];
      this.dataSourceOrdersPendant.sort = this.sort.toArray()[0];
    } catch (error) {
      // Manejo de errores
      console.error("Ocurrió un error:", error);
    }
  }
  
  onDrop(event) {
    const files = event.dataTransfer?.files;
    console.log(files)
  
    if (event.isPointerOverContainer) {
      const file =  files[0];
      this.openDialogNewDoc(file);
    }
  }
  openDialogNewDoc(file: File) {
      const dialogRef = this.dialog.open(DialogNewDoc, {
        data: { doc: file }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Dialog closed with: ', result);
        }
      });
    }
  setValidatorUser(order: Orden): boolean {
    let response = false;
      if(order.val_id!=null||order.val_id!=0){
        response = true;
      }
    return response;
}


  anularView(orden: Orden){
    var dialogRef;
    dialogRef=this.dialog.open(DialogConfirmOrden,{
      data:"Segur@ que desea anular la orden?",
    })
    dialogRef.afterClosed().subscribe(res => {
      console.log(res);
      if(res){
        this.ordView=orden;
        console.log(this.ordView);
        this.listaOrdView=[];

        this.logisticaService.getOrdenItemsByOrdenId(String(this.ordView.id)).subscribe((resp:OrdenItem[])=>{
          console.log(String(this.ordView.id));
          console.log(resp);

          if(resp.length>0){
            this.listaOrdView=resp;
          }
     
          this.ord.tipo=this.ordView.tipo;
          this.ord.destino=this.ordView.destino;
          this.asigChange();
          this.ord.moneda=this.ordView.moneda;
          this.asigMoneyChange();
          var fechaArrAux=this.ordView.fecha.split('-');
          //this.fecha=new Date(parseInt(fechaArrAux[0]),parseInt(fechaArrAux[1])-1,parseInt(fechaArrAux[2])) ;
          this.ord.tipo_pago=this.ordView.tipo_pago;
          this.ord.ruc=this.ordView.ruc
          this.ord.razon_social=this.ordView.razon_social;
          this.ord.direccion=this.ordView.direccion;
          this.ord.num_cuenta=this.ordView.num_cuenta;
          this.listaOrd=[];
          this.listaOrdView.forEach(element => {
            this.orden_item.cantidad=element.cantidad;
            this.orden_item.descripcion=element.descripcion;
            this.orden_item.unit_price=element.unit_price;
            this.addItem();
          });
          this.ord.retencion_percent=this.ordView.retencion_percent;
          this.updateRetencion();
          this.ord.percepcion=this.ordView.percepcion;
          this.updatePercepcion();
          this.ord.rebajado=this.ordView.rebajado;
          
          this.ordView.estado='ANULADO';
          this.logisticaService.updateOrd(this.ordView).subscribe(resOA=>{
            if(resOA){
              this.listaOrdView.forEach(c=>{
                c.estado='ANULADO'
                this.logisticaService.updateOrdDet(c).subscribe();
              })
              this.toastr.warning('Orden anulada');
            }
          })
        })

        const tabCount=2;
        this.demo1TabIndex = 0;

        /* this.logisticaService.getFondoItemsByLiquidacionId(String(fond.id)).subscribe((resi:FondoItem[])=>{
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
      } */
      } 
    }
    )
  }

}





