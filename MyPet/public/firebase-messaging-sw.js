// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCE8o7wFc2JCisxepJ_X4DzQhKpx0hPM_o",
    authDomain: "mypet-80eb4.firebaseapp.com",
    databaseURL: "https://mypet-80eb4-default-rtdb.firebaseio.com",
    projectId: "mypet-80eb4",
    storageBucket: "mypet-80eb4.appspot.com",
    messagingSenderId: "953924048342",
    appId: "1:953924048342:web:f286c21449c09b5f3f8077",
    measurementId: "G-Z8QEPL29RY"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/mypetlogo-copy.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
