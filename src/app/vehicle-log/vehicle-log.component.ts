import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LogisticaService } from '../logistica.service';
import { ToastrService } from 'ngx-toastr';
import { Vehicle } from '../vehicle';
import { Activity } from '../activity';
import { VeActivity } from '../vehicle_activity';

import { UsersService } from '../users.service';
import { User } from '../user';
import { Collaborator } from '../collaborator';
import { CookiesService } from '../cookies.service';
@Component({
  selector: 'app-vehicle-log',
  templateUrl: './vehicle-log.component.html',
  styleUrl: './vehicle-log.component.css'
})
export class VehicleLogComponent implements OnInit {
  usersOnSesion: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  ///Establece fecha y hora automatica////
  newDevice = {
    date_init: ''
    };
    currentTime: string = '';
   
    
  /////////////////////////////////////////  
  allVehicle: Vehicle []=[];
  newVehicle: Vehicle =   new Vehicle('','','','','','','','');
  viowCourse=true;
  showActivity: boolean = false; 
  
  newActivity: VeActivity= new VeActivity(0,0,0,'','','','','','','','');
  nombreCompleto: string = '';
  logged;
  user_id: number = 0;
 
  constructor(
    private logisticaservise:LogisticaService,  private toastr: ToastrService,
    private usersService:UsersService,     private cookiesService:CookiesService,
   ){}
  ngOnInit(): void {
       
    if(this.cookiesService.checkToken('user_id')){
      this.logged=true;

      this.user_id=parseInt(this.cookiesService.getToken('user_id'));
      
      this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
        console.log(u);

        this.usersOnSesion=u;
      
      })
    }
    this.logisticaservise.getAllVehicles().subscribe(
      (allVehicleRes: Vehicle[]) => {
        this.allVehicle = allVehicleRes; // Asigna el resultado a this.allVehicle
      },
      (error) => {
        console.error('Error fetching vehicles:', error);
      }
    );
     // Establecer la fecha actual cuando el componente se inicializa
     this.newActivity.date_init = this.getCurrentDate();
     this.currentTime = this.getCurrentTime();
  }
  

  saveActivity() {
    console.log(this.newActivity); // Verifica los datos aquí
    this.logisticaservise.postLog(this.newActivity).subscribe((resActivity: any) => {
      if (resActivity && resActivity['resultado'] === true) {
        this.toastr.success('El vehículo fue agregado exitosamente');
      } else {
        this.toastr.error('Error al agregar el vehículo.');
      }
      console.log('Respuesta del servidor:', resActivity);
    }, error => {
      console.error('Error al guardar la actividad:', error);
      this.toastr.error('Ocurrió un error al guardar la actividad.');
    });
  }
  
  
   
  toggleActivity() {
    this.showActivity = !this.showActivity;  // Cambia el estado de la variable
  }

  openModal(){
    document.getElementById("buttonActivityModal")?.click()
  }

  closeModal(){
    document.getElementById("buttonActivityModal")?.click()
  }
  btncourse(){
    this.viowCourse=false;
  }

 ///////Autorellena fecha//////
  private getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2); // Meses en formato MM
    const day = ('0' + today.getDate()).slice(-2); // Días en formato DD
    return `${year}-${month}-${day}`;
  }
 ///////////////////////////////// 

 //////////Autorellena la hora///
  private getCurrentTime(): string {
    const now = new Date();
    const hours = ('0' + now.getHours()).slice(-2); // Horas en formato HH
    const minutes = ('0' + now.getMinutes()).slice(-2); // Minutos en formato MM
    return `${hours}:${minutes}`;
  }
 ////////////////////////////////

}
