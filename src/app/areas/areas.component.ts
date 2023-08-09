import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Area } from '../area';
import { Campus } from '../campus';
import { ClientesService } from '../clientes.service';
import { CookiesService } from '../cookies.service';
import { LogisticaService } from '../logistica.service';
import { User } from '../user';
import { UsersService } from '../users.service';
import { Collaborator } from '../collaborator';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.css']
})
export class AreasComponent implements OnInit {

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string = '';

  listaAreas: Area[]= [];
  dataSourceAreas: MatTableDataSource<Area>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(private clientesService: ClientesService,
    private snackBar: MatSnackBar, private router: Router,
    private logisticaService: LogisticaService,
    private cookiesService: CookiesService,
    private usersService: UsersService,
    public dialog: MatDialog,
    private toastr: ToastrService,
  ) { }


  applyFilterU(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAreas.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceAreas.paginator) {
      this.dataSourceAreas.paginator.firstPage();
    }
  }

  new(){
    var dialogRef;

    var newArea: Area = new Area('',null);

    dialogRef=this.dialog.open(DialogNewArea,{
      data:newArea,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Agregado!')
      }
    })
  }

  edit(a:Area){
    var dialogRef;

    dialogRef=this.dialog.open(DialogEditArea,{
      data:a,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Editado!')
      }
    })
  }

  ngOnInit(): void {
    if(this.cookiesService.checkToken('user_id')){
      this.user_id = parseInt(this.cookiesService.getToken('user_id'));
      this.user_role = this.cookiesService.getToken('user_role');

      this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
        this.user=u;


        this.usersService.getCollaboratorById(this.user.colab_id).subscribe((c:Collaborator)=>{
          this.colab=c;
          this.logisticaService.getAreaById(this.colab.area_id).subscribe((ar:Area)=>{
            if(ar){
              this.user_area=ar;
              this.logisticaService.getCampusById(this.colab.campus_id).subscribe((camp:Campus)=>{
                if(camp){
                  this.user_campus=camp;

                  this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
                    this.listaAreas=as;
                    this.dataSourceAreas = new MatTableDataSource(this.listaAreas);
                    this.dataSourceAreas.paginator = this.paginator.toArray()[0];
                    this.dataSourceAreas.sort = this.sort.toArray()[0];
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

}



@Component({
  selector: 'dialog-newArea',
  templateUrl: 'dialog-newArea.html',
  styleUrls: ['./areas.component.css']
})
export class DialogNewArea implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];


  constructor(
    public dialogRef: MatDialogRef<DialogNewArea>,
    @Inject(MAT_DIALOG_DATA) public data:Area,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}


  save(){
/*     this.data.password=this.data.doc_number;
    this.usersService.getUser(this.data.username,this.data.password).subscribe(resU=>{
      if(resU){
        this.toastr.warning('USUARIO YA REGISTRADO');
      }
      else{
        this.usersService.addUser(this.data).subscribe(res=>{
          if(res){
            this.dialogRef.close('true');
          }
        })
      }
    }) */

  }

  changeDoc(){
/*     if(this.data.doc_number.length>=8){
      this.logisticaService.getClientFromReniec(this.data.doc_number).subscribe(res=>{
        if(res){
          this.data.last_name=res['data']['apellido_paterno']+' '+res['data']['apellido_materno'];
          this.data.first_name=res['data']['nombres'];
        }
        else{
          this.data.last_name='';
          this.data.first_name='';
        }
      })
    } */
  }

  genderChange(){

  }

  ngOnInit(): void {
/*     this.logisticaService.getAllCampus().subscribe((cs:Campus[])=>{
      this.campus=cs;
      this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
        this.areas=as;
      })
    }) */
  }


}



@Component({
  selector: 'dialog-editArea',
  templateUrl: 'dialog-editArea.html',
  styleUrls: ['./areas.component.css']
})
export class DialogEditArea implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];

  constructor(
    public dialogRef: MatDialogRef<DialogEditArea>,
    @Inject(MAT_DIALOG_DATA) public data:Area,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

  save(){
/*     this.usersService.updateUser(this.data).subscribe(res=>{
      if(res){
        this.dialogRef.close('true');
      }
    }) */

  }



  ngOnInit(): void {

/*     console.log(this.data);

    this.logisticaService.getAllCampus().subscribe((cs:Campus[])=>{
      console.log(cs);
      this.campus=cs;
      this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
        this.areas=as;
      })
    }) */
  }


}

