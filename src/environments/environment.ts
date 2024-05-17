// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //baseUrl: "http://localhost:8888/Logistica/server",
  //baseUrl: "http://localhost:8888/InventarioPatrimonio/server",
  //baseUrl: "http://localhost:8888/Logistica/server",
  baseUrl: "http://52.5.47.64/Logistica",
  firebaseConfig : {
    apiKey: "AIzaSyADHEkrK_lk0sXAmLykuOXh1RuLm7B83Kw",
    authDomain: "supply-system-28cf8.firebaseapp.com",
    projectId: "supply-system-28cf8",
    storageBucket: "supply-system-28cf8.appspot.com",
    messagingSenderId: "849089768541",
    appId: "1:849089768541:web:d10602bca031a24cbd31b4",
    measurementId: "G-VK4M6BQRYW"
  }
  //baseUrl: "http://localhost/Ingreso/server",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
