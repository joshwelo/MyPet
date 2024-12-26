// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const messaging = getMessaging(app); // Use `app` here, not a new initialization
export async function requestNotificationPermission() {
  try {
    // Check current permission status first
    const currentPermission = Notification.permission;
    console.log('Current Notification Permission:', currentPermission);

    if (currentPermission === 'granted') {
      console.log('Notification permission already granted.');
      return 'granted';
    }

    // If not granted, explicitly request permission
    const permission = await Notification.requestPermission();
    console.log('Requested Notification Permission:', permission);

    if (permission === 'granted') {
      console.log('Notification permission successfully granted.');
      return permission;
    } else if (permission === 'denied') {
      console.warn('Notification permission was denied by the user.');
      return permission;
    } else {
      console.log('Notification permission was dismissed.');
      return permission;
    }
  } catch (error) {
    console.error('Comprehensive error in requesting notification permission:', error);
    return 'denied';
  }
}

// Get token for sending messages
export async function getNotificationToken() {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: "BONv4MJf9MEx3-4kYo-Xuh-mQ48Yn40dyZI9CP4u6YucDCyWZPDSPjjwtk5tWvCa-A8cp3fewAjxjrSn_7yryAM"
    });
    
    if (currentToken) {
      console.log('Token received:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission or check VAPID key.');
      return null;
    }
  } catch (error) {
    console.error('Detailed error while retrieving token:', error);
    return null;
  }
}
export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

// Export initialized services
export { app, auth, db, storage, messaging };
