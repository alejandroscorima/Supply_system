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


@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NuevoComponent implements OnInit {

  campus: Campus[] = [];
  areas: Area[] = [];
  prioridades = [];

  fecha;
  anio;
  mes;
  dia;

  user: User = new User('','','','','','',null,null,'','');
  area_chief='';
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  req: Requerimiento = new Requerimiento('','','','','','','',[],'0','PENDIENTE',null);

  item: Item = new Item('',null,'','COMPRA','PENDIENTE','',null,'0','','','','','','','','','','');

  listaReq: Item[]= [];

  dataSourceReq: MatTableDataSource<Item>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  // Variable to store shortLink from api response
  shortLink: string = "";
  loading: boolean = false; // Flag variable
  file: File = null; // Variable to store file

  preview: any='';
  f_inicio;
  h_inicio;
  hora;
  hora_string;
  hour;
  minutes;
  seconds;


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


  // On file Select
  onFileChanged(event) {
    this.file = event.target.files[0];
    if (this.file) {
      this.preview = '';
      var currentFile = this.file;

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };

      reader.readAsDataURL(currentFile);
    }
  }

  // OnClick of button Upload
  onUpload() {
    this.loading = !this.loading;

    this.fileUploadService.upload(this.file).subscribe(
        (event: any) => {
            if (typeof (event) === 'object') {

                // Short link via api response
                this.item.image_url = event.link;

                this.loading = false; // Flag variable
            }
        }
    );
  }

  searchItem(){

  }


  addItem(){
    this.item.req_codigo = this.req.codigo;
    if(this.item.cantidad!=null&&this.item.descripcion!=null&&this.item.tipo!=null){
      this.item.image=this.file;
      this.file=null;
      this.item.req_codigo=this.req.codigo;
      this.item.descripcion=this.item.descripcion.toUpperCase();
      this.listaReq.push(this.item);
      this.item = new Item(null,null,null, 'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','');
      this.dataSourceReq = new MatTableDataSource(this.listaReq);
      this.dataSourceReq.paginator = this.paginator.toArray()[0];
      this.dataSourceReq.sort = this.sort.toArray()[0];
    }
    else{
      this.toastr.warning('Completa correctamente el item!');
    }
  }

  deleteItem(indice){
    this.listaReq.splice(indice,1);
    this.item = new Item(null,null,null, 'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','');
    this.dataSourceReq = new MatTableDataSource(this.listaReq);
    this.dataSourceReq.paginator = this.paginator.toArray()[0];
    this.dataSourceReq.sort = this.sort.toArray()[0];
  }

  dateChange(value){

  }

  priorityChange(){

  }

  areaChange(e){
    this.areas.forEach(a=>{
      if(a['name']==e.value){
        this.usersService.getUserById(this.user_area.chief_id).subscribe((ac:User)=>{
          if(ac){
            this.req.encargado=ac.first_name+' '+ac.last_name;
          }
          else{
            this.req.encargado='';
          }
        })
      }
    })

  }

  salaChange(e){

  }

  saveReq(){
  //get Date
    this.hora=new Date();
    this.hour = this.hora.getHours();
    this.minutes = this.hora.getMinutes();
    this.seconds = this.hora.getSeconds();
    if(this.hour<10){
      this.hour='0'+this.hour;
    }
    if(this.minutes<10){
      this.minutes='0'+this.minutes;
    }
    if(this.seconds<10){
      this.seconds='0'+this.seconds;
    }
    this.hora_string=this.hour+':'+this.minutes+':'+this.seconds;
    //
    this.h_inicio=this.hora_string;
    this.f_inicio=this.req.fecha;
    console.log(' fecha de inicio: '+this.f_inicio);
    console.log(' hora de inicio '+this.h_inicio);

    this.req.items=this.listaReq
    this.req.id_asignado='0';
    this.req.user_id=this.user.user_id;
    if(this.req.area!=''&&this.req.fecha!=''&&this.req.encargado!=''&&this.req.sala!=''&&this.req.prioridad!=''&&this.req.motivo!=''&&this.req.items.length!=0){
      if(this.listaReq.length!=0){
        this.req.motivo=this.req.motivo.toUpperCase();
        this.req.encargado=this.req.encargado.toUpperCase();

        var dateCode = new Date();
        var yearCode = dateCode.getFullYear();
        var monthCode: any = dateCode.getMonth()+1;
        var dayCode: any = dateCode.getDate();

        if(monthCode<10){
          monthCode = '0'+ monthCode;
        }

        if(dayCode<10){
          dayCode = '0'+ dayCode;
        }

        var dateStr='';

        this.campus.forEach(c=>{
          if(c['name']==this.req.sala){
            dateStr+=c.supply_req_suffix;
          }
        })

        dateStr+=monthCode;
        dateStr+='-';

        this.logisticaService.getLastReqCode(dateStr).subscribe(resp=>{
          if(resp){
            var respArray=String(resp['codigo']).substring(8,12);
            var code;
            if(parseInt(respArray[1])+1<10){
              code='000'+String(parseInt(respArray[1])+1);
            }
            else{
              if(parseInt(respArray[1])+1<100){
                code='00'+String(parseInt(respArray[1])+1);
              }
              else{
                if(parseInt(respArray[1])+1<1000){
                  code='0'+String(parseInt(respArray[1])+1);
                }
                else{
                  code=String(parseInt(respArray[1])+1);
                }
              }
            }
            this.req.codigo=dateStr+code;
          }
          else{
            this.req.codigo = dateStr+'0001' ;
          }

          this.logisticaService.addReq(this.req).subscribe(res=>{
            if(res){
              var reqItems: Item[]=this.req.items;
              reqItems.forEach(i=>{
                i.req_codigo=this.req.codigo;
                i.f_inicio=this.f_inicio;
                i.h_inicio=this.h_inicio;
                console.log(i.req_codigo);
                console.log(i.f_inicio);
                console.log(i.h_inicio);
                if(i.image){
                  this.fileUploadService.upload(i.image).subscribe(res => {
                    if (res) {

                      i.image_url = res;

                    }
                    this.logisticaService.addReqDet(i).subscribe();
                  });
                }
                else{
                  i.image_url = '';
                  this.logisticaService.addReqDet(i).subscribe();
                }


              })
              this.listaReq=[];
              this.dataSourceReq = new MatTableDataSource(this.listaReq);
              this.dataSourceReq.paginator = this.paginator.toArray()[0];
              this.dataSourceReq.sort = this.sort.toArray()[0];
              this.req.items=[];
              this.listaReq=[];
              this.toastr.success('Requerimiento agregado!');

            }
          })


        })


      }
      else{
        this.toastr.warning('No hay nigun item agregado');
      }
    }
    else{
      this.toastr.warning("Rellena todos los campos!");
    }
  }

  saveCheck(){

  }

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReq.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceReq.paginator) {
      this.dataSourceReq.paginator.firstPage();
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



    if(this.cookiesService.checkToken('session_id')){

      this.usersService.getSession(this.cookiesService.getToken('session_id')).subscribe((s:UserSession)=>{
        if(s){
          this.usersService.getUserById(s.user_id).subscribe((u:User)=>{
            if(u){
              this.user=u;
              this.logisticaService.getAreaById(this.user.area_id).subscribe((a:Area)=>{
                if(a){
                  this.user_area=a;
                  this.logisticaService.getCampusById(this.user.campus_id).subscribe((c:Campus)=>{
                    if(c){
                      this.user_campus=c;

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

                      this.req.fecha=this.anio+'-'+this.mes+'-'+this.dia;
                      console.log(this.user_area.name);
                      console.log(this.user_campus.name);
                      this.req.area=String(this.user_area.name);
                      this.req.sala=String(this.user_campus.name);

                      this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
                        if(as){
                          this.areas=as;
                        }
                        this.logisticaService.getAllCampus().subscribe((ac:Campus[])=>{
                          if(ac){
                            this.campus=ac;
                          }

                          this.logisticaService.getPrioridad().subscribe((res3:string[])=>{
                            if(res3){
                              this.prioridades=res3;

                              if(this.user_area.name=='ADMINISTRACION'){
                                this.req.encargado=this.user.first_name+' '+this.user.last_name;
                              }
                              else{
                                this.usersService.getUserById(this.user_area.chief_id).subscribe((ac:User)=>{
                                  console.log(ac);
                                  if(ac){
                                    this.req.encargado=ac.first_name+' '+ac.last_name;
                                  }
                                  else{
                                    this.req.encargado=this.user.first_name+' '+this.user.last_name;
                                  }
                                })
                              }

                            }
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



 /*     this.clientesService.getDestacados().subscribe((destacadosList:Cliente[])=>{

      this.dataSourceReq = new MatTableDataSource(this.listaReq);
      this.dataSourceReq.paginator = this.paginator.toArray()[0];
      this.dataSourceReq.sort = this.sort.toArray()[0];
    }); */
  }



  onSubmit() {
  }


}



@Component({
  selector: 'dialog-newD',
  templateUrl: 'dialog-newD.html',
  styleUrls: ['./nuevo.component.css']
})
export class DialogNewD implements OnInit {

  disableBtnOk;
  constructor(
    public dialogRef: MatDialogRef<DialogNewD>,
    @Inject(MAT_DIALOG_DATA) public data:User,
    private clientsService: ClientesService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.disableBtnOk=true;
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onKeyUpEvent(event:any){

  }


}



@Component({
  selector: 'dialog-newR',
  templateUrl: 'dialog-newR.html',
  styleUrls: ['./nuevo.component.css']
})
export class DialogNewR implements OnInit {

  disableBtnOk;
  constructor(
    public dialogRef: MatDialogRef<DialogNewR>,
    @Inject(MAT_DIALOG_DATA) public data:User,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.disableBtnOk=true;
  }


  onNoClick(): void {
    this.dialogRef.close();
  }





}


@Component({
  selector: 'dialog-confirm',
  templateUrl: 'dialog-confirm.html',
  styleUrls: ['./nuevo.component.css']
})
export class DialogConfirm implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<DialogConfirm>,
    @Inject(MAT_DIALOG_DATA) public data:User,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

  }

  delete(): void{
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
