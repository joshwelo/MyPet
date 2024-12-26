// public/firebase-messaging-sw.js
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js'
);

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
  console.log("Received background message", payload);

  // Check if the notification object exists in the payload
  const notification = payload.notification;
  if (notification && notification.title && notification.body) {
    const notificationTitle = notification.title;
    const notificationOptions = {
      body: notification.body,
      icon: '/mypetlogo-copy.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  } else {
    console.warn("Notification payload is missing required properties:", payload);
  }
});

