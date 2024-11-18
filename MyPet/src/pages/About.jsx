import React from 'react';
import joshwel from '../assets/joshwel.jpg'
import kaylo from '../assets/kaylo.jpg'
import charles from '../assets/charles.jpg'
import reece from '../assets/reece.jpg'


const AboutPage = () => {
  return (
    <div className="container my-5">
      <section className="mb-5">
        <h2 className="text-center mb-4">About the Team</h2>
        <div className="row mb-4">
          <div className="col-md-12 text-center">
            <img src={joshwel} alt="Joshwel Morcilla" className="rounded-circle mb-2" width="120" height="120" />
            <h3>Lead Developer: Joshwel Morcilla</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 text-center">
            <img src={kaylo} alt="Kaylo Vergara" className="rounded-circle mb-2" width="100" height="100" />
            <h5>Kaylo Vergara</h5>
          </div>
          <div className="col-md-4 text-center">
            <img src={charles} alt="Charles Marquez" className="rounded-circle mb-2" width="100" height="100" />
            <h5>Charles Marquez</h5>
          </div>
          <div className="col-md-4 text-center">
            <img src={reece} alt="Reece Sales" className="rounded-circle mb-2" width="100" height="100" />
            <h5>Reece Sales</h5>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="text-center mb-4">Contact for Support</h2>
        <div className="text-center">
          <p>Phone: <a href="tel:+63 915 681 4012">+63 915 681 4012</a></p>
          <p>Email: <a href="mailto:mypet@gmail.com">mypet@gmail.com</a></p>
        </div>
      </section>

      <section>
        <div className="card mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4 mt-3">Partner Veterinary Clinic</h2>
          <div className="card-body">
            <p><strong>Name:</strong>Mark Mendoza</p>
            <p><strong>Email:</strong> <a href="mailto:abysclinic@gmail.com">abysclinic@gmail.com</a></p>
            <p><strong>Contact:</strong> <a href="tel:09364227892">09364227892</a></p>
            <p><strong>Address:</strong>W5W8+RCQ, Lipa, Batangas</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
