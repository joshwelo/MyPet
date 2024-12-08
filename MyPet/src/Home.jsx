import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './authProvider';  // Import the useAuth hook
import logo from './assets/mypetlogo.png';
import './Home.css';  // Import your CSS file for additional styles
import { Alert } from 'react-bootstrap'; // Import Alert from react-bootstrap
import { db } from './firebaseConfig';
import { getAuth, onAuthStateChanged } from "firebase/auth";    
import { query, collection, where, getDocs } from "firebase/firestore";

const Home = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState('HomePage');
  const { currentUser } = useAuth();  // Get current user from context
  const [alert, setAlert] = useState(null);  // State for alert
  const [events, setEvents] = useState([]);  // Store the events
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);



  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
    closeSidebar();
  };
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
  // Text transition effect logic
  const messages = [
    'Remember to keep your pet hydrated!',
    'Regular vet check-ups are key to a healthy pet.',
    'Exercise your pet daily for physical and mental health.',
    'Keep your pet’s vaccinations up to date.',
    'Show your pet love and attention every day.',
    'Remember to keep your pet hydrated!',
    'Regular vet check-ups are key to a healthy pet.',
    'Exercise your pet daily for physical and mental health.',
    'Keep your pet’s vaccinations up to date.',
    'Show your pet love and attention every day.',
    
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000); // Change message every 5 seconds
    return () => clearInterval(interval);
  }, []);


  // Check for upcoming events every minute
  useEffect(() => {
    const checkEvents = () => {
      const now = new Date();

      events.forEach(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}:00`); // Combine date and time
        const fiveMinutesBefore = new Date(eventDateTime.getTime() - 5 * 60 * 1000); // 5 minutes before event
        const fiveMinutesAfter = new Date(eventDateTime.getTime() + 5 * 60 * 1000); // 5 minutes after event

        // Check if current time is within the 5 minutes before or after the event
        if (now >= fiveMinutesBefore && now <= fiveMinutesAfter && !event.notified) {
          // Add the event to the event carousel messages
          setEventMessages((prevMessages) => [
            ...prevMessages,
            `Upcoming event: ${event.eventName} for your pet! Description: ${event.description}.`
          ]);
          event.notified = true; // Mark the event as notified
        }
      });
    };

    const interval = setInterval(checkEvents, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [events]);

  // Event handler to close the alert after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
const formatDateTime = (date, time) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
  });
  return `${formattedDate} at ${time}`;
};

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        {/* Alert Notification */}

        {/* Side bar */}
        <aside id="layout-menu" className={`layout-menu menu-vertical menu bg-menu-theme ${sidebarVisible ? 'visible' : ''}`}>
          <div className="app-brand demo">
            <Link to="HomePage" className="app-brand-link">
              <img src={logo} alt="logo" height="50px" width="50px" />
              <span className="app-brand-text demo menu-text fw-bolder ms-2" style={{ fontSize: '16px' }}>My Pet</span>
            </Link>
            <a href="javascript:void(0);" className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none" onClick={closeSidebar}>
              <i className="bx bx-chevron-left bx-sm align-middle"></i>
            </a>
          </div>
          <div className="menu-inner-shadow"></div>
          <ul className="menu-inner py-1">
            <li className={`menu-item ${activeMenu === 'HomePage' ? 'active' : ''}`} role="menuitem" aria-controls="home" aria-selected={activeMenu === 'HomePage'}>
              <Link to="HomePage" className="menu-link" onClick={() => handleMenuClick('HomePage')}>
                <i className="menu-icon tf-icons bx bx-home-circle"></i>
                <div data-i18n="Analytics">Home</div>
              </Link>
            </li>
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Pet Management</span>
            </li>
            <li className={`menu-item ${activeMenu === 'ProfilePage' ? 'active' : ''}`} role="menuitem" aria-controls="profile" aria-selected={activeMenu === 'ProfilePage'}>
              <Link to="ProfilePage" className="menu-link" onClick={() => handleMenuClick('ProfilePage')}>
                <i className="menu-icon tf-icons bx bxs-dog"></i>
                <div data-i18n="Analytics">Pet Profile</div>
              </Link>
            </li>
            <li className={`menu-item ${activeMenu === 'DiagnosePage' ? 'active' : ''}`} role="menuitem" aria-controls="diagnose" aria-selected={activeMenu === 'DiagnosePage'}>
              <Link to="DiagnosePage" className="menu-link" onClick={() => handleMenuClick('DiagnosePage')}>
                <i className='menu-icon tf-icons bx bx-question-mark'></i>
                <div data-i18n="Analytics">Disease Detection</div>
              </Link>
            </li>
            <li className={`menu-item ${activeMenu === 'CalendarEventsPage' ? 'active' : ''}`} role="menuitem" aria-controls="calendar" aria-selected={activeMenu === 'CalendarEventsPage'}>
              <Link to="CalendarEventsPage" className="menu-link" onClick={() => handleMenuClick('CalendarEventsPage')}>
                <i className="menu-icon tf-icons bx bxs-calendar"></i>
                <div data-i18n="Analytics">Calendar</div>
              </Link>
            </li>
            <li className={`menu-item ${activeMenu === 'PetJournalPage' ? 'active' : ''}`} role="menuitem" aria-controls="calendar" aria-selected={activeMenu === 'PetJournalPage'}>
              <Link to="PetJournalPage" className="menu-link" onClick={() => handleMenuClick('PetJournalPage')}>
              <i className='menu-icon tf-icons bx bxs-book-heart'></i>
                <div data-i18n="Analytics">Pet Journal</div>
              </Link>
            </li>
            <li className={`menu-item ${activeMenu === 'ForumSubTopic' ? 'active' : ''}`} role="menuitem"
            aria-controls="calendar" aria-selected={activeMenu === 'ForumSubTopic'}>
              <Link to="ForumSubTopic" className="menu-link" onClick={() => handleMenuClick('ForumPage')}>
                <i className="menu-icon tf-icons bx bxs-message-alt-detail"></i>
                <div data-i18n="Basic">Forum</div>
              </Link>
            </li>
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">AI and Maps</span>
            </li>
            <li className={`menu-item ${activeMenu === 'AiBreed' ? 'active' : ''}`} role="menuitem" aria-controls="forums" aria-selected={activeMenu === 'AIChat'}>
              <Link to="AiBreed" className="menu-link" onClick={() => handleMenuClick('AiBreed')}>
                <i className="menu-icon tf-icons bx bxs-user-pin"></i>
                <div data-i18n="Basic">AI Breed Scanner</div>
              </Link>
            </li>
            <li className={`menu-item ${activeMenu === 'EstablishmentsPage' ? 'active' : ''}`} role="menuitem" aria-controls="establishments" aria-selected={activeMenu === 'EstablishmentsPage'}>
              <Link to="EstablishmentsPage" className="menu-link" onClick={() => handleMenuClick('EstablishmentsPage')}>
                <i className="menu-icon tf-icons bx bxs-map-pin"></i>
                <div data-i18n="Basic">PetPlace Maps</div>
              </Link>
            </li>
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">About</span>
            </li>
            <li className={`menu-item ${activeMenu === 'About' ? 'active' : ''}`} role="menuitem" aria-controls="about" aria-selected={activeMenu === 'About'}>
              <Link to="About" className="menu-link" onClick={() => handleMenuClick('About')}>
                <i className="menu-icon tf-icons bx bxs-message-dots"></i>
                <div data-i18n="Basic">About</div>
              </Link>
            </li>
          </ul>
        </aside>
        {/* /Side bar */}

        {/* Navbar */}
        <div className="layout-page">
          <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
              <a className="nav-item nav-link px-0 me-xl-4" href="javascript:void(0);" onClick={toggleSidebar}>
                <i className="bx bx-menu bx-sm"></i>
              </a>
            </div>
            {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}
              {/* Display rotating text */}
              <b className="text-transition">
                <div className="train-text">
                  {messages.map((message, index) => (
                    <span key={index} className="scrolling-word">
                      {message}
                    </span>
                  ))}
                </div>
              </b>
            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">

              <ul className="navbar-nav flex-row align-items-center ms-auto">
                <li className="nav-item navbar-dropdown dropdown-user dropdown">
                  <a className="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                    <i className='bx bx-user-circle' style={{ fontSize: '2rem' }}></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="UserPage">
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-3">
                            <div className="avatar">
                              <i className='bx bxs-user-circle' style={{ fontSize: '2rem' }}></i>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-semibold d-block">{currentUser?.email}</span>
                            <small className="text-muted">User</small>
                          </div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/Home/NotificationPage">
                      <i className='bx bxs-bell me-2'></i>
                        <span className="align-middle">Notifications</span>
                        {notifications.filter(notification => !notification.read).length > 0 && (
        <span className="badge bg-danger ms-2 rounded-pill">
            {notifications.filter(notification => !notification.read).length}
        </span>
    )}
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/">
                        <i className="bx bx-power-off me-2"></i>
                        <span className="align-middle">Log Out</span>
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>
          <Outlet />
        </div>
      </div>
      <div className={`layout-overlay layout-menu-toggle ${sidebarVisible ? 'visible' : ''}`} onClick={closeSidebar}></div>
    </div>
  );
};

export default Home;




