import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from './firebase'; // import initialized Firebase app

const messaging = getMessaging(firebaseApp);

// Request notification permission from the user
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

// Get FCM token for the user’s device
export async function getFCMToken() {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: 'your-vapid-key'  // Add VAPID key from Firebase Console
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // Save the token to your backend or wherever needed
      return currentToken;
    } else {
      console.log('No registration token available.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
  }
}

// Listen for incoming messages when app is in foreground
export function listenForMessages() {
  onMessage(messaging, (payload) => {
    console.log('Message received: ', payload);
    // Handle message as needed (e.g., show notification, update UI)
  });
}

// Setup notifications if enabled
export async function setupNotifications(notificationsEnabled) {
  if (notificationsEnabled) {
    await requestNotificationPermission();
    const token = await getFCMToken();
    if (token) {
      // You can further handle token, like sending it to the backend
    }
    listenForMessages(); // start listening for incoming messages
  }
}
