import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Activity } from '../activity';
import { Area } from '../area';
import { Campus } from '../campus';
import { ClientesService } from '../clientes.service';
import { CookiesService } from '../cookies.service';
import { LogisticaService } from '../logistica.service';
import { Product } from '../product';
import { Proveedor } from '../proveedor';
import { User } from '../user';
import { UsersService } from '../users.service';
import { Collaborator } from '../collaborator';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string = '';

  activities: Activity[] = [];
  acti: Activity = new Activity('','');

  estados=['ACTIVO','INACTIVO'];

  dataSourceActivities: MatTableDataSource<Activity>;


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


  applyFilterProd(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceActivities.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceActivities.paginator) {
      this.dataSourceActivities.paginator.firstPage();
    }
    console
  }
  save(){



 /*     this.logisticaService.getActivityById(this.acti.id).subscribe(res=>{
      if(res){
       // this.dialogRef.close('true');
      }
    })
 */
  }

regActivity(){ 
  console.log('SE ha ingresad0')


    if(this.acti.actividad!='' ){

      console.log(' valor no es nulo o sea funciona', this.acti.actividad)

      console.log(this.acti);

        if(this.acti.id!=null){
            console.log('SI entra a update',this.acti);   
            this.update(this.acti);
           
            this.acti=new Activity('','');
            
          
          

        }
        else{
          this.logisticaService.addActivity(this.acti).subscribe(res=>{
            this.toastr.success('Atividad añadida correctamente')
            this.logisticaService.getActivities('TODOS').subscribe((actList:Activity[])=>{
              this.activities=actList;
              this.dataSourceActivities = new MatTableDataSource(this.activities);
              this.dataSourceActivities.paginator = this.paginator.toArray()[0];
              this.dataSourceActivities.sort = this.sort.toArray()[0];
              console.log(this.acti);
              this.acti=new Activity('','');
           })


          }) 
        }
  }
  else{
    this.toastr.warning('Ingrese valor de descripción')
  }
}
  
  getItemsActivitySelected(ac:Activity){
    this.acti=ac;
    console.log(this.acti);
    window.scrollTo({top:0, behavior:'smooth'});

   }

  update(ac:Activity){
    this.logisticaService.updateActivity(this.acti).subscribe(res=>{
      console.log('entro al update',res)
        this.logisticaService.getActivities('TODOS').subscribe((actList:Activity[])=>{

          this.toastr.success('Atividad actualizada correctamente')
          this.activities=actList;
          this.dataSourceActivities = new MatTableDataSource(this.activities);
          this.dataSourceActivities.paginator = this.paginator.toArray()[0];
          this.dataSourceActivities.sort = this.sort.toArray()[0];
          this.acti=new Activity('','');
          
        })
    });




  }

    
  eliminar(ac:Activity){
    this.logisticaService.deleteActivity(ac.id).subscribe(res=>{
      this.logisticaService.getActivities('TODOS').subscribe((actList:Activity[])=>{
        this.activities=actList;
        this.dataSourceActivities = new MatTableDataSource(this.activities);
        this.dataSourceActivities.paginator = this.paginator.toArray()[0];
        this.dataSourceActivities.sort = this.sort.toArray()[0];
      })
    });
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

                  })

  
                }
              })
  
            }
          })
        })


      });

      this.acti=new Activity('','ACTIVO');

      this.logisticaService.getActivities('TODOS').subscribe((actList:Activity[])=>{
        this.activities=actList;
        this.dataSourceActivities = new MatTableDataSource(this.activities);
        this.dataSourceActivities.paginator = this.paginator.toArray()[0];
        this.dataSourceActivities.sort = this.sort.toArray()[0];
      })

    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

}




