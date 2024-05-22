importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging.js');

firebase.initializeApp(
    {
        apiKey: "AIzaSyADHEkrK_lk0sXAmLykuOXh1RuLm7B83Kw",
        authDomain: "supply-system-28cf8.firebaseapp.com",
        projectId: "supply-system-28cf8",
        storageBucket: "supply-system-28cf8.appspot.com",
        messagingSenderId: "849089768541",
        appId: "1:849089768541:web:d10602bca031a24cbd31b4",
        measurementId: "G-VK4M6BQRYW"
      }
)

const messaging=firebase.messaging()