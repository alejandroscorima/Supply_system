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


@Component({
  selector: 'app-fondo',
  templateUrl: './fondo.component.html',
  styleUrls: ['./fondo.component.css']
})
export class FondoComponent implements OnInit {


  @ViewChild("content",{static:true}) content:ElementRef;

  dias=['SELECCIONAR','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'];

  meses=['SELECCIONAR','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SETIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];


  fondoItems: FondoItem[]=[];
  fondoLiquidaciones: FondoLiquidacion[]=[];

  user: User = new User('','','','','','',null,null,'','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  selection = new SelectionModel<FondoItem>(true, []);

  fecha;
  fechaStr;
  sala;
  campus:Campus[]=[];

  fondoItem;

  fondoLiquidacionId;

  total_amount=0;

  prefijoMoney='S/.';

  fondoLiquidacion: FondoLiquidacion;


  dataSourceFondoItem: MatTableDataSource<FondoItem>;
  dataSourceFondoLiq: MatTableDataSource<FondoLiquidacion>;

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



    editItem(it:FondoItem){

      var dialogRef;
  
      dialogRef=this.dialog.open(DialogEditItemFondo,{
        data:it,
      })
  
      dialogRef.afterClosed().subscribe(res => {
        if(res){
          this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res2:FondoItem[])=>{
            this.fondoItems=res2;
            this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
            this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
            this.dataSourceFondoItem.sort = this.sort.toArray()[0];
          })
        }
      })
  
    }
  
    delItem(it:FondoItem){
      var dialogRef;
      dialogRef=this.dialog.open(DialogConfirmFondo,{
        data:"Segur@ que desea eliminar el Item?",
      })
  
      dialogRef.afterClosed().subscribe(res => {
        if(res){
  
        }
      })
    }
  
    anular(fond: FondoLiquidacion){
      var dialogRef;
      dialogRef=this.dialog.open(DialogConfirmFondo,{
        data:"Segur@ que desea anular el Registro?",
      })
  
      dialogRef.afterClosed().subscribe(res => {
        if(res){
  
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
  
    dateChange(value){
  /*     var year= this.fecha.getFullYear();
      var month = this.fecha.getMonth()+1;
      if(month<10){
        month='0'+month;
      }
      var day = this.fecha.getDate();
      if(day<10){
        day='0'+day;
      }
      this.fechaStr=year+'-'+month+'-'+day;
  
      this.logisticaService.getFondoItems(this.sala,this.fechaStr).subscribe((res:FondoItem[])=>{
        this.fondoItems=res;
        this.dataSourceFondo = new MatTableDataSource(this.fondoItems);
        this.dataSourceFondo.paginator = this.paginator.toArray()[0];
        this.dataSourceFondo.sort = this.sort.toArray()[0];
  
      }) */
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
          this.logisticaService.getFondoLiquidacionesByCampus(this.sala,).subscribe((res:FondoLiquidacion[])=>{
            this.fondoLiquidaciones=res;
            this.dataSourceFondoLiq = new MatTableDataSource(this.fondoLiquidaciones);
            this.dataSourceFondoLiq.paginator = this.paginator.toArray()[1];
            this.dataSourceFondoLiq.sort = this.sort.toArray()[1];
  
  
            this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res:FondoItem[])=>{
              this.fondoItems=res;
              this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
              this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
              this.dataSourceFondoItem.sort = this.sort.toArray()[0];
              this.selection.clear();
  
             })
  
          })
        }
      })
  
    }
  
  
    addFondoItem(){
      var dialogRef;
  
      this.fondoItem=new FondoItem(this.sala,this.fechaStr,'','','','','','','','PENDIENTE',0,this.user.user_id);
  
      dialogRef=this.dialog.open(DialogNewItemFondo,{
        data:{item:this.fondoItem,
              date:this.fecha},
      })
  
      dialogRef.afterClosed().subscribe(res => {
        if(res){
          this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res2:FondoItem[])=>{
            this.fondoItems=res2;
            this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
            this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
            this.dataSourceFondoItem.sort = this.sort.toArray()[0];
          })
        }
      })
    }
  
  
    addFondoLiquidacion(){
      this.fondoLiquidacionId=0;
      this.fondoLiquidacion.fecha=this.fechaStr;
      this.fondoLiquidacion.campus=this.sala;
      this.fondoLiquidacion.campus_dir=this.user_campus.address;
      this.fondoLiquidacion.empresa=this.user_campus.company;
      this.fondoLiquidacion.importe='0.0';
      this.fondoLiquidacion.numero=this.user_campus.supply_ord_suffix;
      this.fondoLiquidacion.personal=this.user.first_name+' '+this.user.last_name;
      this.fondoLiquidacion.user_id=this.user.user_id;
      this.logisticaService.getLastFondoLiquidacionId().subscribe(respt=>{
        if(respt){
          this.fondoLiquidacionId=parseInt(String(respt['id']))+1;
        }
        else{
          this.fondoLiquidacionId=1;
        }
  
        this.logisticaService.getLastFondoLiquidacionNum(this.fondoLiquidacion.numero,this.fondoLiquidacion.campus,this.fondoLiquidacion.empresa).subscribe(resp=>{
          if(resp['numero']){
            var numStr='';
            var numArray = String(resp['numero']).split('-');
            if(parseInt(numArray[1])+1<10){
              numStr='000'+(parseInt(numArray[1])+1);
            }
            else if(parseInt(numArray[1])+1<100){
              numStr='00'+(parseInt(numArray[1])+1);
            }
            else if(parseInt(numArray[1])+1<1000){
              numStr='0'+(parseInt(numArray[1])+1);
            }
            else {
              numStr=String(parseInt(numArray[1])+1);
            }
            this.fondoLiquidacion.numero+='-';
            this.fondoLiquidacion.numero+=numStr;
          }
          else{
            this.fondoLiquidacion.numero+='-0001';
          }
          this.selection.selected.forEach((i,ind)=>{
            this.fondoLiquidacion.importe=(parseFloat(this.fondoLiquidacion.importe)+parseFloat(i.monto)).toFixed(2);
            i.liquidacion_id=this.fondoLiquidacionId;
            i.estado='REGISTRADO';
            this.logisticaService.updateFondoItem(i).subscribe(resr=>{
              if(ind==this.selection.selected.length-1&&resr){
                this.logisticaService.addFondoLiquidacion(this.fondoLiquidacion).subscribe(resss=>{
                  if(resss){
  
                    this.generatePDF(this.fondoLiquidacion);
  
                    if(this.user.supply_role=='ADMINISTRADOR'||this.user.supply_role=='SUPERUSUARIO'||this.user_area.name=='ABASTECIMIENTO'){
                      this.logisticaService.getAllCampus().subscribe((resi:Campus[])=>{
                        if(resi){
                          this.campus=resi;
                          this.logisticaService.getFondoLiquidacionesByCampus(this.sala).subscribe((liqs:FondoLiquidacion[])=>{
                            this.fondoLiquidaciones=liqs;
                            this.dataSourceFondoLiq = new MatTableDataSource(this.fondoLiquidaciones);
                            this.dataSourceFondoLiq.paginator = this.paginator.toArray()[1];
                            this.dataSourceFondoLiq.sort = this.sort.toArray()[1];
  
  
                            this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res:FondoItem[])=>{
                              this.fondoItems=res;
                              this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
                              this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
                              this.dataSourceFondoItem.sort = this.sort.toArray()[0];
                              this.selection.clear();
  
                             })
  
                          })
                        }
                      })
                    }
  
                    if(this.user.position=='ADMINISTRADOR'){
  
  
                      this.logisticaService.getFondoLiquidacionesByCampus(this.sala).subscribe((liqs:FondoLiquidacion[])=>{
                        this.fondoLiquidaciones=liqs;
                        this.dataSourceFondoLiq = new MatTableDataSource(this.fondoLiquidaciones);
                        this.dataSourceFondoLiq.paginator = this.paginator.toArray()[1];
                        this.dataSourceFondoLiq.sort = this.sort.toArray()[1];
  
                        this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res:FondoItem[])=>{
                          this.fondoItems=res;
                          this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
                          this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
                          this.dataSourceFondoItem.sort = this.sort.toArray()[0];
                          this.selection.clear();
  
                        })
  
  
                      })
  
  
                    }
                  }
                })
  
              }
            });
          })
        })
  
      })
  
    }
  
    reCreatePDF(fl:FondoLiquidacion){
      this.selection.clear();
      this.logisticaService.getFondoItemsByLiquidacionId(String(fl.id)).subscribe((res:FondoItem[])=>{
        if(res.length>0){
          res.forEach(a=>{
            this.selection.select(a);
          })
          this.generatePDF(fl);
        }
      })
    }
  
  
    generatePDF(fondliq:FondoLiquidacion){
      var empresaCompleto='';
      if(fondliq.empresa=='VISION'){
        empresaCompleto='VISION GAMES CORPORATION S.A.C.'
      }
      if(fondliq.empresa=='SUN'){
        empresaCompleto='SUN INVERSIONES S.A.C.'
      }
      if(fondliq.empresa=='IMG'){
        empresaCompleto='INVERSIONES MEGA GAMING S.A.C.'
      }
      if(fondliq.empresa=='GO'){
        empresaCompleto='GRUPO OSCORIMA S.A.C.'
      }
      if(fondliq.empresa=='WARI'){
        empresaCompleto='INVERSIONES WARI S.A.C.'
      }
  
      this.doc = new jsPDF();
  
      if(fondliq.campus.includes('OFICINA')){
        this.img.src = 'assets/logo'+fondliq.empresa+'.png';
      }
      else{
        this.img.src = 'assets/logo'+fondliq.campus+'.png';
      }
  
      this.doc.addImage(this.img, 'png', 10, 10, 40, 40, '','FAST',0);
      this.doc.setFont("helvetica","bold");
      this.doc.setFontSize(12);
      this.doc.text(empresaCompleto,100,29,{align:'center'});
      this.doc.setFont("helvetica","normal");
      this.doc.setFontSize(12);
      this.doc.text(fondliq.campus,100,36,{align:'center'});
      this.doc.setFont("helvetica","normal");
      this.doc.setFontSize(8);
      if(fondliq.campus_dir.length<63){
        this.doc.text(fondliq.campus_dir,100,43,{align:'center'});
      }
      else{
        var direccionArray=fondliq.campus_dir.split(',');
        this.doc.text(direccionArray[0],100,43,{align:'center'});
        this.doc.text(direccionArray[1],100,48,{align:'center'});
      }
  
      //this.doc.roundedRect(65, 25, 80, 20, 2, 2, 'S');
  
  
      if(this.user_area.name=='ABASTECIMIENTO'){
        this.doc.rect(150, 21, 50, 21);
        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(10);
        this.doc.setTextColor(0,0,0);
        this.doc.text('LOGISTICA',175,33,{align:'center'});
        this.doc.setFontSize(9);
        this.doc.setTextColor(0,0,0);
        this.doc.text('LIQUIDACION DE FONDO FIJO',175,26,{align:'center'});
      }
      else{
        this.doc.rect(150, 28, 50, 14);
        this.doc.setFont("helvetica","normal");
        this.doc.setFontSize(10);
        this.doc.setTextColor(0,0,0);
        this.doc.text('FONDO FIJO',175,26,{align:'center'});
        this.doc.text('LIQUIDACION DE CHEQUE',175,33,{align:'center'});
      }
      this.doc.setFont("helvetica","normal");
      this.doc.setFontSize(10);
      this.doc.setTextColor(0,0,0);
      // this.doc.text('Nº '+ this.ord.numero,175-(((9+this.ord.numero.length)/2)*3),39);
      this.doc.text('Nº '+fondliq.numero,175,39,{align:'center'});
      this.doc.text('FECHA: '+fondliq.fecha,175,49,{align:'center'});
      this.doc.text('IMPORTE: '+this.prefijoMoney+' '+fondliq.importe,175,56,{align:'center'});
      this.doc.setTextColor(0,0,0);
      this.doc.text('BANCO',15,58);
      this.doc.text(': CONTINENTAL',45,58);
      this.doc.text('RENDIDO POR',15,65);
      this.doc.text(': '+fondliq.personal,45,65);
  /*     this.doc.text('DIRECCION',15,79);
      this.doc.setFontSize(11); */
  /*     this.doc.text(': '+fondliq.campus_dir,45,79);
      this.doc.setFontSize(12); */
      this.doc.line(10, 75, 200, 75,'S');
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica","bold");
      this.doc.text('FECHA',19,80,{align:'center'});
      this.doc.text('TIPO DOC',36,80,{align:'center'});
      this.doc.text('SERIE',51,80,{align:'center'});
      this.doc.text('Nº DOC.',65,80,{align:'center'});
      this.doc.text('RUC',85,80,{align:'center'});
      this.doc.text('RAZON SOCIAL',98,80,{align:'left'});
      this.doc.text('MONTO',192,80,{align:'center'});
      var pos_line=75;
      var pos_item=pos_line+5;
      this.doc.setFont("helvetica","normal");
      this.selection.selected.forEach(m=>{
        pos_line+=7;
        pos_item+=7;
        this.doc.line(10, pos_line, 200, pos_line, 'S');
        this.doc.text(String(m.fecha),19,pos_item,{align:'center'});
        this.doc.text(String(m.tipo_doc),36,pos_item,{align:'center'});
        this.doc.text(String(m.serie),51,pos_item,{align:'center'});
        this.doc.text(String(m.numero),65,pos_item,{align:'center'});
        this.doc.text(String(m.ruc),85,pos_item,{align:'center'});
        this.doc.setFontSize(8);
        if(m.raz_social.length<=47){
          this.doc.text(m.raz_social,98,pos_item);
        }
        else{
          if(m.raz_social.length<=94){
            this.doc.text(m.raz_social.substring(0,47),98,pos_item);
            pos_line+=7;
            pos_item+=7;
            this.doc.text(m.raz_social.substring(47,m.raz_social.length),98,pos_item);
          }
          else{
            this.doc.text(m.raz_social.substring(0,47),98,pos_item);
            pos_line+=7;
            pos_item+=7;
            this.doc.text(m.raz_social.substring(47,94),98,pos_item);
            pos_line+=7;
            pos_item+=7;
            this.doc.text(m.raz_social.substring(94,m.raz_social.length),98,pos_item);
          }
        }
  
        this.doc.setFontSize(8);
        this.doc.text(m.monto,192,pos_item,{align:'center'});
      })
      pos_line+=7;
      this.doc.line(10, pos_line, 200, pos_line, 'S');
  
      this.doc.line(10, 75, 10, pos_line, 'S');
      this.doc.line(28, 75, 28, pos_line, 'S');
      this.doc.line(28, 75, 28, pos_line, 'S');
      this.doc.line(45, 75, 45, pos_line, 'S');
      this.doc.line(57, 75, 57, pos_line, 'S');
      this.doc.line(74, 75, 74, pos_line, 'S');
      this.doc.line(97, 75, 97, pos_line, 'S');
      this.doc.line(184, 75, 184, pos_line, 'S');
      this.doc.line(200, 75, 200, pos_line, 'S');
  /*    pos_line+=10;
      this.doc.setFontSize(9);
      this.doc.setTextColor(183,18,18);
      this.doc.text('SON: '+fondliq.importe,15,pos_line); */
      pos_line+=7;
      this.doc.setFontSize(12);
      this.doc.setTextColor(0,0,0);
      this.doc.roundedRect(140, pos_line, 60, 7, 2, 2, 'S');
      this.doc.setFont("helvetica","bold");
      this.doc.text('TOTAL',142,pos_line+5);
  /*     this.doc.text('IGV',142,pos_line+12);
      this.doc.text('REBAJADO: '+this.prefijoMoney+' '+fondliq.importe,20,pos_line+19);
      this.doc.text('TOTAL',142,pos_line+19); */
      this.doc.text(this.prefijoMoney,166,pos_line+5);
  /*     this.doc.text(this.prefijoMoney,166,pos_line+12);
      this.doc.text(this.prefijoMoney,166,pos_line+19); */
      this.doc.text(fondliq.importe,197,pos_line+5,{align:'right'});
  /*     this.doc.text(fondliq.importe,197,pos_line+12,{align:'right'});
      this.doc.text(fondliq.importe,197,pos_line+19,{align:'right'}); */
      //console.log(this.doc.internal.getFontSize());
  
  /*       this.doc.roundedRect(0, 100, 210, 10, 0, 0, 'S'); */
  
  
      window.open(URL.createObjectURL(this.doc.output("blob")));
  
  
  /*     if(true){
  
          this.doc = new jsPDF();
  
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
  
  
  
  
  
    ngOnInit() {
  
      this.fecha=new Date();
      var year= this.fecha.getFullYear();
      var month = this.fecha.getMonth()+1;
      if(month<10){
        month='0'+month;
      }
      var day = this.fecha.getDate();
      if(day<10){
        day='0'+day;
      }
      this.fechaStr=year+'-'+month+'-'+day;
  
      this.fondoLiquidacion=new FondoLiquidacion('','','','','','','',this.user.user_id);
  
  
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
  
  
                      if(this.user.supply_role=='ADMINISTRADOR'||this.user.supply_role=='SUPERUSUARIO'||this.user_area.name=='ABASTECIMIENTO'){
                        this.logisticaService.getAllCampus().subscribe((resi:Campus[])=>{
                          if(resi){
                            this.campus=resi;
                            this.logisticaService.getFondoLiquidacionesByCampus(this.sala).subscribe((liqs:FondoLiquidacion[])=>{
                              this.fondoLiquidaciones=liqs;
                              this.dataSourceFondoLiq = new MatTableDataSource(this.fondoLiquidaciones);
                              this.dataSourceFondoLiq.paginator = this.paginator.toArray()[0];
                              this.dataSourceFondoLiq.sort = this.sort.toArray()[0];
  
                              this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res:FondoItem[])=>{
                                this.fondoItems=res;
                                this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
                                this.dataSourceFondoItem.paginator = this.paginator.toArray()[1];
                                this.dataSourceFondoItem.sort = this.sort.toArray()[1];
                              })
  
                            })
                          }
                        })
                      }
  
                      if(this.user.position=='ADMINISTRADOR'){
                        this.logisticaService.getFondoItems(this.sala,'PENDIENTE',this.user.user_id).subscribe((res:FondoItem[])=>{
                          this.fondoItems=res;
                          this.dataSourceFondoItem = new MatTableDataSource(this.fondoItems);
                          this.dataSourceFondoItem.paginator = this.paginator.toArray()[0];
                          this.dataSourceFondoItem.sort = this.sort.toArray()[0];
  
                          this.logisticaService.getFondoLiquidacionesByCampus(this.sala).subscribe((liqs:FondoLiquidacion[])=>{
                            this.fondoLiquidaciones=liqs;
                            this.dataSourceFondoLiq = new MatTableDataSource(this.fondoLiquidaciones);
                            this.dataSourceFondoLiq.paginator = this.paginator.toArray()[1];
                            this.dataSourceFondoLiq.sort = this.sort.toArray()[1];
                          })
  
                        })
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
  selector: 'dialog-newItemFondo',
  templateUrl: 'dialog-newItemFondo.html',
  styleUrls: ['./fondo.component.css']
})
export class DialogNewItemFondo implements OnInit {

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
  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null);

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','');
  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null);

  listaReq: Item[]= [];
  categories:any= [];

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
    public dialogRef: MatDialogRef<DialogNewItemFondo>,
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
    this.logisticaService.getAllCategories().subscribe(res=>{
      if(res){
        this.categories=res;
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



  ChangeCategory(){
  }





}






@Component({
  selector: 'dialog-editItemFondo',
  templateUrl: 'dialog-editItemFondo.html',
  styleUrls: ['./fondo.component.css']
})
export class DialogEditItemFondo implements OnInit {

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
  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null);

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','');
  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null);

  listaReq: Item[]= [];
  categories:any= [];

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
    public dialogRef: MatDialogRef<DialogEditItemFondo>,
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
    var dateArr=this.data.fecha.split('-');
    this.date= new Date(parseInt(dateArr[0]),parseInt(dateArr[1])-1,parseInt(dateArr[2]));
    console.log(this.date);
    this.logisticaService.getAllCategories().subscribe(res=>{
      if(res){
        this.categories=res;
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



  ChangeCategory(){
  }





}







@Component({
  selector: 'dialog-confirmFondo',
  templateUrl: 'dialog-confirm.html',
  styleUrls: ['./fondo.component.css']
})
export class DialogConfirmFondo implements OnInit {


  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmFondo>,
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
