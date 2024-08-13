import React from 'react';

const MapFrame = () => {
  return (
    <div className="iframe-container">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d51542.98251728334!2d121.170173046042!3d13.94944997739796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1spet%20related%20establishment%20in%20lipa%20city%20batangas!5e0!3m2!1sen!2sph!4v1716833816069!5m2!1sen!2sph" 
        width="600" 
        height="450" 
        style={{border:0}} 
        allowFullScreen="" 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
  );
};

export default MapFrame;
