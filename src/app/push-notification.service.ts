import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  messaging: firebase.messaging.Messaging;

  constructor() {
    // firebase.initializeApp(environment.firebaseConfig);
    // this.messaging=firebase.messaging();
  }

  requestPermission=()=>{
    return new Promise(async(resolve, reject)=>{
      const permission = await Notification.requestPermission();
      if(permission==="granted"){
        const tokenFirebase = await this.messaging.getToken();
        resolve(tokenFirebase);
      }
      else{
        reject(new Error("No se otorgaron los permisos"));
      }
    })
  }

  private messagingObservable = new Observable(observe=>{
    this.messaging.onMessage(payload=>{
      observe.next(payload);
    })
  })

  receiveMessage(){
    return this.messagingObservable;
  }
}
