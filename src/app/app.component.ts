
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Area } from './area';
import { Campus } from './campus';
import { CookiesService } from './cookies.service';
import { User } from './user';
import { UsersService } from './users.service';
import { LogisticaService } from './logistica.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Collaborator } from './collaborator';
import { Payment } from './payment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string = '';
  logged;

  today: Date;
  expirationDate: Date;

  @ViewChild(MatSidenav) sidenav!: MatSidenav;


  constructor(private router: Router, private usersService:UsersService,
              private logisticaService:LogisticaService,
              private cookiesService:CookiesService,
              private cookies:CookiesService,
              private toastr: ToastrService,){}

  logout(){
    this.cookiesService.deleteToken('user_id');
    this.cookiesService.deleteToken('user_role');
    location.reload();
  }

  ngOnInit() {


    this.usersService.getPaymentByClientId(1).subscribe((resPay:Payment)=>{
      console.log(resPay);
      if(resPay.error){
        this.cookies.deleteToken("user_id");
        this.cookies.deleteToken("user_role");
        this.cookies.deleteToken('sala');
        this.cookies.deleteToken('onSession');
        console.error('Error al obtener el pago:', resPay.error);
        this.toastr.error('Error al obtener la licencia: '+resPay.error);
        this.router.navigateByUrl('/login');
        console.log('No cumple licencia en APP MODULE');

      }
      else{

        this.today = new Date();
        this.expirationDate = new Date(resPay.date_expire);
        
        // Calcular la diferencia en milisegundos
        var timeDiff = this.expirationDate.getTime() - this.today.getTime();
        
        // Convertir la diferencia de milisegundos a días
        var daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if(daysLeft<3){
          this.toastr.info("License expiration notice: "+daysLeft+" day(s) remaining");
        }

        if(this.cookiesService.checkToken('user_id')){
          this.user_id=parseInt(this.cookiesService.getToken('user_id'));
          this.user_role=this.cookiesService.getToken('user_role');
    
          this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
            console.log(u);
    
            this.sidenav.open();
            console.log(window.innerWidth)
            if(window.innerWidth<500){
              this.sidenav.close();
            }
    
            this.user=u;
            this.usersService.getCollaboratorByUserId(this.user.user_id).subscribe((c:Collaborator)=>{
              console.log(c);
              this.colab=c;
              this.logisticaService.getAreaById(this.colab.area_id).subscribe((ar:Area)=>{
                if(ar){
                  this.user_area=ar;
                  this.logisticaService.getCampusById(this.colab.campus_id).subscribe((camp:Campus)=>{
                    if(camp){
                      this.user_campus=camp;
      
                    }
                    else{
                      this.toastr.warning("Sede no asignada para el usuario");
                    }
                  })
      
                }
                else{
                  this.toastr.warning("Area no asignada para el usuario");
                  this.logisticaService.getCampusById(this.colab.campus_id).subscribe((camp:Campus)=>{
                    if(camp){
                      this.user_campus=camp;
      
                    }
                    else{
                      this.toastr.warning("Sede no asignada para el usuario");
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
    },
    (error) => {
    
      this.cookies.deleteToken("user_id");
      this.cookies.deleteToken("user_role");
      this.cookies.deleteToken('sala');
      this.cookies.deleteToken('onSession');
      console.error('Error al obtener el pago:', error);

      // Maneja el error aquí según tus necesidades
      this.toastr.error('Error al obtener la licencia: '+error);
      this.router.navigateByUrl('/login');
    });



  }
}


