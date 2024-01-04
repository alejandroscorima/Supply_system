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
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  userToAdd: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');

  user_id: number = 0;
  user_role : string = '';

  listaUsers: User[]= [];
  dataSourceUsers: MatTableDataSource<User>;

  campus: Campus[] = [];
  areas: Area[] = [];
  users: User[] = [];
  docTypes:string[]=['DNI','CARNET DE EXTRANJERIA','PASAPORTE'];
  roleTypes:string[]=['USUARIO','USUARIO AVANZADO','ASISTENTE','ADMINISTRADOR','SUPER ADMINISTRADOR','SUPERVISOR'];

  generos:string[]=['MASCULINO','FEMENINO','OTRO'];
  estadosCivil:string[]=['CASADO','SOLTERO','VIUDO','DIVORCIADO/SEPARADO','NO DEFINIDO'];

  roleSelected: string;
  typeSelected: string;
  personalSelected: User;

  listRoleSelected: string;

  newUser = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  newColab = new Collaborator(0,0,'',0,'','','','','','','','','');

  usersDisplayedColumns = ['type_doc','doc_number','first_name','paternal_surname','maternal_surname','username','supply_role','settings'];
  usersDisplayedColumnsPhone = ['type_doc','doc_number','first_name','paternal_surname','maternal_surname','username','supply_role','settings'];
  attendedDisplayedColumns = ['campus','date_start','date_end','hour_start','hour_end','reason','colab','user','type','status','result'];
  attendedDisplayedColumnsPhone = ['campus','date_start','date_end','hour_start','hour_end','reason','colab','user','type','status','result'];

  dateStart;
  dateEnd;
  anio;
  mes;
  dia;

  roles=['NINGUNO','USUARIO','USUARIO AVANZADO','SUPER USUARIO','ASISTENTE','ADMINISTRADOR','SUPER ADMINISTRADOR','SUPERVISOR'];

  public demo1TabIndex = 1;

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

  setEstadocivilUser(event:any){

    const selectedValue=event.target.value;
    this.newUser.civil_status=selectedValue;
    console.log(this.newUser.civil_status);
  }
  setGeneroUser(event:any){

    const selectedValue=event.target.value;
    this.newUser.gender=selectedValue;
    console.log(this.newUser.gender);
  }
  

  setRolUser(event:any){

    const selectedValue=event.target.value;
    this.roleSelected=selectedValue;
    
  }
  setDocUser(event:any){

    const selectedValue=event.target.value;
    this.typeSelected=selectedValue;
    
  }
  applyFilterU(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceUsers.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceUsers.paginator) {
      this.dataSourceUsers.paginator.firstPage();
    }
  }

  editUser(a){
    var dialogRef;
    dialogRef = this.dialog.open(DialogEditUser,{
      data: a,
    })
    dialogRef.afterClosed().subscribe(res => {
      if(res){
        
      }
    })
  }

  async updateUsersInfo () {

    for(const u of this.listaUsers){
      console.log(u);
      if(u.type_doc=='DNI'&& (u.address=='' || u.address==null)){
        console.log(u.doc_number);
        var res = await this.usersService.getPersonFromReniec(u.doc_number).toPromise();
        console.log(res);
        if(res['success']){
          u.paternal_surname=res['data']['apellido_paterno'];
          u.maternal_surname=res['data']['apellido_materno'];
          u.first_name=res['data']['nombres'];
          u.birth_date=res['data']['fecha_nacimiento'];
          u.civil_status=res['data']['estado_civil'];
          u.region=res['data']['departamento'];
          u.province=res['data']['provincia'];
          u.district=res['data']['distrito'];
          u.address=res['data']['direccion'];

          var e = await this.usersService.updateUser(u).toPromise();

        }
      }
    }

    this.listaUsers.forEach((u:User)=>{

    })
  }

  changeName(e){
    this.newUser.first_name= e.toUpperCase();
    if(this.newUser.first_name.length>0&&this.newUser.paternal_surname.length>0){
      this.newUser.username=this.newUser.first_name.substring(0,1)+this.newUser.paternal_surname;
    }
  }

  changeRole(userToUpdate:User){
    console.log(userToUpdate);
    this.usersService.updateUser(userToUpdate).subscribe(resUpdt=>{
      if(resUpdt){
        this.toastr.success('Rol actualizado con éxito')
      }
      else{
        this.toastr.error('Ocurrió un error')
      }
    })

  }



  changeDoc(userToUpdate:User){
    console.log(userToUpdate);
    this.usersService.updateUser(userToUpdate).subscribe(resUpdt=>{
      if(resUpdt)
         this.toastr.success('Doc actualizado con éxito')

     else
       this.toastr.error('Ocurrió un error')

   })

}
 
  searchDNI(){
    this.logisticaService.getClientFromReniec(this.newUser.doc_number).subscribe(res=>{
      console.log(res);
      if(res['success']){
        this.newUser.first_name=res['data']['nombres'];
        this.newUser.paternal_surname=res['data']['apellido_paterno'];
        this.newUser.maternal_surname=res['data']['apellido_materno'];
        this.newUser.gender=res['data']['sexo'];
        this.newUser.birth_date=res['data']['fecha_nacimiento'];
        this.newUser.civil_status=res['data']['estado_civil'];
        this.newUser.address=res['data']['direccion'];
        this.newUser.district=res['data']['distrito'];
        this.newUser.province=res['data']['provincia'];
        this.newUser.region=res['data']['departamento'];
        this.newUser.username=this.newUser.first_name.substring(0,1)+this.newUser.paternal_surname;
      }

    })
  }

  new(){
    var dialogRef;

    var newUser: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
    var newColab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');

    dialogRef=this.dialog.open(DialogNewUser,{
      data:newUser,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Agregado!')
      }
    })
  }

  edit(u:User){
    var dialogRef;

    dialogRef=this.dialog.open(DialogEditUser,{
      data:u,
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


        this.usersService.getCollaboratorByUserId(this.user.user_id).subscribe((c:Collaborator)=>{
          this.colab=c;
          this.logisticaService.getAreaById(this.colab.area_id).subscribe((ar:Area)=>{
            if(ar){
              this.user_area=ar;
              this.logisticaService.getCampusById(this.colab.campus_id).subscribe((camp:Campus)=>{
                if(camp){
                  this.user_campus=camp;

                  this.usersService.getAllUsersNew().subscribe((us:User[])=>{
                    this.listaUsers=us;
                    this.dataSourceUsers = new MatTableDataSource(this.listaUsers);
                    this.dataSourceUsers.paginator = this.paginator.toArray()[0];
                    this.dataSourceUsers.sort = this.sort.toArray()[0];
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

  saveUser(){
    this.usersService.getUserByDocNew(this.newUser.doc_number).subscribe(res=>{
      if(res){
        this.toastr.error("Ya existe un usuario registrado con el número de documento: "+this.newUser.doc_number);
      }
      else{
        this.newUser.type_doc=this.typeSelected;
        this.newUser.supply_role=this.roleSelected;
        this.newUser.password=this.newUser.doc_number;
        this.newUser.latitud='0';
        this.newUser.longitud='0';
        if(this.newUser.gender=='FEMENINO'){
          this.newUser.photo_url='http://52.5.47.64/HRControl/assets/user-female.png'
        }
        else{
          this.newUser.photo_url='http://52.5.47.64/HRControl/assets/user-male.png'
        }
        this.usersService.addUser(this.newUser).subscribe(
          (resAddU: any) => {
            console.log(resAddU);
        
            if (resAddU.resultado) {
              this.toastr.success("Usuario agregado");
              // Si la inserción fue exitosa, resAddU.lastInsertedId contiene el ID del usuario insertado
              this.newColab.user_id=resAddU.lastInsertedId;
              this.usersService.addColab(this.newColab).subscribe(
                resAddC => {
                  if(resAddC){
                    // Lógica adicional después de agregar el colaborador
                    console.log('Colaborador agregado correctamente.');
                    this.toastr.success("Colaborador agregado");
                  }
                  else{
                    this.toastr.error("No se pudo agregar el colaborador");
                  }
                },
                (error) => {
                  console.error('Error al agregar el colaborador:', error);
                  this.toastr.error('No se pudo agregar el colaborador.');
                }
              );
            } else {
              // Si hubo un error en la inserción del usuario
              console.error('Error al insertar el usuario:', resAddU.error);
              this.toastr.error('No se pudo crear el usuario.');
            }
          },
          (error) => {
            // Manejar errores de la solicitud HTTP
            console.error('Error en la solicitud HTTP:', error);
            this.toastr.error('Error en la solicitud HTTP.');
          }
        );
      }
    })
  }

}



@Component({
  selector: 'dialog-newUser',
  templateUrl: 'dialog-newUser.html',
  styleUrls: ['./users.component.css']
})
export class DialogNewUser implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];


  constructor(
    public dialogRef: MatDialogRef<DialogNewUser>,
    @Inject(MAT_DIALOG_DATA) public data:User,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}


  save(){
    this.data.password=this.data.doc_number;
    this.usersService.getUserNew(this.data.username,this.data.password).subscribe(resU=>{
      if(resU){
        this.toastr.warning('USUARIO YA REGISTRADO');
      }
      else{
/*         this.usersService.addUser(this.data).subscribe(res=>{
          console.log(res);
          if(res){
            this.dialogRef.close('true');
          }
        }) */
      }
    })

  }

  changeDoc(){
    if(this.data.doc_number.length>=8){
      this.logisticaService.getClientFromReniec(this.data.doc_number).subscribe(res=>{
        if(res){
          this.data.paternal_surname=res['data']['apellido_paterno']
          this.data.maternal_surname=res['data']['apellido_materno'];
          this.data.first_name=res['data']['nombres'];
        }
        else{
          this.data.paternal_surname='';
          this.data.maternal_surname='';
          this.data.first_name='';
        }
      })
    }
  }

  genderChange(){

  }

  ngOnInit(): void {
    this.logisticaService.getAllCampus().subscribe((cs:Campus[])=>{
      this.campus=cs;
      this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
        this.areas=as;
      })
    })
  }


}



@Component({
  selector: 'dialog-editUser',
  templateUrl: 'dialog-editUser.html',
  styleUrls: ['./users.component.css']
})
export class DialogEditUser implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];

  colabOnEdit: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');


  areaSelected: Area;
  campusSelected: Campus;

  areaList: Area[]=[];
  campusList: Campus[]=[];

  constructor(
    public dialogRef: MatDialogRef<DialogEditUser>,
    @Inject(MAT_DIALOG_DATA) public data:User,
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

  changeArea(){
    this.colabOnEdit.area_id=this.areaSelected.area_id;
    this.usersService.updateCollaborator(this.colabOnEdit).subscribe(res=>{
      if(res){
        this.toastr.success("Actualizado")
      }
    });

  }

  changeCampus(){
    this.colabOnEdit.campus_id=this.campusSelected.campus_id;
    this.usersService.updateCollaborator(this.colabOnEdit).subscribe(res=>{
      if(res){
        this.toastr.success("Actualizado")
      }
    });
  }



  ngOnInit(): void {

    console.log(this.data);

    this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
      this.areaList=as;
      this.logisticaService.getAllCampus().subscribe((cs:Campus[])=>{
        this.campusList=cs;
        this.usersService.getCollaboratorByUserId(this.data.user_id).subscribe((resColab:Collaborator)=>{
          this.colabOnEdit=resColab;
          console.log(this.colabOnEdit.area_id);
          console.log(this.areaList)
          console.log(this.areaList.find(a => a.area_id === this.colabOnEdit.area_id))
          this.areaSelected = this.areaList.find(a => a.area_id === this.colabOnEdit.area_id);

          console.log(this.colabOnEdit.campus_id)
          this.campusSelected = this.campusList.find(b => {
            console.log(b); // Imprimirá el valor de b en la consola
            console.log(b.campus_id);
            console.log(this.colabOnEdit.campus_id);
            console.log(b.campus_id === this.colabOnEdit.campus_id)
            return b.campus_id === this.colabOnEdit.campus_id;
          });
          

        })
      })
    })
  }


}

