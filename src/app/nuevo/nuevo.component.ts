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
import { Area } from '../area';
import { Campus } from '../campus';
import { FileUploadService } from '../file-upload.service';
import { Collaborator } from '../collaborator';
import { ReqValidation } from '../req_validation';


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

  tipoOrdenItem = ['COMPRA','SERVICIO','COTIZACION'];

  fecha;
  anio;
  mes;
  dia;

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  area_chief='';
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string = '';

  selectedCampus: Campus = new Campus('','','','','','');

  req: Requerimiento = new Requerimiento('','','','','','','',[],'0','PENDIENTE',null);

  item: Item = new Item('',null,'','COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);

  listaReq: Item[]= [];

  dataSourceReq: MatTableDataSource<Item>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  // Variable to store shortLink from api response
  shortLink: string = "";
  loading: boolean = false; // Flag variable
  file: File = null; // Variable to store file
  pdf: File = null; // Variable to store file

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

  onPDFChanged(event) {
    this.pdf = event.target.files[0];
    if (this.pdf) {

      var currentFile = this.pdf;

      const reader = new FileReader();

      reader.onload = (e: any) => {

      };

      reader.readAsDataURL(currentFile);

      console.log(currentFile);
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
  ordenChange(event:any){
    const selectedOption= event.target.value;
    this.item.tipo=selectedOption;
    console.log( this.item.tipo);


  }
  increaseQuantityButton(){
    this.item.cantidad++;


  }
  decreaseQuantityButton(){
    if( this.item.cantidad!=null&& this.item.cantidad>1)
    this.item.cantidad--;

    
  }

  addItem(){
    this.item.req_codigo = this.req.codigo;
    if(this.item.cantidad!=null&&this.item.descripcion!=null&&this.item.tipo!=null&&this.item.unit_budget!=''&&this.item.unit_budget){
      this.item.image=this.file;
      this.file=null;
      this.item.pdf=this.pdf;
      this.pdf=null;
      this.item.req_codigo=this.req.codigo;
      this.item.descripcion=this.item.descripcion.toUpperCase();
      this.item.unit_budget=parseFloat(this.item.unit_budget).toFixed(2);
      this.item.subtotal_budget=(parseFloat(this.item.unit_budget)*this.item.cantidad).toFixed(2);
      this.listaReq.push(this.item);
      this.req.total_budget = this.listaReq.reduce((tot,it)=>tot+parseFloat(it.subtotal_budget),0).toFixed(2);
      this.item = new Item(null,null,null, 'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);
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
    this.req.total_budget = this.listaReq.reduce((tot,it)=>tot+parseFloat(it.subtotal_budget),0).toFixed(2);
    this.item = new Item(null,null,null, 'COMPRA','PENDIENTE','',null,'0','','','','','','','','','','','',null);
    this.dataSourceReq = new MatTableDataSource(this.listaReq);
    this.dataSourceReq.paginator = this.paginator.toArray()[0];
    this.dataSourceReq.sort = this.sort.toArray()[0];
  }

  dateChange(value){

  }

  priorityChange(event:any){
    const selectedValue = event.target.value;
    this.req.prioridad=selectedValue;


  }

  areaChange(event:any){

    const selectedValue = event.target.value;
    
    this.req.area=selectedValue;
            
    this.areas.forEach(a=>{
      if(a['name']==selectedValue){
        this.usersService.getUserByIdNew(this.user_area.chief_id).subscribe((ac:User)=>{
          if(ac){
            this.req.encargado=ac.first_name+' '+ac.paternal_surname+' '+ac.maternal_surname;
            
          
          }
          else{
            this.req.encargado='';
          }
        })
      }
    })






  }

  salaChange(event:any){

    const selectedValue = event.target.value;
    console.log(event.target.value);
    console.log(this.selectedCampus);
    this.req.sala=this.selectedCampus.name;
    this.req.campus_id=this.selectedCampus.campus_id;

  }

  async uploadFile(file: File): Promise<string> {
    try {
      const res = await this.fileUploadService.upload(file).toPromise();
      return res.filePath || '';
    } catch (error) {
      console.error('Error uploading file:', error);
      return '';
    }
  }
  
  async processItem(i: any): Promise<void> {
    if (i.image) {
      i.image_url = await this.uploadFile(i.image);
    } else {
      i.image_url = '';
    }
  
    if (i.pdf) {
      i.pdf_url = await this.uploadFile(i.pdf);
    } else {
      i.pdf_url = '';
    }
  
    try {
      const res = await this.logisticaService.addReqDet(i).toPromise();
      console.log('Response:', res);
    } catch (error) {
      console.error('Error adding req det:', error);
    }
  }
  
  async saveReq(): Promise<void> {
    // Get Date
    const hora = new Date();
    const hour = String(hora.getHours()).padStart(2, '0');
    const minutes = String(hora.getMinutes()).padStart(2, '0');
    const seconds = String(hora.getSeconds()).padStart(2, '0');
    const hora_string = `${hour}:${minutes}:${seconds}`;
  
    this.h_inicio = hora_string;
    this.f_inicio = this.req.fecha;
    console.log('fecha de inicio:', this.f_inicio);
    console.log('hora de inicio', this.h_inicio);
  
    this.req.items = this.listaReq;
    this.req.id_asignado = '0';
    this.req.user_id = this.user.user_id;
    this.req.validation = 'PENDIENTE';
  
    if (this.req.area && this.req.fecha && this.req.encargado && this.req.sala && this.req.prioridad && this.req.motivo && this.req.items.length) {
      if (this.listaReq.length) {
        this.req.motivo = this.req.motivo.toUpperCase();
        this.req.encargado = this.req.encargado.toUpperCase();
  
        const dateCode = new Date();
        const yearCode = dateCode.getFullYear();
        let monthCode = String(dateCode.getMonth() + 1).padStart(2, '0');
        let dayCode = String(dateCode.getDate()).padStart(2, '0');
        let dateStr = '';
  
        this.campus.forEach(c => {
          if (c['name'] === this.req.sala) {
            dateStr += c.supply_req_suffix;
          }
        });
  
        dateStr += monthCode + '-';
  
        try {
          const resp = await this.logisticaService.getLastReqCode(dateStr).toPromise();
          console.log(resp);
          if (resp) {
            const respArray = String(resp['codigo']).split('-');
            const code = String(parseInt(respArray[1]) + 1).padStart(4, '0');
            this.req.codigo = dateStr + code;
          } else {
            this.req.codigo = dateStr + '0001';
          }
  
          const res = await this.logisticaService.addReq(this.req).toPromise();
          if (res['resultado']) {
            const reqItems: Item[] = this.req.items;
            for (const i of reqItems) {
              i.req_id = res['id'];
              i.req_codigo = this.req.codigo;
              i.f_inicio = this.f_inicio;
              i.h_inicio = this.h_inicio;
              console.log(i.req_codigo, i.f_inicio, i.h_inicio);
  
              await this.processItem(i);
            }

            // Obtener y procesar reglas de validación
            const reqValidationRules = await this.logisticaService.getReqValidationRules(this.req.campus_id, this.req.total_budget).toPromise();
            if(Array.isArray(reqValidationRules)){
              if(reqValidationRules.length>1){
                for (const rule of reqValidationRules) {
                  var valToPost:ReqValidation = new ReqValidation(rule.user_id,res['id'],this.getCurrentDate(),this.getCurrentHour(),'PENDIENTE');
                  console.log(valToPost);
                  await this.logisticaService.addReqValidation(valToPost).toPromise();
                }
              }
              else{
                var valToPost:ReqValidation = new ReqValidation(0,res['id'],this.getCurrentDate(),this.getCurrentHour(),'APROBADO');
                console.log(valToPost);
                await this.logisticaService.addReqValidation(valToPost).toPromise();
              }
            }

  
            this.listaReq = [];
            this.dataSourceReq = new MatTableDataSource(this.listaReq);
            this.dataSourceReq.paginator = this.paginator.toArray()[0];
            this.dataSourceReq.sort = this.sort.toArray()[0];
            this.req.items = [];
            this.toastr.success('Requerimiento agregado!');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } else {
        this.toastr.warning('No hay ningún item agregado');
      }
    } else {
      this.toastr.warning("Rellena todos los campos!");
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
  

  saveCheck(){

  }

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReq.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceReq.paginator) {
      this.dataSourceReq.paginator.firstPage();
    }
  }


  ngOnInit() {



    if(this.cookiesService.checkToken('user_id')){

      this.user_id = parseInt(this.cookiesService.getToken('user_id'));
      this.user_role = this.cookiesService.getToken('user_role');

      this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
        if(u){
          this.user=u;



          this.usersService.getCollaboratorByUserId(this.user.user_id).subscribe((c:Collaborator)=>{
            this.colab=c;
            this.logisticaService.getAreaById(this.colab.area_id).subscribe((ar:Area)=>{
              if(ar){
                this.user_area=ar;
                this.logisticaService.getCampusById(this.colab.campus_id).subscribe((camp:Campus)=>{
                  if(camp){
                    this.user_campus=camp;
  
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
                    //nuevo
                    this.req.campus_id=this.user_campus.campus_id;
  
                    this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
                      if(as){
                        this.areas=as;
                      }
                      this.logisticaService.getAllCampus().subscribe((ac:Campus[])=>{
                        if(ac){
                          this.campus=ac;
                          this.selectedCampus = this.campus.find(a=>a.campus_id==this.user_campus.campus_id);
                        }
  
                        this.logisticaService.getPrioridad().subscribe((res3:string[])=>{
                          if(res3){
                            this.prioridades=res3;
  
                            this.req.encargado=this.user.first_name+' '+this.user.paternal_surname+' '+this.user.maternal_surname;

                          }
                        })
                      })
                    })
    
                  }
                })
    
              }
              
            })
          })




        }
      });

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
