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
import { Product } from '../product';
import { FondoItem } from '../fondo_item';


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

  pay_type=['EFECTIVO','TRANSFERENCIA']

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

  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,'','','0.0','','',0,'18','NO','NO','ALMACEN');

  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);

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

  valorizadoSlideChecked: boolean;

  docname;

  dataSourceWarehouse: MatTableDataSource<any>;

  items_ord_wh: any[] = [];

  p: Product = new Product('','','','','','','','','NO',false);
  prov: Proveedor = new Proveedor('','','','','','');
  provActive;

  percepcionActivated;
  percepInput;

  listaProviders: Proveedor[]= [];
  listaProvidersActive: Proveedor[]= [];
  listaProducts: Product[]= [];

  dataSourceWareOrd: MatTableDataSource<OrdenItem>;

  dataSourceOrdersWarehouse: MatTableDataSource<Orden>;

  ordWarehouse: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,null,null,null,null,null,null,'','NO','NO','OFICINA');

  listaOrdersWarehouse: Orden[]= [];

  listaOrdWarehouse: OrdenItem[]= [];

  prefijoMoneyWarehouse='';
  moneyTextWarehouse='';

  selectionTxt = new SelectionModel<Orden>(true, []);

  receipt: FondoItem;
  fechaRegister

  txtFileName;
  txtFileUrl;


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

  provChange(){

    var provSelected = this.listaProvidersActive.find(s=>
      s.ruc==this.provActive
    );
    console.log(provSelected);
    this.ord.ruc=provSelected.ruc;
    this.ord.razon_social=provSelected.razon_social;
    this.ord.direccion=provSelected.direccion;
    if(provSelected.cci==null){
      this.ord.num_cuenta='';
    }
    else{
      this.ord.num_cuenta=provSelected.cci;
    }

    console.log(this.ord);

    this.igvActivated=true;

    if(this.items_ord_wh.length==0){
      this.toastr.warning('No se ha subido ningun archivo');
    }
    else{
      this.listaOrd=[];
      this.logisticaService.getAllProducts(this.provActive).subscribe((prodl:Product[])=>{
        this.listaProducts=prodl;
        this.items_ord_wh.forEach(a=>{
          this.listaProducts.forEach((b)=>{
            if(a['0']==b.codigo){

              this.orden_item = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);

              console.log(a);

              if(a['0'].includes('ECE')&&a['2'].includes('GRS')){
                this.orden_item.cantidad = (Math.ceil(parseFloat(a['3'])/100.00))*100;
                this.orden_item.units = b.um_prov;
                this.orden_item.descripcion = b.descripcion;
              }
              else{
                if(b.val_prov!=''){
                  this.orden_item.cantidad = Math.ceil(parseFloat(((parseFloat(a['3'])/parseFloat(b.val_sis))*parseFloat(b.val_prov)).toFixed(2)));
                  this.orden_item.units = b.um_prov;
                  this.orden_item.descripcion = b.descripcion;
                }
                else{
                  this.orden_item.cantidad = parseFloat(parseFloat(a['3']).toFixed(1));
                  this.orden_item.units = a['2'];
                  this.orden_item.descripcion = a['1'];
                }
              }

              this.orden_item.unit_price = b.unit_price;
              this.orden_item.subtotal = (this.orden_item.cantidad*parseFloat(this.orden_item.unit_price)).toFixed(2);
              if(b.exonerado=='SI'){
                this.orden_item.igv_toggle=false;
              }
              else{
                this.orden_item.igv_toggle=true;
              }
              this.orden_item.igv_enabled=false;


              this.listaOrd.push(this.orden_item);

            }
          })
        })
        this.dataSourceWareOrd = new MatTableDataSource(this.listaOrd);
/*         this.dataSourceWareOrd.paginator = this.paginator.toArray()[1]; */
        this.dataSourceWareOrd.sort = this.sort.toArray()[1];

        this.ord.subtotal=(0.0).toFixed(2);

        this.listaOrd.forEach(c=>{
          c.unit_price_aux=c.unit_price;
          this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(c.subtotal)).toFixed(2);
        })

        this.updateIgv();
      })
    }

  }

  applyFilterWareOrd(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceWareOrd.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceWareOrd.paginator) {
      this.dataSourceWareOrd.paginator.firstPage();
    }
  }

/*   updateIgv(){
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
  } */






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
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.percepcion)).toFixed(2);
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
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.percepcion)).toFixed(2);
      }
    }
    else{
      this.listaOrd.forEach((oi:OrdenItem)=>{
        oi.igv_unit='0.0';
      })
      this.igvSlideChecked=false;
      this.igvSlideDisabled=true;
      this.ord.igv=(0.0).toFixed(5);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.percepcion)).toFixed(2);
    }
  }



  changeIgv(){
    this.updateIgv();
  }



  updatePercepcion(){
    if(this.percepcionActivated){
      if(this.percepInput==null||this.percepInput==''){
        this.ord.percepcion=(0.0).toFixed(5);
      }
      else{
        this.ord.percepcion=(parseFloat(this.percepInput)).toFixed(5);
      }
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.percepcion)).toFixed(2);
    }
    else{
      this.ord.percepcion=(0.0).toFixed(5);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.percepcion)).toFixed(2);
    } 
  }

  changePercep(){
    this.updatePercepcion();
/*     this.ord.percepcion=(parseFloat(this.percepInput)).toFixed(2);
    this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2); */
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

      this.dataSourceWarehouse.sort = this.sort.toArray()[0];



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

    this.listaOrd.forEach((a:OrdenItem)=>{
      if(e.checked){
        a.igv_enabled=false;
      }
      if(!e.checked){
        a.igv_enabled=false;
      }
      
    })

    this.updateIgv();

  }


  changeValorizado(e){
    console.log(e);
    if(e.checked){
      this.valorizadoSlideChecked=true;
    }
    if(!e.checked){
      this.valorizadoSlideChecked=false;
    }
    console.log(this.valorizadoSlideChecked);


  }


  searchItem(){

  }

  onFileChanged(event) {
    const file = event.target.files[0]
  }

  onUpload() {
    // upload code goes here
  }

/*   addItem(){
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
  } */




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
    this.dataSourceOrd.paginator = this.paginator.toArray()[0];
    this.dataSourceOrd.sort = this.sort.toArray()[0];
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
    this.dataSourceWarehouse.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceWarehouse.paginator) {
      this.dataSourceWarehouse.paginator.firstPage();
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

    this.fechaRegister= new Date();



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
                      this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','','','','0.0','','',0,'18','NO','NO','ALMACEN');
                      this.orden_item=new OrdenItem('',null,'','','','','',false,'','','',true);
                      this.igvActivated=true;
                      this.igvSlideDisabled=false;
                      this.valorizadoSlideChecked=true;
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
                    this.logisticaService.getActiveProviders().subscribe((provl:Proveedor[])=>{
                      this.listaProvidersActive=provl;
                    })



                    this.logisticaService.getAllWarehouseOrders().subscribe((resOrds:Orden[])=>{
                      console.log(this.listaOrdersWarehouse);
                      this.listaOrdersWarehouse=resOrds;
                      console.log(this.listaOrdersWarehouse);
                      this.dataSourceOrdersWarehouse = new MatTableDataSource(this.listaOrdersWarehouse);
                      this.dataSourceOrdersWarehouse.paginator = this.paginator.toArray()[0];
                      this.dataSourceOrdersWarehouse.sort = this.sort.toArray()[0];
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

  changeIgvToggleUnit(a:OrdenItem){

    a.igv_toggle=!a.igv_toggle;

    console.log(a.igv_toggle);

    this.updateIgv();
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
    console.log(this.ord);
    this.ord.area=this.user_area.name;
    if(this.ord.rebajado==''){
      this.ord.rebajado=(0.0).toFixed(2);
    }
    else{
      this.ord.rebajado=parseFloat(this.ord.rebajado).toFixed(2);
    }

    this.ord.razon_social=this.ord.razon_social.toUpperCase();
    this.ord.direccion=this.ord.direccion.toUpperCase();
    this.logisticaService.getLastOrdWarehouseCode(this.ord.numero,this.ord.destino,this.ord.empresa).subscribe(resi=>{
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
        this.ord.numero=codeArray[0]+'-'+numeracionStr;
      }
      else{
        this.ord.numero+='-0001';
      }

      //this.ord.numero='0001-PRUEBA';



      if(this.ord.moneda!=''&&this.ord.empresa!=''&&this.ord.ruc!=''&&this.ord.razon_social!=''&&this.ord.direccion!=''&&this.ord.destino!=''&&this.ord.fecha!=''){


        this.moneyText=this.numToText9Cifras(parseInt(this.ord.total))+' CON '+String(Math.ceil((parseFloat(this.ord.total)*100.0)%100))+'/100 ' + this.ord.moneda;




        this.logisticaService.addOrd(this.ord).subscribe(resAddOrd=>{
          console.log(resAddOrd);
          if(resAddOrd['session_id']){

            this.listaOrd.forEach((p:OrdenItem,ind)=>{

              console.log(this.items_ord_wh);

              var indexListExcel=this.items_ord_wh.findIndex(g=>g['1']==p.descripcion);
              console.log('iem encontrado',indexListExcel);
              this.items_ord_wh.splice(indexListExcel,1);


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

                  this.ord.numero='';
                  this.ord.tipo='COMPRA';
                  this.ord.estado='PENDIENTE';
                  this.ord.moneda='SOLES';
                  this.ord.ordItems=[];
                  this.ord.fecha=anio+'-'+mes+'-'+dia;
                  this.orden_item=new OrdenItem('',null,'','','','','',false,'','','',true);
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
                  this.ord.retencion=parseInt('0').toFixed(2);
                  this.ord.percepcion=parseInt('0').toFixed(2);
                  this.ord.total=parseInt('0').toFixed(2);
                  this.ord.rebajado='';
                  this.posTituloSala = 74;

                }
              });
            })

            this.dataSourceWarehouse = new MatTableDataSource(this.items_ord_wh);

            this.dataSourceWarehouse.sort = this.sort.toArray()[0];

            this.logisticaService.getAllWarehouseOrders().subscribe((resOrds:Orden[])=>{
              console.log(this.listaOrdersWarehouse);
              this.listaOrdersWarehouse=resOrds;
              console.log(this.listaOrdersWarehouse);
              this.dataSourceOrdersWarehouse = new MatTableDataSource(this.listaOrdersWarehouse);
              this.dataSourceOrdersWarehouse.paginator = this.paginator.toArray()[0];
              this.dataSourceOrdersWarehouse.sort = this.sort.toArray()[0];
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
    this.doc.text('CCI',105,94,{align:'center'});
    this.doc.text('FECHA COMPRA',165,94,{align:'center'});
    this.doc.setFont("helvetica","normal");

    this.doc.text(this.ord.tipo_pago,40,101,{align:'center'});
    this.doc.text(this.ord.num_cuenta,105,101,{align:'center'});
    this.doc.text(this.ord.fecha,165,101,{align:'center'});

    this.doc.line(10, 113, 200, 113, 'S');
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica","bold");
    this.doc.text('CTD',16,118,{align:'center'});
    this.doc.text('UND',29,118,{align:'center'});
    this.doc.text('DESCRIPCION',90,118,{align:'center'});
    this.doc.text('PRECIO UNIT.',156,118,{align:'center'});
    this.doc.text('SUBTOTAL',187,118,{align:'center'});
    this.doc.setFont("helvetica","normal");
    var pos_line=113;
    var pos_line_ini=pos_line;
    var pos_item=pos_line+5;
    this.listaOrd.forEach(m=>{
      console.log(pos_line)
      pos_line+=7;
      pos_item+=7;
      if(pos_item>280){

        this.doc.line(10, pos_line, 200, pos_line, 'S');
        this.doc.line(10, pos_line_ini, 10, pos_line, 'S');
        this.doc.line(22, pos_line_ini, 22, pos_line, 'S');
        this.doc.line(38, pos_line_ini, 38, pos_line, 'S');
        this.doc.line(140, pos_line_ini, 140, pos_line, 'S');
        this.doc.line(174, pos_line_ini, 174, pos_line, 'S');
        this.doc.line(200, pos_line_ini, 200, pos_line, 'S');
        this.doc.addPage();
        pos_line=20;
        pos_line_ini=pos_line;
        pos_item=pos_line+5;

      }
      this.doc.line(10, pos_line, 200, pos_line, 'S');
      this.doc.text(String(m.cantidad),16,pos_item,{align:'center'});
      this.doc.text(m.units,29,pos_item,{align:'center'});
      //this.doc.text(m.descripcion,40,pos_item);
      if(this.valorizadoSlideChecked){
        this.doc.text(m.unit_price,156,pos_item,{align:'center'});
        this.doc.text(m.subtotal,187,pos_item,{align:'center'});
      }

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
    this.doc.line(10, pos_line_ini, 10, pos_line, 'S');
    this.doc.line(22, pos_line_ini, 22, pos_line, 'S');
    this.doc.line(38, pos_line_ini, 38, pos_line, 'S');
    this.doc.line(140, pos_line_ini, 140, pos_line, 'S');
    this.doc.line(174, pos_line_ini, 174, pos_line, 'S');
    this.doc.line(200, pos_line_ini, 200, pos_line, 'S');

    if(this.valorizadoSlideChecked){
      if(pos_line>250){
        this.doc.addPage();
        pos_line=20;
      }
      pos_line+=10;
      this.doc.setFontSize(8);
      this.doc.setTextColor(183,18,18);
      this.doc.text('SON: '+this.moneyText,15,pos_line);
      pos_line+=9;
      this.doc.setFontSize(8);
      this.doc.setTextColor(0,0,0);
      this.doc.roundedRect(140, pos_line, 60, 28, 2, 2, 'S');
      pos_line+=5;
      this.doc.text('SUBTOTAL',142,pos_line);
      this.doc.text(this.prefijoMoney,166,pos_line);
      this.doc.text(this.ord.subtotal,197,pos_line,{align:'right'});
      pos_line+=7;
      this.doc.text('IGV',142,pos_line);
      this.doc.text(this.prefijoMoney,166,pos_line);
      this.doc.text(this.ord.igv,197,pos_line,{align:'right'});
      pos_line+=7;
      this.doc.text('PERCEPCIÓN',142,pos_line);
      this.doc.text(this.prefijoMoney,166,pos_line);
      this.doc.text(this.ord.percepcion,197,pos_line,{align:'right'});
      pos_line+=7;
      this.doc.text('MONTO INICIAL: '+this.prefijoMoney+' '+this.ord.rebajado,20,pos_line);
      this.doc.text('TOTAL',142,pos_line);
      this.doc.text(this.prefijoMoney,166,pos_line);
      this.doc.text(this.ord.total,197,pos_line,{align:'right'});
    }
    //console.log(this.doc.internal.getFontSize());

/*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */


    window.open(URL.createObjectURL(this.doc.output("blob")));


  }

  onNoClick(): void {
  }

  applyFilterDView(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceOrdersWarehouse.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceOrdersWarehouse.paginator) {
      this.dataSourceOrdersWarehouse.paginator.firstPage();
    }
  }

  generatePDFWarehouse(){

    this.doc = new jsPDF();


    this.img.src = 'assets/logo'+this.ordWarehouse.empresa+'.png';

    this.doc.addImage(this.img, 'png', 10, 10, 40, 40, '','FAST',0);
    this.doc.setFont("helvetica","bold");
    this.doc.setFontSize(18);
    this.doc.text('ORDEN DE '+ this.ordWarehouse.tipo,105,35,{align:'center'});
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(14);
    this.doc.text(this.ordWarehouse.destino,105,42,{align:'center'});
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(8);
    this.doc.text(this.ordWarehouse.destino_dir,105,50,{align:'center'});
    this.doc.roundedRect(65, 25, 80, 20, 2, 2, 'S');
    this.doc.rect(150, 28, 50, 14);
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(183,18,18);
    this.doc.text('ORDEN DE '+ this.ordWarehouse.tipo,175,33,{align:'center'});
    // this.doc.text('Nº '+ this.ord.numero,175-(((9+this.ord.numero.length)/2)*3),39);
    this.doc.text('Nº '+this.ordWarehouse.numero,175,39,{align:'center'});
    this.doc.setTextColor(0,0,0);
    this.doc.text('RUC',15,65);
    this.doc.text(': '+this.ordWarehouse.ruc,45,65);
    this.doc.text('PROVEEDOR',15,72);
    this.doc.text(': '+this.ordWarehouse.razon_social,45,72);
    this.doc.text('DIRECCION',15,79);
    this.doc.setFontSize(9);
    this.doc.text(': '+this.ordWarehouse.direccion,45,79);
    this.doc.setFontSize(9);
    this.doc.roundedRect(10, 89, 190, 14, 4, 4, 'S');
    this.doc.line(10, 96, 200, 96, 'S');
    this.doc.setFont("helvetica","bold");
    this.doc.text('CONDICIONES DE PAGO',40,94,{align:'center'});
    this.doc.text('CCI',105,94,{align:'center'});
    this.doc.text('FECHA COMPRA',165,94,{align:'center'});
    this.doc.setFont("helvetica","normal");

    this.doc.text(this.ordWarehouse.tipo_pago,40,101,{align:'center'});
    this.doc.text(this.ordWarehouse.num_cuenta,105,101,{align:'center'});
    this.doc.text(this.ordWarehouse.fecha,165,101,{align:'center'});

    this.doc.line(10, 113, 200, 113, 'S');
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica","bold");
    this.doc.text('CTD',16,118,{align:'center'});
    this.doc.text('UND',29,118,{align:'center'});
    this.doc.text('DESCRIPCION',90,118,{align:'center'});
    this.doc.text('PRECIO UNIT.',156,118,{align:'center'});
    this.doc.text('SUBTOTAL',187,118,{align:'center'});
    this.doc.setFont("helvetica","normal");
    var pos_line=113;
    var pos_line_ini=pos_line;
    var pos_item=pos_line+5;
    this.listaOrdWarehouse.forEach(m=>{
      console.log(pos_line)
      pos_line+=7;
      pos_item+=7;
      if(pos_item>280){

        this.doc.line(10, pos_line, 200, pos_line, 'S');
        this.doc.line(10, pos_line_ini, 10, pos_line, 'S');
        this.doc.line(22, pos_line_ini, 22, pos_line, 'S');
        this.doc.line(38, pos_line_ini, 38, pos_line, 'S');
        this.doc.line(140, pos_line_ini, 140, pos_line, 'S');
        this.doc.line(174, pos_line_ini, 174, pos_line, 'S');
        this.doc.line(200, pos_line_ini, 200, pos_line, 'S');
        this.doc.addPage();
        pos_line=20;
        pos_line_ini=pos_line;
        pos_item=pos_line+5;

      }
      this.doc.line(10, pos_line, 200, pos_line, 'S');
      this.doc.text(String(m.cantidad),16,pos_item,{align:'center'});
      this.doc.text(m.units,29,pos_item,{align:'center'});
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
    this.doc.line(10, pos_line_ini, 10, pos_line, 'S');
    this.doc.line(22, pos_line_ini, 22, pos_line, 'S');
    this.doc.line(38, pos_line_ini, 38, pos_line, 'S');
    this.doc.line(140, pos_line_ini, 140, pos_line, 'S');
    this.doc.line(174, pos_line_ini, 174, pos_line, 'S');
    this.doc.line(200, pos_line_ini, 200, pos_line, 'S');

    if(pos_line>250){
      this.doc.addPage();
      pos_line=20;
    }
    pos_line+=10;
    this.doc.setFontSize(8);
    this.doc.setTextColor(183,18,18);
    this.doc.text('SON: '+this.moneyTextWarehouse,15,pos_line);
    pos_line+=9;
    this.doc.setFontSize(8);
    this.doc.setTextColor(0,0,0);
    this.doc.roundedRect(140, pos_line, 60, 28, 2, 2, 'S');
    pos_line+=5;
    this.doc.text('SUBTOTAL',142,pos_line);
    this.doc.text(this.prefijoMoneyWarehouse,166,pos_line);
    this.doc.text(this.ordWarehouse.subtotal,197,pos_line,{align:'right'});
    pos_line+=7;
    this.doc.text('IGV',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ordWarehouse.igv,197,pos_line,{align:'right'});
    pos_line+=7;
    this.doc.text('PERCEPCIÓN',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ordWarehouse.percepcion,197,pos_line,{align:'right'});
    pos_line+=7;
    this.doc.text('MONTO INICIAL: '+this.prefijoMoneyWarehouse+' '+this.ordWarehouse.rebajado,20,pos_line);
    this.doc.text('TOTAL',142,pos_line);
    this.doc.text(this.prefijoMoneyWarehouse,166,pos_line);
    this.doc.text(this.ordWarehouse.total,197,pos_line,{align:'right'});
    //console.log(this.doc.internal.getFontSize());

/*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */


    window.open(URL.createObjectURL(this.doc.output("blob")));


  }

  reCreatePDFWarehouse(o:Orden){
    this.ordWarehouse=o;
    console.log(this.ordWarehouse);
    this.listaOrdWarehouse=[];
    if(this.ordWarehouse.moneda=='SOLES'){
      this.prefijoMoneyWarehouse='S/.'
    }
    if(this.ordWarehouse.moneda=='DOLARES AMERICANOS'){
      this.prefijoMoneyWarehouse='$'
    }
    this.moneyTextWarehouse=this.numToText9Cifras(parseInt(this.ordWarehouse.total))+' CON '+String(Math.ceil((parseFloat(this.ordWarehouse.total)*100.0)%100))+'/100 ' + this.ordWarehouse.moneda;
    this.logisticaService.getOrdenItemsByOrdenId(String(this.ordWarehouse.id)).subscribe((res:OrdenItem[])=>{
      if(res.length>0){
        console.log(res);
        this.listaOrdWarehouse=res;
        this.generatePDFWarehouse();
      }
    })
  }

  addReceiptWarehouse(a: Orden){
    var dialogRef;

    var anioRegister=this.fechaRegister.getFullYear();
    var mesRegister=this.fechaRegister.getMonth();
    var diaRegister=this.fechaRegister.getDate();

    if(mesRegister<10){
      mesRegister='0'+mesRegister;
    }
    if(diaRegister<10){
      diaRegister='0'+diaRegister;
    }

    var fechaRegisterStr = anioRegister+'-'+mesRegister+'-'+diaRegister;
  
    //this.receipt=new FondoItem(this.sala,this.fechaStr,'','','','','','','','PENDIENTE',0,this.user.user_id);
    this.receipt=new FondoItem('ORDEN',fechaRegisterStr,'','','',a.ruc,a.razon_social,a.total,'ORDEN','REGISTRADO',0,this.user.user_id,a.id);

    dialogRef=this.dialog.open(DialogAddReceiptWarehouse,{
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

  editReceiptWarehouse(a: Orden){
    var dialogRef;

    var anioRegister=this.fechaRegister.getFullYear();
    var mesRegister=this.fechaRegister.getMonth();
    var diaRegister=this.fechaRegister.getDate();

    if(mesRegister<10){
      mesRegister='0'+mesRegister;
    }
    if(diaRegister<10){
      diaRegister='0'+diaRegister;
    }

    var fechaRegisterStr = anioRegister+'-'+mesRegister+'-'+diaRegister;
  
    //this.receipt=new FondoItem(this.sala,this.fechaStr,'','','','','','','','PENDIENTE',0,this.user.user_id);
    this.receipt=new FondoItem('ORDEN',fechaRegisterStr,'','','','','','','ORDEN','REGISTRADO',0,this.user.user_id,a.id);

    dialogRef=this.dialog.open(DialogEditReceiptWarehouse,{
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


}

















@Component({
  selector: 'dialog-addReceiptWarehouse',
  templateUrl: 'dialog-addReceiptWarehouse.html',
  styleUrls: ['./warehouse.component.css']
})
export class DialogAddReceiptWarehouse implements OnInit {

  docs: string[] = ['FACTURA','BOLETA','RECIBO','HONORARIO','VOUCHER'];


  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogAddReceiptWarehouse>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

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

  save(){

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

  ngOnInit(): void {


  }

  confirm(){

    this.dialogRef.close(true);
  }

  cancel(){
    this.dialogRef.close(false);
  }


}











@Component({
  selector: 'dialog-editReceiptWarehouse',
  templateUrl: 'dialog-editReceiptWarehouse.html',
  styleUrls: ['./warehouse.component.css']
})
export class DialogEditReceiptWarehouse implements OnInit {

  docs: string[] = ['FACTURA','BOLETA','RECIBO','HONORARIO','VOUCHER'];


  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogEditReceiptWarehouse>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

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

  save(){

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

    this.data['item'].monto=parseFloat(this.data['item'].monto).toFixed(2);
    this.logisticaService.updateFondoItem(this.data['item']).subscribe(res=>{
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

  ngOnInit(): void {

    console.log(this.data['item']);

    this.logisticaService.getFondoItemsByOrdenId(this.data['item'].orden_id).subscribe((resFI:FondoItem)=>{
      console.log(resFI);
      this.data['item']=resFI;
    })

  }

  confirm(){

    this.dialogRef.close(true);
  }

  cancel(){
    this.dialogRef.close(false);
  }


}


