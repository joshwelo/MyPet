import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './authProvider';  // Import the useAuth hook
import logo from './assets/mypetlogo.png';
import './Home.css';  // Import your CSS file for additional styles

const Home = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState('HomePage');
  const { currentUser } = useAuth();  // Get current user from context

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


  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
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
                <i className="menu-icon tf-icons bx bxs-heart"></i>
                <div data-i18n="Analytics">Health Assessment</div>
              </Link>
            </li>
            <li className={`menu-item ${activeMenu === 'CalendarEventsPage' ? 'active' : ''}`} role="menuitem" aria-controls="calendar" aria-selected={activeMenu === 'CalendarEventsPage'}>
              <Link to="CalendarEventsPage" className="menu-link" onClick={() => handleMenuClick('CalendarEventsPage')}>
                <i className="menu-icon tf-icons bx bxs-calendar"></i>
                <div data-i18n="Analytics">Calendar</div>
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
            <li className={`menu-item ${activeMenu === 'BlogsPage' ? 'active' : ''}`} role="menuitem" aria-controls="blogs" aria-selected={activeMenu === 'BlogsPage'}>
              <Link to="BlogsPage" className="menu-link" onClick={() => handleMenuClick('BlogsPage')}>
                <i className="menu-icon tf-icons bx bx-collection"></i>
                <div data-i18n="Basic">Blogs</div>
              </Link>
            </li>
            <li className={`menu-item ${activeMenu === 'About' ? 'active' : ''}`} role="menuitem" aria-controls="about" aria-selected={activeMenu === 'About'}>
              <Link to="About" className="menu-link" onClick={() => handleMenuClick('About')}>
                <i class="menu-icon tf-icons bx bxs-message-dots"></i>
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
