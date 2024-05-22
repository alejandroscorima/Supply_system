import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  messagingFirebase: firebase.messaging.Messaging;

  constructor() {
    firebase.initializeApp(environment.firebaseConfig);
    this.messagingFirebase=firebase.messaging();
  }

  requestPermission=()=>{
    return new Promise(async (resolve,reject)=>{
      const permission = await Notification.requestPermission();
      if(permission==="granted"){
        const tokenFirebase = await this.messagingFirebase.getToken();
      }
      else{
        reject(new Error("No se otorgaron los permisos"));
      }
    })
  }

  private messagingObservable =  new Observable(observe=>{
    this.messagingFirebase.onMessage(payload=>{
      observe.next(payload);
    });
  })

  receiveMessage(){
    return this.messagingObservable;
  }

}
