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

// Export initialized services
export { app, auth, db, storage, messaging };
