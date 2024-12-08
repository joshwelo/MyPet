import React, { useState, useEffect } from 'react';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from "firebase/auth";    

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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
                fetchNotifications(user.uid);
            } else {
                console.log("User is not authenticated");
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

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
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                <h4 className="mb-3 mb-md-0 d-flex align-items-center text-truncate">
                                    <i className="bx bx-bell text-primary me-2"></i>
                                    Notifications
                                    {notifications.filter(notification => !notification.read).length > 0 && (
        <span className="badge bg-danger ms-2 rounded-pill">
            {notifications.filter(notification => !notification.read).length}
        </span>
    )}
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