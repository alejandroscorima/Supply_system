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
import { Product } from '../product';
import { Proveedor } from '../proveedor';
import { User } from '../user';
import { UsersService } from '../users.service';
import { UserSession } from '../user_session';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.css']
})
export class ProvidersComponent implements OnInit {

  user: User = new User('','','','','','',0,0,'','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  p: Product = new Product('','','','','','','','','NO',false);
  prov: Proveedor = new Proveedor('','','','','','');
  provActive;

  listaProviders: Proveedor[]= [];
  listaProvidersActive: Proveedor[]= [];
  listaProducts: Product[]= [];

  statusExonerado=['NO','SI'];

  dataSourceProviders: MatTableDataSource<Proveedor>;
  dataSourceProducts: MatTableDataSource<Product>;

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


  applyFilterProv(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceProviders.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceProviders.paginator) {
      this.dataSourceProviders.paginator.firstPage();
    }
  }

  applyFilterProd(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceProducts.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceProducts.paginator) {
      this.dataSourceProducts.paginator.firstPage();
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

  provChange(){
    this.logisticaService.getAllProducts(this.provActive).subscribe((prodl:Product[])=>{
      this.listaProducts=prodl;
      this.dataSourceProducts = new MatTableDataSource(this.listaProducts);
      this.dataSourceProducts.paginator = this.paginator.toArray()[1];
      this.dataSourceProducts.sort = this.sort.toArray()[1];
    })
  }

  new(){
    var dialogRef;

    var newUser: User = new User('','','','','','',0,0,'','');

    dialogRef=this.dialog.open(DialogNewProvider,{
      data:newUser,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Agregado!');
        this.logisticaService.getAllProviders().subscribe((provl:Proveedor[])=>{
          this.listaProviders=provl;
          this.dataSourceProviders = new MatTableDataSource(this.listaProviders);
          this.dataSourceProviders.paginator = this.paginator.toArray()[0];
          this.dataSourceProviders.sort = this.sort.toArray()[0];
        })
        this.logisticaService.getAllProducts(this.provActive).subscribe((prodl:Product[])=>{
          this.listaProducts=prodl;
          this.dataSourceProducts = new MatTableDataSource(this.listaProducts);
          this.dataSourceProducts.paginator = this.paginator.toArray()[1];
          this.dataSourceProducts.sort = this.sort.toArray()[1];
        })
        this.logisticaService.getActiveProviders().subscribe((provl:Proveedor[])=>{
          this.listaProvidersActive=provl;
          this.listaProvidersActive.unshift(new Proveedor('TODOS','TODOS','','','ACTIVO','TODOS'));
        })
      }
    })
  }

  edit(u:Proveedor){
    var dialogRef;

    dialogRef=this.dialog.open(DialogEditProvider,{
      data:u,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Editado!');
        this.logisticaService.getAllProviders().subscribe((provl:Proveedor[])=>{
          this.listaProviders=provl;
          this.dataSourceProviders = new MatTableDataSource(this.listaProviders);
          this.dataSourceProviders.paginator = this.paginator.toArray()[0];
          this.dataSourceProviders.sort = this.sort.toArray()[0];
        })
        this.logisticaService.getAllProducts(this.provActive).subscribe((prodl:Product[])=>{
          this.listaProducts=prodl;
          this.dataSourceProducts = new MatTableDataSource(this.listaProducts);
          this.dataSourceProducts.paginator = this.paginator.toArray()[1];
          this.dataSourceProducts.sort = this.sort.toArray()[1];
        })
        this.logisticaService.getActiveProviders().subscribe((provl:Proveedor[])=>{
          this.listaProvidersActive=provl;
          this.listaProvidersActive.unshift(new Proveedor('TODOS','TODOS','','','ACTIVO','TODOS'));
        })
      }
    })
  }


  newProduct(){
    var dialogRef;

    var newProd: Product = new Product('','','','','','','','','NO',false);

    dialogRef=this.dialog.open(DialogNewProduct,{
      data:newProd,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Agregado!');

        this.logisticaService.getAllProducts(this.provActive).subscribe((prodl:Product[])=>{
          this.listaProducts=prodl;
          this.dataSourceProducts = new MatTableDataSource(this.listaProducts);
          this.dataSourceProducts.paginator = this.paginator.toArray()[1];
          this.dataSourceProducts.sort = this.sort.toArray()[1];
        })
      }
    })
  }

  editProduct(p:Product){
    var dialogRef;

    dialogRef=this.dialog.open(DialogEditProduct,{
      data:p,
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.toastr.success('Editado!');

        this.logisticaService.getAllProducts(this.provActive).subscribe((prodl:Product[])=>{
          this.listaProducts=prodl;
          this.dataSourceProducts = new MatTableDataSource(this.listaProducts);
          this.dataSourceProducts.paginator = this.paginator.toArray()[1];
          this.dataSourceProducts.sort = this.sort.toArray()[1];
        })
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

                    this.usersService.getAllUsers().subscribe((us:User[])=>{
/*                       this.listaUsers=us;
                      this.dataSourceUsers = new MatTableDataSource(this.listaUsers);
                      this.dataSourceUsers.paginator = this.paginator.toArray()[0];
                      this.dataSourceUsers.sort = this.sort.toArray()[0]; */
                    })
                  }
                })

              }
            })

          });
        }
        this.provActive='TODOS';
        this.logisticaService.getAllProviders().subscribe((provl:Proveedor[])=>{
          this.listaProviders=provl;
          this.dataSourceProviders = new MatTableDataSource(this.listaProviders);
          this.dataSourceProviders.paginator = this.paginator.toArray()[0];
          this.dataSourceProviders.sort = this.sort.toArray()[0];
        })
        this.logisticaService.getAllProducts(this.provActive).subscribe((prodl:Product[])=>{
          this.listaProducts=prodl;
          this.dataSourceProducts = new MatTableDataSource(this.listaProducts);
          this.dataSourceProducts.paginator = this.paginator.toArray()[1];
          this.dataSourceProducts.sort = this.sort.toArray()[1];
        })
        this.logisticaService.getActiveProviders().subscribe((provl:Proveedor[])=>{
          this.listaProvidersActive=provl;
          this.listaProvidersActive.unshift(new Proveedor('TODOS','TODOS','','','ACTIVO','TODOS'));
        })
      })

    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

}



@Component({
  selector: 'dialog-newProvider',
  templateUrl: 'dialog-newProvider.html',
  styleUrls: ['./providers.component.css']
})
export class DialogNewProvider implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];


  constructor(
    public dialogRef: MatDialogRef<DialogNewProvider>,
    @Inject(MAT_DIALOG_DATA) public data:Proveedor,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}


  save(){

    this.logisticaService.addProvider(this.data).subscribe(res=>{
      if(res){
        this.dialogRef.close('true');
      }
    })

  }

  changeDoc(){
    if(this.data.ruc.length>=11){
      this.logisticaService.getConsultaRUC(this.data.ruc).subscribe(res=>{
        if(res){
          this.toastr.success('Datos obtenidos correctamente');
          this.data.razon_social=res['data']['nombre_o_razon_social'];
          this.data.direccion=res['data']['direccion_completa'];
        }
        else{
          this.toastr.warning('No se obtuvieron datos');
          this.data.razon_social='';
          this.data.direccion='';
        }
      })
    }
  }

  genderChange(){

  }

  ngOnInit(): void {
    this.data.estado='ACTIVO'
    this.logisticaService.getAllCampus().subscribe((cs:Campus[])=>{
      this.campus=cs;
      this.logisticaService.getAllAreas().subscribe((as:Area[])=>{
        this.areas=as;
      })
    })
  }


}



@Component({
  selector: 'dialog-editProvider',
  templateUrl: 'dialog-editProvider.html',
  styleUrls: ['./providers.component.css']
})
export class DialogEditProvider implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];

  estados;

  constructor(
    public dialogRef: MatDialogRef<DialogEditProvider>,
    @Inject(MAT_DIALOG_DATA) public data:Proveedor,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

  save(){
    this.logisticaService.updateProvider(this.data).subscribe(res=>{
      if(res){
        this.dialogRef.close('true');
      }
    })

  }



  ngOnInit(): void {

    this.estados=['ACTIVO','INACTIVO']
  }


}






@Component({
  selector: 'dialog-newProduct',
  templateUrl: 'dialog-newProduct.html',
  styleUrls: ['./providers.component.css']
})
export class DialogNewProduct implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];

  providers: Proveedor[]= [];


  constructor(
    public dialogRef: MatDialogRef<DialogNewProduct>,
    @Inject(MAT_DIALOG_DATA) public data:Product,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}


  save(){

    this.logisticaService.addProduct(this.data).subscribe(res=>{
      console.log('suscrito')
      console.log(res)
      if(res){
        this.dialogRef.close('true');
      }
    })

  }



  ngOnInit(): void {
    this.logisticaService.getAllProviders().subscribe((ps:Proveedor[])=>{
      this.providers=ps;
    })
  }

  changeExonerado(e){
    if(e.checked){
      this.data.exonerado='SI';
    }
    if(!e.checked){
      this.data.exonerado='NO';
    }
    console.log(this.data.exonerado);
  }


}



@Component({
  selector: 'dialog-editProduct',
  templateUrl: 'dialog-editProduct.html',
  styleUrls: ['./providers.component.css']
})
export class DialogEditProduct implements OnInit {

  genders=['MASCULINO','FEMENINO'];
  roles=['ADMINISTRADOR','USUARIO','ASISTENTE'];
  positions=['JEFE','ASISTENTE','ADMINISTRADOR'];
  areas: Area[]=[];
  campus: Campus[]=[];

  providers: Proveedor[]= [];

  estados;

  constructor(
    public dialogRef: MatDialogRef<DialogEditProduct>,
    @Inject(MAT_DIALOG_DATA) public data:Product,
    private fb: FormBuilder,
    private usersService: UsersService,
    private logisticaService: LogisticaService,
    private toastr: ToastrService,
  ) {}

  save(){
    this.logisticaService.updateProduct(this.data).subscribe(res=>{
      if(res){
        this.dialogRef.close('true');
      }
    })

  }



  ngOnInit(): void {
    console.log(this.data);
    if(this.data.exonerado=='NO'){
      this.data.exonerado_slide=false;
    }
    else{
      this.data.exonerado_slide=true;
    }
    this.logisticaService.getAllProviders().subscribe((ps:Proveedor[])=>{
      this.providers=ps;
    })
  }

  changeExonerado(e){
    if(e.checked){
      this.data.exonerado='SI';
    }
    if(!e.checked){
      this.data.exonerado='NO';
    }
    console.log(this.data.exonerado);
  }


}

