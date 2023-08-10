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
import { Console } from 'console';
import { SelectionModel } from '@angular/cdk/collections';
import { Orden } from '../orden';
import { OrdenItem } from '../orden_item';
import { Proveedor } from '../proveedor';
import { Area } from '../area';
import { Campus } from '../campus';
import { FileUploadService } from '../file-upload.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatStepper } from '@angular/material/stepper';
import { Collaborator } from '../collaborator';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {


  @ViewChild("content",{static:true}) content:ElementRef;

  dias=['SELECCIONAR','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'];

  meses=['SELECCIONAR','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SETIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];


  reqPendientes: Requerimiento[]=[];
  reqProceso: Requerimiento[]=[];
  reqFin: Requerimiento[]=[];

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string ='';


  dataSourceSale: MatTableDataSource<Item>;


  doc = new jsPDF();
  img = new Image();

  cont_pend;
  cont_asig;
  cont_fina;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  @ViewChild(MatSidenav) sidenav!: MatSidenav;



  constructor(private clientesService: ClientesService, private dialogo: MatDialog,
    private snackBar: MatSnackBar, private router: Router,
    private logisticaService: LogisticaService,
    private cookiesService: CookiesService,
    private usersService: UsersService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    ) { }



  applyFilterCompra(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSale.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceSale.paginator) {
      this.dataSourceSale.paginator.firstPage();
    }
  }



  showReqDetails(req:Requerimiento){
    var dialogRef;

    if(this.user_role=='SUPER USUARIO'||this.user_role=='SUPER ADMINISTRADOR'){
      dialogRef=this.dialog.open(DialogDetalleReqAdm,{
        data:req
      })

      dialogRef.afterClosed().subscribe(res => {
        if(res){
          location.reload();
        }
      })
    }

    if(this.user_role=='ADMINISTRADOR'||this.user_role=='ASISTENTE'){
      dialogRef=this.dialog.open(DialogDetalleReqAsist,{
        data:{req:req,user_id:this.user.user_id}
      })

      dialogRef.afterClosed().subscribe(res => {
        if(res){
          location.reload();
        }
      })
    }

    if(this.user_role=='USUARIO'||this.user_role=='USUARIO AVANZADO'){
      dialogRef=this.dialog.open(DialogDetalleReqUsr,{
        data:req
      })

      dialogRef.afterClosed().subscribe(res => {
        if(res){
          location.reload();
        }
      })
    }


  }


  logout(){

    this.cookiesService.deleteToken('user_id');
    this.cookiesService.deleteToken('user_role');
    location.reload();
  
  }





  ngOnInit() {
    if(this.cookiesService.checkToken('user_id')){
      this.user_id=parseInt(this.cookiesService.getToken('user_id'));
      this.user_role=this.cookiesService.getToken('user_role');
      console.log(this.user_role);
      this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
        console.log(u);
        this.user=u;
        this.usersService.getCollaboratorById(this.user.colab_id).subscribe((c:Collaborator)=>{
          this.colab=c;
          this.logisticaService.getAreaById(this.colab.area_id).subscribe((ar:Area)=>{
            if(ar){
              this.user_area=ar;
              this.logisticaService.getCampusById(this.colab.campus_id).subscribe((camp:Campus)=>{
                if(camp){
                  this.user_campus=camp;

  
                }
              })
  
            }
          })
        })

        this.logisticaService.getReqsPendientesNew(this.user_role,String(this.user.user_id),this.user.user_id).subscribe((res:Requerimiento[])=>{
          this.reqPendientes=res;
          this.cont_pend =this.reqPendientes.length;
          /* res.forEach(res => {
            console.log(res+"req pendiente"+conta)
            conta = conta + 1
          });
          console.log(res+'fin'+conta); */ //Se observa cómo se obtiene cada req
        })

        this.logisticaService.getReqsProcesoNew(this.user_role,String(u.user_id),this.user.user_id).subscribe((res:Requerimiento[])=>{
          this.reqProceso=res;
          this.cont_asig =this.reqProceso.length;
          if(this.user_role=='ASISTENTE'||this.user_role=='ADMINISTRADOR'){
            this.reqProceso.forEach((rp:Requerimiento,ind)=>{
              this.logisticaService.getReqDetailsAprobByCode(rp.codigo,String(this.user.user_id)).subscribe((rpt:Item[])=>{
                var cantFin=0;
                rpt.forEach(m=>{
                  if(m.estado=='ENTREGADO'){
                    cantFin+=1;
                  }
                })
                if(cantFin==rpt.length){
                  this.reqProceso.splice(ind,1);
                  setTimeout(()=>{
                    this.reqFin.push(rp);
                  },500)
                }
              })
            })
          }
        })

        this.logisticaService.getReqsFinNew(this.user_role,String(u.user_id),this.user.user_id).subscribe((res:Requerimiento[])=>{
          this.reqFin=res;
          this.cont_fina =this.reqFin.length;
        })

      });


    }
    else{
      this.router.navigateByUrl('/login');
    }

  }




}




@Component({
  selector: 'dialog-detalleReqAdm',
  templateUrl: 'dialog-detalleReqAdm.html',
  styleUrls: ['./inicio.component.css']
})
export class DialogDetalleReqAdm implements OnInit {

  salas = [];
  areas = [];
  prioridades = [];

  fecha;
  anio;
  mes;
  dia;

  hour;
  minutes;
  seconds;

  id_selected='';

  personal: User[]= [];

  req: Requerimiento = new Requerimiento('bbb',null,null,null,null,null,null,[],null,'PENDIENTE',null);

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);

  dataSourceReq: MatTableDataSource<Item>;
  dataSourceReqDetAll: MatTableDataSource<Item>;
  selection = new SelectionModel<Item>(true, []);

/*   @ViewChild(MatPaginator, { static: false }) paginator2= new QueryList<MatPaginator>();
  @ViewChild(MatSort, { static: false }) sort2= new QueryList<MatSort>(); */

  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogDetalleReqAdm>,
    @Inject(MAT_DIALOG_DATA) public data:Requerimiento,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) {}

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReq.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceReq.paginator) {
      this.dataSourceReq.paginator.firstPage();
    }
  }

  viewImage(image_url){
    var dialogRef;
    dialogRef=this.dialog.open(DialogViewImage,{
      data:image_url
    })

    dialogRef.afterClosed().subscribe()
  }


  ngOnInit(): void {

    this.req=this.data;
    console.log(this.req);

    this.logisticaService.getReqDetailsPendByCode(this.data.codigo,this.data.id_asignado).subscribe((respu:Item[])=>{
      this.req.items=respu;
      this.dataSourceReq = new MatTableDataSource(this.req.items);
      this.dataSourceReq.paginator = this.paginator2.toArray()[0];
      this.dataSourceReq.sort = this.sort2.toArray()[0];
      this.usersService.getPersonalNew(1).subscribe((pers:User[])=>{
        this.personal=pers;
      })
    })

    if(this.data.estado!='PENDIENTE'){
      this.logisticaService.getReqDetailsByCode(this.data.codigo).subscribe((respu:Item[])=>{
        respu.forEach(h=>{
          this.usersService.getUserByIdNew(h.id_asignado).subscribe((resi:User)=>{
            h.name_asignado=resi.first_name+' '+resi.paternal_surname+' '+resi.maternal_surname;
          })
        })
        this.dataSourceReqDetAll = new MatTableDataSource(respu);
        this.dataSourceReqDetAll.paginator = this.paginator2.toArray()[1];
        this.dataSourceReqDetAll.sort = this.sort2.toArray()[1];
      })
    }


  }

  asigChange(){
    if(this.req.id_asignado=='0'){
      this.req.id_asignado='';
    }
    this.req.id_asignado=this.req.id_asignado+'U'+this.id_selected+',';
  }

  btnAsignar(){
    this.fecha=new Date();
    this.anio=this.fecha.getFullYear();
    this.mes=this.fecha.getMonth()+1;
    this.dia=this.fecha.getDate();

    if(this.mes<10){
      this.mes='0'+this.mes;
    }
    if(this.dia<10){
      this.dia='0'+this.dia;
    }

    this.hour = this.fecha.getHours();
    this.minutes = this.fecha.getMinutes();
    this.seconds = this.fecha.getSeconds();
    if(this.hour<10){
      this.hour='0'+this.hour;
    }
    if(this.minutes<10){
      this.minutes='0'+this.minutes;
    }
    if(this.seconds<10){
      this.seconds='0'+this.seconds;
    }

    console.log(' fecha de asignación: '+this.anio+'-'+this.mes+'-'+this.dia);
    console.log(' hora de asignación: '+this.hour+':'+this.minutes+':'+this.seconds);

    if(this.req.id_asignado!='0'){
      this.selection.selected.forEach((a,indi)=>{
        this.req.items.forEach(b=>{
          if(a.id==b.id){
            b.estado='ASIGNADO';
            b.f_atencion=this.anio+'-'+this.mes+'-'+this.dia;
            b.h_atencion=this.hour+':'+this.minutes+':'+this.seconds;
            b.id_asignado=String(this.id_selected);
            console.log(b);
            this.logisticaService.updateReqDet(b).subscribe(resq=>{
              if(indi==this.selection.selected.length-1){
                if(this.selection.selected.length==this.req.items.length){
                  this.req.estado='ASIGNADO';
                }
                this.logisticaService.updateReq(this.req).subscribe(reso=>{
                  this.toastr.success('Asignado correctamente');
                  this.dialogRef.close(true);
                })
              }
            });
          }
        })
      })
    }
    else{
      this.toastr.warning('Selecciona a alguien para asignar');
    }
  }

  btnRechazar(){
    this.selection.selected.forEach((a,indi)=>{
      this.req.items.forEach(b=>{
        if(a.id==b.id){
          b.estado='RECHAZADO'
          this.logisticaService.updateReqDet(b).subscribe(res=>{
            if(indi==this.selection.selected.length-1){
              if(this.selection.selected.length==this.req.items.length){
                this.req.estado='ATENDIDO';
              }
                this.logisticaService.updateReq(this.req).subscribe(reso=>{
                  this.dialogRef.close(true);
                })
            }
          });
        }
      })
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}






@Component({
  selector: 'dialog-detalleReqAsist',
  templateUrl: 'dialog-detalleReqAsist.html',
  styleUrls: ['./inicio.component.css']
})
export class DialogDetalleReqAsist implements OnInit {

  salas = [];
  areas = [];
  prioridades = [];

  fecha;
  anio;
  mes;
  dia;

  hour;
  minutes;
  seconds;

  personal: User[]= [];

  types=['COMPRA','SERVICIO'];

  empresas: string[] = ['SUN','VISION','GO','IMG','WARI'];

  req: Requerimiento = new Requerimiento('bbb',null,null,null,null,null,null,[],null,'PENDIENTE',null);
  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,null,null,null,null,null,null,'','NO','NO','OFICINA','');

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);
  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);

  dataSourceReq: MatTableDataSource<Item>;
  selection = new SelectionModel<Item>(true, []);

/*   @ViewChild(MatPaginator, { static: false }) paginator2= new QueryList<MatPaginator>();
  @ViewChild(MatSort, { static: false }) sort2= new QueryList<MatSort>(); */

  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogDetalleReqAsist>,
    @Inject(MAT_DIALOG_DATA) public data:Requerimiento,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public dialog2: MatDialog,
  ) {}

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReq.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceReq.paginator) {
      this.dataSourceReq.paginator.firstPage();
    }
  }

  viewImage(image_url){
    var dialogRef;
    dialogRef=this.dialog.open(DialogViewImage,{
      data:image_url
    })

    dialogRef.afterClosed().subscribe()
  }

  btnComprado(it: Item){
    this.fecha=new Date();
    this.anio=this.fecha.getFullYear();
    this.mes=this.fecha.getMonth()+1;
    this.dia=this.fecha.getDate();

    if(this.mes<10){
      this.mes='0'+this.mes;
    }
    if(this.dia<10){
      this.dia='0'+this.dia;
    }

    this.hour = this.fecha.getHours();
    this.minutes = this.fecha.getMinutes();
    this.seconds = this.fecha.getSeconds();
    if(this.hour<10){
      this.hour='0'+this.hour;
    }
    if(this.minutes<10){
      this.minutes='0'+this.minutes;
    }
    if(this.seconds<10){
      this.seconds='0'+this.seconds;
    }

    it.estado='COMPRADO';
    it.f_compra=this.anio+'-'+this.mes+'-'+this.dia;
    it.h_compra=this.hour+':'+this.minutes+':'+this.seconds;
    this.logisticaService.updateReqDet(it).subscribe(a=>{})
  }

  btnEntregado(it:Item){
    this.fecha=new Date();
    this.anio=this.fecha.getFullYear();
    this.mes=this.fecha.getMonth()+1;
    this.dia=this.fecha.getDate();

    if(this.mes<10){
      this.mes='0'+this.mes;
    }
    if(this.dia<10){
      this.dia='0'+this.dia;
    }

    this.hour = this.fecha.getHours();
    this.minutes = this.fecha.getMinutes();
    this.seconds = this.fecha.getSeconds();
    if(this.hour<10){
      this.hour='0'+this.hour;
    }
    if(this.minutes<10){
      this.minutes='0'+this.minutes;
    }
    if(this.seconds<10){
      this.seconds='0'+this.seconds;
    }

    it.estado='ENTREGADO';
    it.f_final=this.anio+'-'+this.mes+'-'+this.dia;
    it.h_final=this.hour+':'+this.minutes+':'+this.seconds;
    this.logisticaService.updateReqDet(it).subscribe(a=>{
      if(a){
        this.logisticaService.getReqDetailsAprobByCode(this.data.codigo, this.data.id_asignado).subscribe((respu:Item[])=>{
          if(respu.length!=0){

          }
          else{

            this.req.estado='FINALIZADO';
            this.logisticaService.updateReq(this.req).subscribe(resupdtR2=>{
              if(resupdtR2){
              }
            })
          }

        })
      }
    })
  }


  ngOnInit(): void {

    this.req=this.data['req'];

    this.logisticaService.getReqDetailsAprobByCode(this.req.codigo,String(this.data['user_id'])).subscribe((respu:Item[])=>{
      this.req.items=respu;
      this.dataSourceReq = new MatTableDataSource(this.req.items);
      this.dataSourceReq.paginator = this.paginator2.toArray()[0];
      this.dataSourceReq.sort = this.sort2.toArray()[0];
    })

  }

  asigChange(){

  }

  btnCrearOrden(){

    if(!this.selection.isEmpty()){
      var dialogRef2;

      this.fecha=new Date();
      this.anio=this.fecha.getFullYear();
      this.mes=this.fecha.getMonth()+1;
      this.dia=this.fecha.getDate();

      if(this.mes<10){
        this.mes='0'+this.mes;
      }
      if(this.dia<10){
        this.dia='0'+this.dia;
      }

      this.ord.ordItems=[];

      this.ord.fecha=this.anio+'-'+this.mes+'-'+this.dia;
      this.ord.destino=this.req.sala;
      this.ord.area=this.req.area;
      this.selection.selected.forEach(j=>{
        this.orden_item = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);

        this.orden_item.cantidad=j.cantidad;
        this.orden_item.descripcion=j.descripcion;
        this.ord.ordItems.push(this.orden_item);
        this.ord.tipo=j.tipo;
      })
      this.ord.req_id=this.req.id;

      this.logisticaService.getSalaByName(this.ord.destino).subscribe(res=>{

        this.ord.destino_dir=res['address'];

        this.ord.empresa=res['company'];
        this.ord.numero=res['supply_ord_suffix'];



        dialogRef2=this.dialog2.open(DialogCreateOrden,{
          data:this.ord,
        })

        dialogRef2.afterClosed().subscribe(res => {
          if(res){

            this.selection.selected.forEach((j,inde)=>{
              this.orden_item = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);
              this.req.items.forEach((k,ind)=>{
                if(j.id==k.id){
                  j.estado='ATENDIDO';

                  this.logisticaService.updateReqDet(j).subscribe(resupdt=>{
                    if(inde==this.selection.selected.length-1){
                      this.logisticaService.getReqDetailsAprobByCode(this.data.codigo, this.data.id_asignado).subscribe((respu:Item[])=>{
                        if(respu.length!=0){
                          //this.req.estado='ASIGNADO';
                          //this.logisticaService.updateReq(this.req).subscribe(resupdtR=>{
                            this.req.items=respu;

                            this.dataSourceReq = new MatTableDataSource(this.req.items);
                            this.dataSourceReq.paginator = this.paginator2.toArray()[0];
                            this.dataSourceReq.sort = this.sort2.toArray()[0];
                            this.selection.clear();

                          //})

                        }
                        else{
                          console.log('U'+this.data['user_id']+',');
                          this.req.id_asignado = this.req.id_asignado.replace('U'+this.data['user_id']+',','');
                          console.log(this.req);
                          if(this.req.id_asignado==''){
                            this.req.estado='ATENDIDO';
                          }
                          this.logisticaService.updateReq(this.req).subscribe(resupdtR2=>{
                            if(resupdtR2){
                              this.dialogRef.close(true);
                            }
                          })
                        }

                      })
                    }
                  });
                }
              })
            })

          }

        })

      })




    }

    else{
      this.toastr.warning('Selecciona algun item');
    }

  }

  btnRechazar(){
    this.req.estado='RECHAZADO';
    this.logisticaService.updateReq(this.req).subscribe(resUR=>{
      if(resUR){
        this.req.items.forEach(c=>{
          c.estado='DENEGADO';
          this.logisticaService.updateReqDet(c).subscribe();
        })
        this.toastr.warning('Requerimiento rechazado');
        this.dialogRef.close(true);
      }
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}









@Component({
  selector: 'dialog-detalleReqUsr',
  templateUrl: 'dialog-detalleReqUsr.html',
  styleUrls: ['./inicio.component.css']
})
export class DialogDetalleReqUsr implements OnInit {

  salas = [];
  areas = [];
  prioridades = [];

  fecha;
  anio;
  mes;
  dia;

  editableAsig;
  editableAtend;
  editableComp;
  editableEntrega;

  hayAsig;
  hayAtend;
  hayCompra;
  hayEntre;

  completed;

  personal: User[]= [];

  req: Requerimiento = new Requerimiento('bbb',null,null,null,null,null,null,[],null,'PENDIENTE',null);

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);

  listaReq: Item[]= [];

  dataSourceReq: MatTableDataSource<Item>;
  dataSourceReqAsignado: MatTableDataSource<Item>;
  dataSourceReqAtendido: MatTableDataSource<Item>;
  dataSourceReqComprado: MatTableDataSource<Item>;
  dataSourceReqEntregado: MatTableDataSource<Item>;
  selection = new SelectionModel<Item>(true, []);

/*   @ViewChild(MatPaginator, { static: false }) paginator2= new QueryList<MatPaginator>();
  @ViewChild(MatSort, { static: false }) sort2= new QueryList<MatSort>(); */

  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  @ViewChild('stepper') public myStepper: MatStepper;

  constructor(
    public dialogRef: MatDialogRef<DialogDetalleReqUsr>,
    @Inject(MAT_DIALOG_DATA) public data:Requerimiento,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) {}

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReqAsignado.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceReqAsignado.paginator) {
      this.dataSourceReqAsignado.paginator.firstPage();
    }
  }

  viewImage(image_url){
    var dialogRef;
    dialogRef=this.dialog.open(DialogViewImage,{
      data:image_url
    })

    dialogRef.afterClosed().subscribe()
  }

  btnConfirmar(){
    this.req.estado='FINALIZADO';
    this.logisticaService.updateReq(this.req).subscribe(res=>{
      this.dialogRef.close();
    });

  }


  ngOnInit(): void {
    this.editableAsig=false;
    this.editableAtend=false;
    this.editableComp=false;
    this.editableEntrega=false;

    this.hayAsig=false;
    this.hayAtend=false;
    this.hayCompra=false;
    this.hayEntre=false;

    this.completed=false;

    this.req=this.data;

    this.logisticaService.getReqDetailsByCode(this.data.codigo).subscribe((respu:Item[])=>{
      console.log(respu);
      this.req.items=respu;

      this.dataSourceReq = new MatTableDataSource(this.req.items);
      this.dataSourceReq.paginator = this.paginator2.toArray()[0];
      this.dataSourceReq.sort = this.sort2.toArray()[0];

      this.logisticaService.getReqDetailsAsignadoByCode(this.data.codigo).subscribe((asList:Item[])=>{
        this.dataSourceReqAsignado = new MatTableDataSource(asList);
        this.dataSourceReqAsignado.paginator = this.paginator2.toArray()[1];
        this.dataSourceReqAsignado.sort = this.sort2.toArray()[1];

        asList.forEach((ite:Item)=>{

          this.usersService.getUserByIdNew(ite.id_asignado).subscribe((enc:User)=>{
            console.log(enc);
            ite.name_asignado=enc.first_name+' '+enc.paternal_surname+' '+enc.maternal_surname;
          })

          if(ite.estado=='ASIGNADO'){
            this.hayAsig=true;
          }
          if(ite.estado=='ATENDIDO'){

            this.hayAtend=true;
          }
          if(ite.estado=='COMPRADO'){

            this.hayCompra=true;
          }
          if(ite.estado=='ENTREGADO'){

            this.hayEntre=true;
          }

        })
      })

      this.logisticaService.getReqDetailsAtendidoByCode(this.data.codigo).subscribe((atList:Item[])=>{
        this.dataSourceReqAtendido = new MatTableDataSource(atList);
        this.dataSourceReqAtendido.paginator = this.paginator2.toArray()[2];
        this.dataSourceReqAtendido.sort = this.sort2.toArray()[2];

        atList.forEach((ite:Item)=>{

          this.usersService.getUserByIdNew(ite.id_asignado).subscribe((enc:User)=>{
            console.log(enc);
            ite.name_asignado=enc.first_name+' '+enc.paternal_surname+' '+enc.maternal_surname;
          })

          if(ite.estado=='ASIGNADO'){
            this.hayAsig=true;
          }
          if(ite.estado=='ATENDIDO'){

            this.hayAtend=true;
          }
          if(ite.estado=='COMPRADO'){

            this.hayCompra=true;
          }
          if(ite.estado=='ENTREGADO'){

            this.hayEntre=true;
          }

        })
      })

      this.logisticaService.getReqDetailsCompradoByCode(this.data.codigo).subscribe((coList:Item[])=>{
        this.dataSourceReqComprado = new MatTableDataSource(coList);
        this.dataSourceReqComprado.paginator = this.paginator2.toArray()[3];
        this.dataSourceReqComprado.sort = this.sort2.toArray()[3];

        coList.forEach((ite:Item)=>{

          this.usersService.getUserByIdNew(ite.id_asignado).subscribe((enc:User)=>{
            console.log(enc);
            ite.name_asignado=enc.first_name+' '+enc.paternal_surname+' '+enc.maternal_surname;
          })

          if(ite.estado=='ASIGNADO'){
            this.hayAsig=true;
          }
          if(ite.estado=='ATENDIDO'){

            this.hayAtend=true;
          }
          if(ite.estado=='COMPRADO'){


            this.hayCompra=true;
          }
          if(ite.estado=='ENTREGADO'){

            this.hayEntre=true;
          }

        })
      })

      this.logisticaService.getReqDetailsEntregadoByCode(this.data.codigo).subscribe((enList:Item[])=>{
        this.dataSourceReqEntregado = new MatTableDataSource(enList);
        this.dataSourceReqEntregado.paginator = this.paginator2.toArray()[4];
        this.dataSourceReqEntregado.sort = this.sort2.toArray()[4];

        if(this.req.items.length==enList.length){
          this.completed=true;
        }

        enList.forEach((ite:Item)=>{

          this.usersService.getUserByIdNew(ite.id_asignado).subscribe((enc:User)=>{
            console.log(enc);
            ite.name_asignado=enc.first_name+' '+enc.paternal_surname+' '+enc.maternal_surname;
          })

          if(ite.estado=='ASIGNADO'){
            this.hayAsig=true;
          }
          if(ite.estado=='ATENDIDO'){

            this.hayAtend=true;
          }
          if(ite.estado=='COMPRADO'){

            this.hayCompra=true;
          }
          if(ite.estado=='ENTREGADO'){

            this.hayEntre=true;
          }

        })
      })

      this.req.items.forEach((ite:Item)=>{

        this.usersService.getUserByIdNew(ite.id_asignado).subscribe((enc:User)=>{
          console.log(enc);
          ite.name_asignado=enc.first_name+' '+enc.paternal_surname+' '+enc.maternal_surname;
        })

        if(ite.estado=='ASIGNADO'){
          this.hayAsig=true;
        }
        if(ite.estado=='ATENDIDO'){

          this.hayAtend=true;
        }
        if(ite.estado=='COMPRADO'){

          this.hayCompra=true;
        }
        if(ite.estado=='ENTREGADO'){

          this.hayEntre=true;
        }

      })


      setTimeout(()=>{
        if(this.hayEntre){
          this.editableEntrega=true;
          setTimeout(()=>{
            this.myStepper.selectedIndex=1;
            setTimeout(()=>{
              this.myStepper.selectedIndex=2;
              setTimeout(()=>{
                this.myStepper.selectedIndex=3;
              },500)
            },500)
          },500)
          if(this.hayAsig){
            this.editableAsig=true;
            this.editableAtend=true;
            this.editableComp=true;
          }
          else{
            if(this.hayAtend){
              this.editableAsig=false;
              this.editableAtend=true;
              this.editableComp=true;
            }
            else{
              if(this.hayCompra){
                this.editableComp=true;
              }
            }
          }
        }
        else{
          if(this.hayCompra){
            this.editableComp=true;
            setTimeout(()=>{
              this.myStepper.selectedIndex=1;
              setTimeout(()=>{
                this.myStepper.selectedIndex=2;
              },500)
            },500)

            if(this.hayAsig){
              this.editableAsig=true;
              this.editableAtend=true;
              this.editableComp=true;
            }
            else{
              if(this.hayAtend){
                this.editableAsig=false;
                this.editableAtend=true;
                this.editableComp=true;
              }
            }
          }
          else{
            if(this.hayAtend){
              setTimeout(()=>{
                this.myStepper.selectedIndex=1;
              },500)

              if(this.hayAsig){
                this.editableAsig=true;
              }
            }
            else{
              setTimeout(()=>{
                this.myStepper.selectedIndex=0;
              },500)

            }
          }
        }
      },1000)


      this.usersService.getPersonalNew(1).subscribe((pers:User[])=>{
        this.personal=pers;
      })
    })

  }

  asigChange(){

  }

  btnAsignar(){
    if(this.req.id_asignado!='0'){
      this.req.estado='ASIGNADO';
      this.logisticaService.updateReq(this.req).subscribe(resUR=>{
        if(resUR){
          this.selection.selected.forEach(a=>{
            this.req.items.forEach(b=>{
              if(a.id==b.id){
                b.estado='APROBADO'
              }
            })
            this.req.items.forEach(c=>{
              if(c.estado=='PENDIENTE'){
                c.estado='DENEGADO'
              }
              this.logisticaService.updateReqDet(c).subscribe();
            })
          })
          this.toastr.success('Asignado correctamente');
          this.dialogRef.close(true);
        }
      })
    }
    else{
      this.toastr.warning('Selecciona a alguien para asignar');
    }
  }

  btnRechazar(){
    this.req.estado='RECHAZADO';
    this.logisticaService.updateReq(this.req).subscribe(resUR=>{
      if(resUR){
        this.req.items.forEach(c=>{
          c.estado='DENEGADO';
          this.logisticaService.updateReqDet(c).subscribe();
        })
        this.toastr.warning('Requerimiento rechazado');
        this.dialogRef.close(true);
      }
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}












@Component({
  selector: 'dialog-createOrden',
  templateUrl: 'dialog-createOrden.html',
  styleUrls: ['./inicio.component.css']
})
export class DialogCreateOrden implements OnInit {

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
  monedas: string[] = ['SOLES','DOLARES AMERICANOS'];

  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  unidades=['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  aux_dec=['','ONCE','DOCE','TRECE','CATORCE','QUINCE']

  req: Requerimiento = new Requerimiento(null,null,null,null,null,null,null,[],null,'PENDIENTE',null);
  ord: Orden = new Orden(null,null,null,null,null,null,null,null,null,null,null,null,[],'PENDIENTE',null,null,null,null,null,null,null,null,null,null,null,null,'','NO','NO','OFICINA','');

  item: Item = new Item(null,null,null,'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);
  orden_item: OrdenItem = new OrdenItem(null,null,null,null,null,null,null,false,'','','',true);

  listaReq: Item[]= [];

  prefijoMoney='';
  moneyText='';

  dataSourceReq: MatTableDataSource<Item>;
  selection = new SelectionModel<Item>(true, []);

  doc = new jsPDF();

  img = new Image();

  posTituloSala;

  igvActivated;

/*   @ViewChild(MatPaginator, { static: false }) paginator2= new QueryList<MatPaginator>();
  @ViewChild(MatSort, { static: false }) sort2= new QueryList<MatSort>(); */

  @ViewChildren(MatPaginator) paginator2= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort2= new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<DialogCreateOrden>,
    @Inject(MAT_DIALOG_DATA) public data:Orden,
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


  updateIgv(){
    if(this.igvActivated){
      this.ord.igv=((18*parseFloat(this.ord.subtotal))/100).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
    }
    else{
      this.ord.igv=(0.0).toFixed(2);
      this.ord.total=(parseFloat(this.ord.subtotal)+parseFloat(this.ord.igv)).toFixed(2);
    }
  }


  ngOnInit(): void {

    this.igvActivated=true;

    this.ord=this.data;
    this.prefijoMoney='';
    this.ord.moneda='SOLES';
    this.prefijoMoney='S/.';
    this.ord.ruc='';
    this.ord.subtotal=parseInt('0').toFixed(2);
    this.ord.igv=parseInt('0').toFixed(2);
    this.ord.total=parseInt('0').toFixed(2);
    this.ord.rebajado='';
    this.posTituloSala = 74;




  }

  asigChange(){
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
    if(this.ord.rebajado==''){
      this.ord.rebajado=(0.0).toFixed(2);
    }
    else{
      this.ord.rebajado=parseFloat(this.ord.rebajado).toFixed(2);
    }
    this.ord.ordItems.forEach(n=>{
      n.unit_price=parseFloat(n.unit_price).toFixed(2);
    })
    this.ord.razon_social=this.ord.razon_social.toUpperCase();
    this.ord.direccion=this.ord.direccion.toUpperCase();
    this.logisticaService.getLastOrdOficinaCode(this.ord.numero,this.ord.destino,this.ord.empresa).subscribe(resi=>{
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



      if(this.ord.moneda!=''&&this.ord.empresa!=''&&this.ord.ruc!=''&&this.ord.razon_social!=''&&this.ord.direccion!=''){


        this.moneyText=this.numToText9Cifras(parseInt(this.ord.total))+' CON '+String(Math.ceil((parseFloat(this.ord.total)*100.0)%100))+'/100 ' + this.ord.moneda;



  /*       this.logisticaService.getLastOrdCode(this.ord.destino).subscribe(resp=>{

        }) */

        this.logisticaService.addOrd(this.ord).subscribe(resAddOrd=>{
          if(resAddOrd){
            this.ord.ordItems.forEach((p:OrdenItem)=>{
              p.ord_codigo=resAddOrd['session_id'];

              this.logisticaService.addOrdDet(p).subscribe(resAddOrdDet=>{
                if(resAddOrdDet){
                  this.generatePDF();
                  this.dialogRef.close(true);
                }
              });
            })
          }
        })
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
    this.doc.setFontSize(10);
    this.doc.text(this.ord.destino_dir,105,50,{align:'center'});
    this.doc.roundedRect(65, 25, 80, 20, 2, 2, 'S');
    this.doc.rect(150, 28, 50, 14);
    this.doc.setFont("helvetica","normal");
    this.doc.setFontSize(12);
    this.doc.setTextColor(183,18,18);
    this.doc.text('ORDEN DE '+ this.ord.tipo,175,33,{align:'center'});
    // this.doc.text('Nº '+ this.ord.numero,175-(((9+this.ord.numero.length)/2)*3),39);
    this.doc.text('Nº '+this.ord.numero,175,39,{align:'center'});
    this.doc.setFontSize(9);
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
    this.doc.text('CONDICIONES DE PAGO',40,94,{align:'center'});
    this.doc.text('CCI',105,94,{align:'center'});
    this.doc.text('FECHA COMPRA',165,94,{align:'center'});

    this.doc.text(this.ord.tipo_pago,40,101,{align:'center'});
    this.doc.text(this.ord.num_cuenta,105,101,{align:'center'});
    this.doc.text(this.ord.fecha,165,101,{align:'center'});
    //this.doc.rect(10, 113, 190, (this.ord.ordItems.length+1)*7);
    this.doc.line(10, 113, 200, 113, 'S');
    this.doc.setFontSize(9);
    this.doc.text('CANTIDAD',24,118,{align:'center'});
    this.doc.text('DESCRIPCION',90,118,{align:'center'});
    this.doc.text('PRECIO UNIT.',156,118,{align:'center'});
    this.doc.text('SUBTOTAL',187,118,{align:'center'});
    var pos_line=113;
    var pos_item=pos_line+5;
    this.ord.ordItems.forEach(m=>{
      this.doc.setFontSize(9);
      pos_line+=7;
      pos_item+=7;
      this.doc.line(10, pos_line, 200, pos_line, 'S');
      this.doc.text(String(m.cantidad),24,pos_item,{align:'center'});
      this.doc.text(m.unit_price,156,pos_item,{align:'center'});
      this.doc.text(m.subtotal,187,pos_item,{align:'center'});
      this.doc.setFontSize(9);
      if(m.descripcion.length<=50){
        this.doc.text(m.descripcion,40,pos_item);
        pos_line+=7;
        pos_item+=7;
      }
      else{
        if(m.descripcion.length<=100){
          this.doc.text(m.descripcion.substring(0,50),40,pos_item);
          pos_line+=7;
          pos_item+=7;
          this.doc.text(m.descripcion.substring(50,m.descripcion.length),40,pos_item);
          pos_line+=7;
          pos_item+=7;
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
            pos_line+=7;
            pos_item+=7;
          }
        }
      }

    })
    this.doc.line(10, pos_line, 200, pos_line, 'S');
    this.doc.line(10, 113, 10, pos_line, 'S');
    this.doc.line(38, 113, 38, pos_line, 'S');
    this.doc.line(140, 113, 140, pos_line, 'S');
    this.doc.line(174, 113, 174, pos_line, 'S');
    this.doc.line(200, 113, 200, pos_line, 'S');
    pos_line+=10;
    this.doc.setFontSize(9);
    this.doc.setTextColor(183,18,18);
    this.doc.text('SON: '+this.moneyText,15,pos_line);
    pos_line+=9;
    this.doc.setFontSize(9);
    this.doc.setTextColor(0,0,0);
    this.doc.roundedRect(140, pos_line, 60, 21, 2, 2, 'S');
    pos_line+=5;
    this.doc.text('SUBTOTAL',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.subtotal,197,pos_line,{align:'right'});
    pos_line+=7;
    this.doc.text('IGV',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.igv,197,pos_line,{align:'right'});
    pos_line+=7;
    this.doc.text('MONTO INICIAL: '+this.prefijoMoney+' '+this.ord.rebajado,20,pos_line);
    this.doc.text('TOTAL',142,pos_line);
    this.doc.text(this.prefijoMoney,166,pos_line);
    this.doc.text(this.ord.total,197,pos_line,{align:'right'});
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

  btnRechazar(){
    this.req.estado='RECHAZADO';
    this.logisticaService.updateReq(this.req).subscribe(resUR=>{
      if(resUR){
        this.req.items.forEach(c=>{
          c.estado='DENEGADO';
          this.logisticaService.updateReqDet(c).subscribe();
        })
        this.toastr.warning('Requerimiento rechazado');
        this.dialogRef.close(true);
      }
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}



@Component({
  selector: 'dialog-viewImage',
  templateUrl: 'dialog-viewImage.html',
  styleUrls: ['./inicio.component.css']
})
export class DialogViewImage implements OnInit {

  image_url='';
  image='';

  constructor(
    public dialogRef: MatDialogRef<DialogDetalleReqUsr>,
    @Inject(MAT_DIALOG_DATA) public data:string,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
    private uploadService: FileUploadService
  ) {}



  ngOnInit(): void {

    console.log(this.data);

    this.image_url=this.data;

/*     this.uploadService.getFile(this.image_url).subscribe(res=>{

      this.image = res;

    }) */

  }


}
