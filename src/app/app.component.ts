
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
import { initFlowbite } from 'flowbite';

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

 superUser : boolean = false;

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
   showHiddenInfo(){

 if(this.user_role=='SUPER USUARIO'||
                this.user_role=='SUPER ADMINISTRADOR'||
                this.user_role=='ADMINISTRADOR'||
                this.user_role=='ASISTENTE'||
                (this.user_role=='USUARIO AVANZADO'&&this.colab.area_id==13)||
                (this.user_role=='USUARIO AVANZADO'&&this.colab.area_id==12))  
                {
                  this.superUser= true;
                }

 }
  ngOnInit() {

    var container1= document.getElementById('container-main-1');
    var container2= document.getElementById('container-main-2');

    initFlowbite();

    



    this.showHiddenInfo();

    this.usersService.getPaymentByClientId(1).subscribe((resPay:Payment)=>{
      console.log(resPay);
      if(resPay.error){
        this.cookies.deleteToken("user_id");
        this.cookies.deleteToken("user_role");
        this.cookies.deleteToken('sala');
        this.cookies.deleteToken('onSession');
        console.error('Error al obtener el pago:', resPay.error);
        this.toastr.error('Error al obtener la licencia: '+resPay.error);
        container1.classList.remove('p-4');
        container1.classList.remove('sm:ml-64');
        container1.classList.remove('dark:bg-gray-900');
        container2.classList.remove('p-4');
        container2.classList.remove('border-2');
        container2.classList.remove('border-gray-200');
        container2.classList.remove('border-dashed');
        container2.classList.remove('rounded-lg');
        container2.classList.remove('dark:border-gray-700');
        container2.classList.remove('mt-14');

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
          this.logged=true;
          container1.classList.add('p-4');
          container1.classList.add('sm:ml-64');
          container1.classList.add('dark:bg-gray-900');
          container2.classList.add('p-4');
          container2.classList.add('border-2');
          container2.classList.add('border-gray-200');
          container2.classList.add('border-dashed');
          container2.classList.add('rounded-lg');
          container2.classList.add('dark:border-gray-700');
          container2.classList.add('mt-14');
          this.user_id=parseInt(this.cookiesService.getToken('user_id'));
          this.user_role=this.cookiesService.getToken('user_role');
    
          this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
            console.log(u);
    
/*             this.sidenav.open();
            console.log(window.innerWidth)
            if(window.innerWidth<500){
              this.sidenav.close();
            } */
    
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
          container1.classList.remove('p-4');
          container1.classList.remove('sm:ml-64');
          container1.classList.remove('dark:bg-gray-900');
          container2.classList.remove('p-4');
          container2.classList.remove('border-2');
          container2.classList.remove('border-gray-200');
          container2.classList.remove('border-dashed');
          container2.classList.remove('rounded-lg');
          container2.classList.remove('dark:border-gray-700');
          container2.classList.remove('mt-14');
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
      container1.classList.remove('p-4');
      container1.classList.remove('sm:ml-64');
      container1.classList.remove('dark:bg-gray-900');
      container2.classList.remove('p-4');
      container2.classList.remove('border-2');
      container2.classList.remove('border-gray-200');
      container2.classList.remove('border-dashed');
      container2.classList.remove('rounded-lg');
      container2.classList.remove('dark:border-gray-700');
      container2.classList.remove('mt-14');
      this.router.navigateByUrl('/login');
    });



  }
}


