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
import { UserSession } from '../user_session';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  user: User = new User('','','','','','',0,0,'','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

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

  regActivity(){
    this.logisticaService.addActivity(this.acti).subscribe(res=>{
      if(res){
        this.logisticaService.getActivities('TODOS').subscribe((actList:Activity[])=>{
          this.activities=actList;
          this.dataSourceActivities = new MatTableDataSource(this.activities);
          this.dataSourceActivities.paginator = this.paginator.toArray()[0];
          this.dataSourceActivities.sort = this.sort.toArray()[0];
        })
        this.acti=new Activity('','');
      }
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

        this.acti=new Activity('','ACTIVO');

        this.logisticaService.getActivities('TODOS').subscribe((actList:Activity[])=>{
          this.activities=actList;
          this.dataSourceActivities = new MatTableDataSource(this.activities);
          this.dataSourceActivities.paginator = this.paginator.toArray()[0];
          this.dataSourceActivities.sort = this.sort.toArray()[0];
        })

      })

    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

}




