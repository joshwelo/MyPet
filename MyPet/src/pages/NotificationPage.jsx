import React, { useState, useEffect } from 'react';
import { 
    doc, 
    updateDoc, 
    deleteDoc, 
    collection, 
    query, 
    where,
    getDocs, 
    onSnapshot,
    setDoc, 
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from "firebase/auth";    
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { requestNotificationPermission } from '../firebaseConfig';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [notification, setNotification] = useState(null);

    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [pushNotificationSupported, setPushNotificationSupported] = useState(true);

    const setupPushNotifications = async (currentUserId) => {
        try {
            if (!currentUserId) {
                console.error('No user ID found');
                return;
            }
    
            const messaging = getMessaging();
            const token = await getToken(messaging, {
                vapidKey: "BONv4MJf9MEx3-4kYo-Xuh-mQ48Yn40dyZI9CP4u6YucDCyWZPDSPjjwtk5tWvCa-A8cp3fewAjxjrSn_7yryAM"
            });
    
            console.log('Generated FCM Token:', token);
            console.log('Current User ID:', currentUserId);
    
            if (token) {
                await sendTokenToServer(token, currentUserId);
            }
        } catch (error) {
            console.error('Push notification setup error:', error);
        }
    };
    // Add a new function to check and send notifications
const checkAndSendNotifications = async (currentUserId) => {
    try {
        const q = query(
            collection(db, 'calendar'),
            where('userId', '==', currentUserId)
        );

        const querySnapshot = await getDocs(q);

        const notifications = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        // Get current time
        const currentTime = new Date();

        // Find notifications that are due
        const dueNotifications = notifications.filter((notification) => {
            const eventDateTime = new Date(`${notification.date}T${notification.time}`);
            
            // Check if notification is exactly at the current time or just passed
            return eventDateTime <= currentTime && !notification.notificationSent;
        });

        // Send notifications for each due event
        for (const notification of dueNotifications) {
            try {
                // Send push notification
                await sendPushNotification(currentUserId, notification.eventName, notification.description);

                // Mark notification as sent to prevent duplicate notifications
                const notificationRef = doc(db, 'calendar', notification.id);
                await updateDoc(notificationRef, { notificationSent: true });
            } catch (error) {
                console.error(`Error sending notification for event ${notification.eventName}:`, error);
            }
        }
    } catch (error) {
        console.error("Error checking notifications:", error);
    }
};

// New function to send push notification
const sendPushNotification = async (userId, title, body) => {
    try {
        const response = await fetch('https://mypetserver.onrender.com/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                title: title,
                body: body,
            }),
        });

        const result = await response.json();
        console.log('Push notification result:', result);
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};
    const sendTestNotification = async () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
        
        try {
            console.log('Sending test notification for userId:', userId);
    
            const response = await fetch('https://mypetserver.onrender.com/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    title: 'Test Notification',
                    body: 'This is a test push notification!',
                }),
            });
    
            const result = await response.json();
            console.log('Test notification response:', result);
    
            if (result.success) {
                alert('Test notification sent successfully!');
            } else {
                alert(`Failed to send notification: ${result.message}`);
                console.error('Notification send error details:', result);
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            alert('Failed to send test notification');
        }
    };
    // In your React component
    const sendTokenToServer = async (token, userId) => {
        try {
            // Reference to the specific user's token document in the users-tokens collection
            const tokenRef = doc(db, 'user-tokens', userId);
    
            // Set the document with the FCM token
            await setDoc(tokenRef, {
                token: token,
                userId: userId,
                createdAt: serverTimestamp() // Add a server timestamp for tracking
            }, { merge: true }); // Use merge to update existing document if it exists
    
            console.log('Token successfully stored in Firestore');
    
            // Optional: Still send to backend if needed
            const response = await fetch('https://mypetserver.onrender.com/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fcmToken: token,
                    userId: userId
                })
            });
    
            const result = await response.json();
            console.log('Token registration result:', result);
        } catch (error) {
            console.error('Error sending token to server:', error);
        }
    };
    // Fetch all events that have occurred for the current user
    const fetchNotifications = async (currentUserId) => {
        try {
            const q = query(
                collection(db, 'calendar'),
                where('userId', '==', currentUserId)
            );
    
            const querySnapshot = await getDocs(q);
    
            const fetchedNotifications = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
    
            // Filter for past events considering both date and time
            const filteredNotifications = fetchedNotifications.filter((notification) => {
                const eventDateTime = new Date(`${notification.date}T${notification.time}`);
                const currentDateTime = new Date();
                
                // Return true if the event datetime is before or equal to the current datetime
                return eventDateTime <= currentDateTime;
            });
    
            // Sort notifications by date (most recent first)
            filteredNotifications.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB - dateA;
            });
    
            setNotifications(filteredNotifications);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setIsLoading(false);
        }
    };
    
    // Fetch the current user's ID and notifications
useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            
            // Initial fetch and check
            fetchNotifications(user.uid);

            // Use a more controlled approach for checking notifications
            const checkNotifications = async () => {
                const notifications = await fetchNotificationsToCheck(user.uid);
                
                // Filter notifications that are exactly due or just passed
                const currentTime = new Date();
                const dueNotifications = notifications.filter(notification => {
                    const eventDateTime = new Date(`${notification.date}T${notification.time}`);
                    
                    // Only trigger if not already sent and within a small time window
                    return !notification.notificationSent &&
                           Math.abs(eventDateTime - currentTime) < 60000; // Within 1 minute
                });

                // Send notifications for each due event
                for (const notification of dueNotifications) {
                    try {
                        await sendPushNotification(user.uid, notification.eventName, notification.description);
                        
                        // Update firestore to mark as sent
                        const notificationRef = doc(db, 'calendar', notification.id);
                        await updateDoc(notificationRef, { notificationSent: true });
                    } catch (error) {
                        console.error(`Error processing notification for event ${notification.eventName}:`, error);
                    }
                }
            };

            // Initial check immediately
            checkNotifications();

            // Set up periodic checking (every 5 minutes)
            const notificationInterval = setInterval(checkNotifications, 300000); // 5 minutes

            // Cleanup interval on unmount
            return () => {
                clearInterval(notificationInterval);
                unsubscribe();
            };
        } else {
            console.log("User is not authenticated");
            setIsLoading(false);
        }
    });
}, []); // Empty dependency array to run only once

// Separate function to fetch notifications for checking
const fetchNotificationsToCheck = async (currentUserId) => {
    try {
        const q = query(
            collection(db, 'calendar'),
            where('userId', '==', currentUserId)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching notifications to check:", error);
        return [];
    }
};


    // Mark a notification as read
    const handleMarkAsRead = async (id) => {
        try {
            const notificationRef = doc(db, 'calendar', id);
            await updateDoc(notificationRef, { read: true });

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id ? { ...notification, read: true } : notification
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            const updatePromises = notifications.map(async (notification) => {
                const notificationRef = doc(db, 'calendar', notification.id);
                await updateDoc(notificationRef, { read: true });
            });

            await Promise.all(updatePromises);

            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, read: true }))
            );
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    // Delete a notification
    const handleDeleteNotification = async (id) => {
        try {
            const notificationRef = doc(db, 'calendar', id);
            await deleteDoc(notificationRef);

            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== id)
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    // Format date and time
    const formatDateTime = (date, time) => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return `${formattedDate} at ${time}`;
    };
    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                
                // Create a query for the user's notifications
                const q = query(
                    collection(db, 'calendar'),
                    where('userId', '==', user.uid),
                    orderBy('date', 'desc'), // Sort by date in descending order
                    orderBy('time', 'desc')  // Then sort by time in descending order
                );

                // Set up real-time listener
                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    const fetchedNotifications = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    })).filter((notification) => {
                        // Filter for past events
                        const eventDateTime = new Date(`${notification.date}T${notification.time}`);
                        const currentDateTime = new Date();
                        return eventDateTime <= currentDateTime;
                    });

                    setNotifications(fetchedNotifications);
                    setIsLoading(false);
                }, (error) => {
                    console.error("Error fetching real-time notifications:", error);
                    setIsLoading(false);
                });

                // Setup push notifications
                setupPushNotifications(user.uid);

                // Cleanup function
                return () => {
                    unsubscribeSnapshot();
                    unsubscribeAuth();
                };
            } else {
                console.log("User is not authenticated");
                setIsLoading(false);
            }
        });
    }, []);


    // Render loading state
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0 py-4 bg-light min-vh-100">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        {/* Push Notification Setup Indicator */}
                        {!pushNotificationSupported && (
                            <div className="alert alert-warning" role="alert">
                                <i className="bx bx-bell-off me-2"></i>
                                Push notifications are not supported or blocked. 
                                Please enable notifications in your browser settings.
                            </div>
                        )}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                <h4 className="mb-3 mb-md-0 d-flex align-items-center text-truncate">
                                    <i className="bx bx-bell text-primary me-2"></i>
                                    Notifications
                                </h4>
                                {notifications.length > 0 && (
                                    <button
                                        className="btn btn-outline-primary mt-2 mt-md-0"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        <i className="bx bx-check-circle me-2"></i>
                                        Mark All as Read
                                    </button>
                                )}
                            </div>
                        </div>
    
                        {notifications.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bx bx-bell-off text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                                <p className="h4 text-muted">No notifications</p>
                                <p className="text-muted">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="notification-list">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`card mb-3 border-0 shadow-sm ${notification.read ? 'bg-light' : 'bg-white'}`}
                                    >
                                        <div className="card-body d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                                            <div className="notification-icon me-0 me-sm-3 mb-2 mb-sm-0">
                                                <i className={`bx bx-bell fs-2 ${notification.read ? 'text-muted' : 'text-warning'}`}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start flex-column flex-sm-row mb-1">
                                                    <h5 className="mb-2 mb-sm-0 text-truncate">
                                                        {notification.eventName}
                                                    </h5>
                                                    <small className="text-muted ms-sm-2">
                                                        {formatDateTime(notification.date, notification.time)}
                                                    </small>
                                                </div>
                                                <p className="text-muted mb-2">{notification.description}</p>
                                            </div>
                                            <div className="notification-actions ms-0 ms-sm-3">
                                                <div className="d-flex flex-wrap">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="btn btn-sm btn-outline-success me-2 mb-2"
                                                            title="Mark as Read"
                                                        >
                                                            <i className="bx bx-check"></i>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                        className="btn btn-sm btn-outline-danger mb-2"
                                                        title="Delete Notification"
                                                    >
                                                        <i className="bx bx-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default NotificationsPage;