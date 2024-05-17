import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor() {
    const messaging = getMessaging();
    this.requestPermission(messaging);
    this.listen(messaging);
  }

  requestPermission(messaging) {
    getToken(messaging, { vapidKey: 'tu-vapid-key' })
      .then((currentToken) => {
        if (currentToken) {
          console.log('Token de notificación push:', currentToken);
          // Envía el token al servidor y actualiza la interfaz de usuario si es necesario
        } else {
          console.log('No se pudo obtener el token de notificación push. Solicita permiso para generar uno.');
        }
      }).catch((err) => {
        console.log('Ocurrió un error al obtener el token de notificación push', err);
      });
  }

  listen(messaging) {
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
      // Maneja el mensaje recibido
    });
  }

}
