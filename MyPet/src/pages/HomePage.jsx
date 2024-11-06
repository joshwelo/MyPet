import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './Homepage.css';

const Home = () => {
  return (
    <div className="container home-container">
      <header className="text-center mt-3">
        <h1>Welcome to My Pet Management System</h1>
        <p>Manage all aspects of your pet’s health and activities in one place.</p>
      </header>

      <Carousel
        showArrows={true}
        infiniteLoop={true}
        showThumbs={false}
        showStatus={false}
        autoPlay={true}
        interval={5000}
        className="mt-4"
      >
        <div className="section p-4">
          <h2 className="h4">Pet Profile</h2>
          <p>Keep track of your pet’s details, health history, and much more.</p>
          <Link to="/ProfilePage" className="btn btn-primary mt-2">Go to Pet Profile</Link>
        </div>

        <div className="section p-4">
          <h2 className="h4">Pet Diagnosis</h2>
          <p>Diagnose common issues and monitor your pet's health.</p>
          <Link to="/DiagnosePage" className="btn btn-primary mt-2">Go to Pet Diagnosis</Link>
        </div>

        <div className="section p-4">
          <h2 className="h4">Pet Calendar</h2>
          <p>Schedule feeding, grooming, and other important events for your pet.</p>
          <Link to="/CalendarEventsPage" className="btn btn-primary mt-2">Go to Pet Calendar</Link>
        </div>

        <div className="section p-4">
          <h2 className="h4">PetPlace Maps</h2>
          <p>Find pet-friendly locations and veterinary services nearby.</p>
          <Link to="/EstablishmentsPage" className="btn btn-primary mt-2">Go to PetPlace Maps</Link>
        </div>

        <div className="section p-4">
          <h2 className="h4">Blogs</h2>
          <p>Read articles about pet care, training, health, and much more.</p>
          <Link to="/blogs" className="btn btn-primary mt-2">Go to Blogs</Link>
        </div>
      </Carousel>
    </div>
  );
};

export default Home;
