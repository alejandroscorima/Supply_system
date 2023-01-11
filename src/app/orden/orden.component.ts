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


@Component({
  selector: 'app-nuevo',
  templateUrl: './orden.component.html',
  styleUrls: ['./orden.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class OrdenComponent implements OnInit {

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

  personal: User[]= [];

  empresas: string[] = ['SUN','VISION','GO','IMG','WARI'];
  monedas: string[] = ['SOLES','DOLARES AMERICANOS'];

  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  unidades=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  aux_dec=['','ONCE','DOCE','TRECE','CATORCE','QUINCE']

  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,'','','');

  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null,null);

  listaOrd: OrdenItem[]= [];

  prefijoMoney='';
  moneyText='';

  dataSourceOrd: MatTableDataSource<OrdenItem>;
  selection = new SelectionModel<Item>(true, []);

  doc = new jsPDF();

  img = new Image();

  posTituloSala;

  igvActivated;
  retencionActivated;
  percepcionActivated;

  igvSlideChecked: boolean;
  igvSlideDisabled: boolean;

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

  userView: User = new User('','','','','','',null,null,'','');
  area_chiefView='';
  user_areaView: Area = new Area('',null);
  user_campusView: Campus = new Campus('','','','','','');

  reqView: Requerimiento = new Requerimiento('','','','','','','',[],'0','PENDIENTE',null);
  ordView: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,null,null,null);

  itemView: Item = new Item('',null,'','COMPRA','PENDIENTE','',null,'0','','','','','','','','','','');

  listaOrdersView: Orden[]= [];

  listaOrdView: OrdenItem[]= [];

  dataSourceOrdersView: MatTableDataSource<Orden>;

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
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
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
        this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
      }
    }
    else{
      this.igvSlideChecked=false;
      this.igvSlideDisabled=true;
      this.ord.igv=(0.0).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    }
  }

  updateRetencion(){
    if(this.retencionActivated){
      if(this.ord.retencion_percent==null||this.ord.retencion_percent==''){
        this.ord.retencion=(0.0).toFixed(2);
      }
      else{
        this.ord.retencion=((parseFloat(this.ord.retencion_percent)*parseFloat(this.ord.subtotal))/100).toFixed(2);
      }

      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    }
    else{
      this.ord.retencion=(0.0).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    } 
  }

  updatePercepcion(){
    if(this.percepcionActivated){
      if(this.percepInput==null||this.percepInput==''){
        this.ord.percepcion=(0.0).toFixed(2);
      }
      else{
        this.ord.percepcion=(parseFloat(this.percepInput)).toFixed(2);
      }
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    }
    else{
      this.ord.percepcion=(0.0).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2);
    } 
  }

  changeRet(){
    this.updateRetencion();
  }

  changePercep(){
    this.updatePercepcion();
/*     this.ord.percepcion=(parseFloat(this.percepInput)).toFixed(2);
    this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)+parseFloat(this.ord.retencion)+parseFloat(this.ord.percepcion)).toFixed(2); */
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

  editItem(a:OrdenItem,i){

    console.log(a);
    this.orden_item.cantidad=a.cantidad;
    this.orden_item.descripcion=a.descripcion;
    this.orden_item.unit_price=a.unit_price;
    console.log(this.orden_item);
    this.listaOrd.splice(i,1);
    this.ord.subtotal='0.0';
    this.listaOrd.forEach((oi:OrdenItem)=>{
    this.ord.subtotal=(parseFloat(this.ord.subtotal)+parseFloat(oi.subtotal)).toFixed(2);
    })
    this.ord.igv=(parseFloat(this.ord.subtotal)*0.18).toFixed(2);
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
                      this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','','','','');
                      this.orden_item=new OrdenItem('',null,'','','','');
                      this.igvActivated=true;
                      this.igvSlideDisabled=false;
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

                    //vieworders
                    this.fechaView=new Date();
                    this.anioView=this.fechaView.getFullYear();
                    this.mesView=this.fechaView.getMonth()+1;
                    this.diaView=this.fechaView.getDate();

                    if(this.mesView<10){
                      this.mesView='0'+this.mesView;
                    }
                    if(this.diaView<10){
                      this.diaView='0'+this.diaView;
                    }

                    this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
                      if(as){
                        this.areasView=as;
                      }
                      this.logisticaService.getAllCampus().subscribe((ac:Campus[])=>{
                        if(ac){
                          this.campusView=ac;
                        }
                        this.logisticaService.getAllOrders().subscribe((resOrds:Orden[])=>{
                          this.listaOrdersView=resOrds;
                          this.dataSourceOrdersView = new MatTableDataSource(this.listaOrdersView);
                          this.dataSourceOrdersView.paginator = this.paginator.toArray()[0];
                          this.dataSourceOrdersView.sort = this.sort.toArray()[0];
                        })
                      })
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

                  this.ord=new Orden(0,'','','','','','','','','','','COMPRA',[],'PENDIENTE','','SOLES','','','','','','','');
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
                  this.ord.retencion=parseInt('0').toFixed(2);
                  this.ord.percepcion=parseInt('0').toFixed(2);
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
    this.doc.text('CCI',105,94,{align:'center'});
    this.doc.text('FECHA COMPRA',165,94,{align:'center'});
    this.doc.setFont("helvetica","normal");

    this.doc.text(this.ord.tipo_pago,40,101,{align:'center'});
    this.doc.text(this.ord.num_cuenta,105,101,{align:'center'});
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
    this.doc.roundedRect(140, pos_line, 60, 27, 2, 2, 'S');
    pos_line+=5;
    this.doc.text('SUBTOTAL',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.subtotal,197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('IGV',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.igv,197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('Retencion('+this.ord.retencion_percent+'%)',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.retencion,197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('Percepcion',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.percepcion,197,pos_line,{align:'right'});
    pos_line+=5;
    this.doc.text('MONTO INICIAL: '+this.prefijoMoney+' '+this.ord.rebajado,20,pos_line);
    this.doc.text('TOTAL',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.total,197,pos_line,{align:'right'});
    //console.log(this.doc.internal.getFontSize());

/*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */


    window.open(URL.createObjectURL(this.doc.output("blob")));


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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceOrdersView.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceOrdersView.paginator) {
      this.dataSourceOrdersView.paginator.firstPage();
    }
  }

  logoutView(){
    var session_id=this.cookiesService.getToken('session_id');
    this.usersService.deleteSession(session_id).subscribe(resDel=>{
      if(resDel){
        this.cookiesService.deleteToken('session_id');
        location.reload();
      }
    })
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
        this.generatePDFView();
      }
    })
  }


  generatePDFView(){

    this.docView = new jsPDF();

    this.imgView.src = 'assets/logo'+this.ordView.empresa+'.png';
    this.docView.addImage(this.imgView, 'png', 10, 10, 40, 40, '','FAST',0);
    this.docView.setFont("helvetica","bold");
    this.docView.setFontSize(18);
    this.docView.text('ORDEN DE '+ this.ordView.tipo,105,35,{align:'center'});
    this.docView.setFont("helvetica","normal");
    this.docView.setFontSize(14);
    this.docView.text(this.ordView.destino,105,42,{align:'center'});
    this.docView.setFont("helvetica","normal");
    this.docView.setFontSize(8);
    this.docView.text(this.ordView.destino_dir,105,50,{align:'center'});
    this.docView.roundedRect(65, 25, 80, 20, 2, 2, 'S');
    this.docView.rect(150, 28, 50, 14);
    this.docView.setFont("helvetica","normal");
    this.docView.setFontSize(9);
    this.docView.setTextColor(183,18,18);
    this.docView.text('ORDEN DE '+ this.ordView.tipo,175,33,{align:'center'});
    // this.doc.text('Nº '+ this.ord.numero,175-(((9+this.ord.numero.length)/2)*3),39);
    this.docView.text('Nº '+this.ordView.numero,175,39,{align:'center'});
    this.docView.setTextColor(0,0,0);
    this.docView.text('RUC',15,65);
    this.docView.text(': '+this.ordView.ruc,45,65);
    this.docView.text('PROVEEDOR',15,72);
    this.docView.text(': '+this.ordView.razon_social,45,72);
    this.docView.text('DIRECCION',15,79);
    this.docView.setFontSize(9);
    this.docView.text(': '+this.ordView.direccion,45,79);
    this.docView.setFontSize(9);
    this.docView.roundedRect(10, 89, 190, 14, 4, 4, 'S');
    this.docView.line(10, 96, 200, 96, 'S');
    this.docView.setFont("helvetica","bold");
    this.docView.text('CONDICIONES DE PAGO',40,94,{align:'center'});
    this.docView.text('CCI',105,94,{align:'center'});
    this.docView.text('FECHA COMPRA',165,94,{align:'center'});
    this.docView.setFont("helvetica","normal");

    this.docView.text(this.ordView.tipo_pago,40,101,{align:'center'});
    this.docView.text(this.ordView.num_cuenta,105,101,{align:'center'});
    this.docView.text(this.ordView.fecha,165,101,{align:'center'});

    this.docView.line(10, 113, 200, 113, 'S');
    this.docView.setFontSize(8);
    this.docView.setFont("helvetica","bold");
    this.docView.text('CANTIDAD',24,118,{align:'center'});
    this.docView.text('DESCRIPCION',90,118,{align:'center'});
    this.docView.text('PRECIO UNIT.',156,118,{align:'center'});
    this.docView.text('SUBTOTAL',187,118,{align:'center'});
    this.docView.setFont("helvetica","normal");
    var pos_line=113;
    var pos_item=pos_line+5;
    this.listaOrdView.forEach(m=>{
      pos_line+=7;
      pos_item+=7;
      this.docView.line(10, pos_line, 200, pos_line, 'S');
      this.docView.text(String(m.cantidad),24,pos_item,{align:'center'});
      //this.doc.text(m.descripcion,40,pos_item);
      this.docView.text(m.unit_price,156,pos_item,{align:'center'});
      this.docView.text(m.subtotal,187,pos_item,{align:'center'});
      this.docView.setFontSize(8);
      if(m.descripcion.length<=50){
        this.docView.text(m.descripcion,40,pos_item);
      }
      else{
        if(m.descripcion.length<=100){
          console.log(m.descripcion.substring(0,50));
          this.docView.text(m.descripcion.substring(0,50),40,pos_item);
          pos_line+=7;
          pos_item+=7;
          this.docView.text(m.descripcion.substring(50,m.descripcion.length),40,pos_item);
        }
        else{
          if(m.descripcion.length<=150){
            this.docView.text(m.descripcion.substring(0,50),40,pos_item);
            pos_line+=7;
            pos_item+=7;
            this.docView.text(m.descripcion.substring(50,100),40,pos_item);
            pos_line+=7;
            pos_item+=7;
            this.docView.text(m.descripcion.substring(100,m.descripcion.length),40,pos_item);

          }
        }
      }
    })
    pos_line+=7;
    this.docView.line(10, pos_line, 200, pos_line, 'S');
    this.docView.line(10, 113, 10, pos_line, 'S');
    this.docView.line(38, 113, 38, pos_line, 'S');
    this.docView.line(140, 113, 140, pos_line, 'S');
    this.docView.line(174, 113, 174, pos_line, 'S');
    this.docView.line(200, 113, 200, pos_line, 'S');
    pos_line+=10;
    this.docView.setFontSize(8);
    this.docView.setTextColor(183,18,18);
    this.docView.text('SON: '+this.moneyTextView,15,pos_line);
    pos_line+=9;
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
    //console.log(this.doc.internal.getFontSize());

  /*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */


    window.open(URL.createObjectURL(this.docView.output("blob")));

  }

  onSubmitView() {
  }

  anularView(orden: Orden){
    var dialogRef;
    dialogRef=this.dialog.open(DialogConfirmOrden,{
      data:"Segur@ que desea anular la orden?",
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){

        this.ordView=orden;
        console.log(this.ordView);
        this.listaOrdView=[];
        this.logisticaService.getOrdenItemsByOrdenId(String(this.ordView.id)).subscribe((resp:OrdenItem[])=>{
          if(resp.length>0){
            this.listaOrdView=resp;
            
          }
          console.log(this.listaOrdView);

          this.ord.tipo=this.ordView.tipo;
          this.ord.destino=this.ordView.destino;
          this.asigChange();
          this.ord.moneda=this.ordView.moneda;
          this.asigMoneyChange();
          var fechaArrAux=this.ordView.fecha.split('-');
          this.fecha=new Date(parseInt(fechaArrAux[0]),parseInt(fechaArrAux[1])-1,parseInt(fechaArrAux[2])) ;
          this.ord.tipo_pago=this.ordView.tipo_pago;
          this.ord.ruc=this.ordView.ruc
          this.ord.razon_social=this.ordView.razon_social;
          this.ord.direccion=this.ordView.direccion;
          this.ord.num_cuenta=this.ordView.num_cuenta;
          this.listaOrdView.forEach(element => {
            this.orden_item.cantidad=element.cantidad;
            this.orden_item.descripcion=element.descripcion;
            this.orden_item.unit_price=element.unit_price;
            this.addItem();
          });
          
        })

        const tabCount=2;
        this.demo1TabIndex = (this.demo1TabIndex+1) % tabCount;

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








@Component({
  selector: 'dialog-confirmOrden',
  templateUrl: 'dialog-confirmOrden.html',
  styleUrls: ['./orden.component.css']
})
export class DialogConfirmOrden implements OnInit {


  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmOrden>,
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