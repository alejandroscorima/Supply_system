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
import { FileUploadService } from '../file-upload.service';
import { Orden } from '../orden';
import { OrdenItem } from '../orden_item';


@Component({
  selector: 'app-view-orders',
  templateUrl: './view-orders.component.html',
  styleUrls: ['./view-orders.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ViewOrdersComponent implements OnInit {

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
  ordView: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,null,null,null,null,null,null,'');

  itemView: Item = new Item('',null,'','COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);

  listaOrdersView: Orden[]= [];

  listaOrdView: OrdenItem[]= [];

  dataSourceOrdersView: MatTableDataSource<Orden>;

  docView = new jsPDF();

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  previewView: any='';
  moneyTextView='';
  prefijoMoneyView='';

  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  unidades=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  aux_dec=['','ONCE','DOCE','TRECE','CATORCE','QUINCE']

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



  ngOnInit() {

    if(this.cookiesService.checkToken('session_id')){

      this.usersService.getSession(this.cookiesService.getToken('session_id')).subscribe((s:UserSession)=>{
        if(s){
          this.usersService.getUserById(s.user_id).subscribe((u:User)=>{
            if(u){
              this.userView=u;
              this.logisticaService.getAreaById(this.userView.area_id).subscribe((a:Area)=>{
                if(a){
                  this.user_areaView=a;
                  this.logisticaService.getCampusById(this.userView.campus_id).subscribe((c:Campus)=>{
                    if(c){
                      this.user_campusView=c;

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

            }
          });
        }
      })

    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

  onSubmitView() {
  }

}
