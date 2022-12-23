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
import { UserSession } from '../user_session';

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.css']
})
export class CampusComponent implements OnInit {

  user: User = new User('','','','','','',0,0,'','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  listaCampus: Campus[]= [];
  dataSourceCampus: MatTableDataSource<Campus>;

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

  logout(){
    var session_id=this.cookiesService.getToken('session_id');
    this.usersService.deleteSession(session_id).subscribe(resDel=>{
      if(resDel){
        this.cookiesService.deleteToken('session_id');
        location.reload();
      }
    })
  }

  applyFilterU(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceCampus.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceCampus.paginator) {
      this.dataSourceCampus.paginator.firstPage();
    }
  }

  new(){
    var dialogRef;

    var newCampus: Campus = new Campus('','','','','','');

    dialogRef=this.dialog.open(DialogNewCampus,{
      data:newCampus,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Agregado!')
      }
    })
  }

  edit(c:Campus){
    var dialogRef;

    dialogRef=this.dialog.open(DialogEditCampus,{
      data:c,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Editado!')
      }
    })
  }

  ngOnInit(): void {
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
                      this.listaCampus=cs;
                      this.dataSourceCampus = new MatTableDataSource(this.listaCampus);
                      this.dataSourceCampus.paginator = this.paginator.toArray()[0];
                      this.dataSourceCampus.sort = this.sort.toArray()[0];
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

}



@Component({
  selector: 'dialog-newCampus',
  templateUrl: 'dialog-newCampus.html',
  styleUrls: ['./campus.component.css']
})
export class DialogNewCampus implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];


  constructor(
    public dialogRef: MatDialogRef<DialogNewCampus>,
    @Inject(MAT_DIALOG_DATA) public data:Campus,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}


  save(){
/*     this.usersService.getUser(this.data.username,this.data.password).subscribe(resU=>{
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
  selector: 'dialog-editCampus',
  templateUrl: 'dialog-editCampus.html',
  styleUrls: ['./campus.component.css']
})
export class DialogEditCampus implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];

  constructor(
    public dialogRef: MatDialogRef<DialogEditCampus>,
    @Inject(MAT_DIALOG_DATA) public data:Campus,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

  companyChange(){

  }

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

