import React, { useState } from 'react';
import { registerUser } from './authProvider';
import logo from './sneatbootstrap/MyPetLogoFull.png';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.terms) {
      setMessage("You must agree to the privacy policy and terms before registering.");
      setShowModal(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setShowModal(true);
      return;
    }

    const { email, password } = formData;
    const response = await registerUser(email, password);

    if (response.success) {
      // Handle successful registration
    } else {
      setMessage(response.message);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closePolicyModal = () => {
    setShowPolicyModal(false);
  };

  return (
    <>
      <div className="container-xxl">
        <div className="authentication-wrapper authentication-basic container-p-y">
          <div className="authentication-inner">
            <div className="card">
              <div className="card-body">
                <div className="app-brand justify-content-center">
                  <a href="index.html" className="app-brand-link gap-2">
                    <img src={logo} height="200px" width="200px" alt="MyPet Logo" />
                  </a>
                </div>
                <h4 className="mb-2">Adventure starts here 🚀</h4>
                <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" autoComplete="off" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3 form-password-toggle">
                    <label className="form-label" htmlFor="password" autoComplete="off">Password</label>
                    <div className="input-group input-group-merge">
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        name="password"
                        placeholder="Enter your password"
                        autoComplete="off"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3 form-password-toggle">
                    <label className="form-label" htmlFor="confirmPassword" autoComplete="off">Re-enter Password</label>
                    <div className="input-group input-group-merge">
                      <input
                        type="password"
                        id="confirmPassword"
                        className="form-control"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        autoComplete="off"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="terms-conditions"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="terms-conditions">
                        I agree to
                        <button type="button" className="btn btn-link p-0" onClick={() => setShowPolicyModal(true)}>
                          privacy policy & terms
                        </button>
                      </label>
                    </div>
                  </div>
                  <button className="btn btn-primary d-grid w-100" type="submit">Sign up</button>
                </form>

                <p className="text-center">
                  <span>Already have an account?</span>
                  <a href='/'>
                    <span> Sign in instead</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Notification</h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show"></div>}

      {/* Privacy Policy Modal */}
      <div className={`modal fade ${showPolicyModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ display: showPolicyModal ? 'block' : 'none' }}>
  <div className="modal-dialog" role="document">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Privacy Policy & Terms</h5>
        <button type="button" className="btn-close" onClick={closePolicyModal}></button>
      </div>
      <div className="modal-body">
        <p>
          <strong>Privacy Policy for My Pet: Cross-Platform Pet Management and Assistance Application</strong>
        </p>
        <p><strong>1. Introduction</strong><br />
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web-based app, <em>My Pet: Cross-Platform Pet Management and Assistance Application</em>. By accessing or using our services, you agree to the terms outlined in this policy.
        </p>
        <p><strong>2. Information We Collect</strong><br />
          - <strong>Personal Information</strong>: We may collect personal information such as your name, email address, contact information, and pet details (e.g., pet names, breeds, ages).<br />
          - <strong>Usage Data</strong>: We collect information on how you interact with our app, including access times, browser type, and device information.<br />
        </p>
        <p><strong>3. How We Use Your Information</strong><br />
          - To provide and maintain the functionality of the app.<br />
          - To improve our app based on user feedback and interaction.<br />
          - To communicate with you regarding updates, promotions, and support.<br />
          - To ensure the security of the app and user data.
        </p>
        <p><strong>4. Data Sharing and Disclosure</strong><br />
          - <strong>Third-Party Services</strong>: We may share information with third-party services for analytics and performance monitoring.<br />
          - <strong>Legal Requirements</strong>: We may disclose your information to comply with legal obligations or to protect the rights and safety of our users and the public.
        </p>
        <p><strong>5. Data Security</strong><br />
          We implement robust security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet is 100% secure.
        </p>
        <p><strong>6. Your Rights and Choices</strong><br />
          - <strong>Access and Correction</strong>: You can access and update your personal information through your account settings.<br />
          - <strong>Data Deletion</strong>: You can request the deletion of your personal data at any time by contacting our support team.<br />
          - <strong>Opt-Out</strong>: You may opt out of non-essential data collection, such as analytics and promotional communications.
        </p>
        <p><strong>7. Changes to This Policy</strong><br />
          We may update this Privacy Policy from time to time. Any changes will be reflected in this policy, and you will be notified through the app or via email if significant changes are made.
        </p>
        <p><strong>8. Contact Us</strong><br />
          If you have any questions or concerns regarding this privacy policy, please contact us at mypet@gmail.com.
        </p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={closePolicyModal}>Close</button>
      </div>
    </div>
  </div>
</div>

      {showPolicyModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
}

export default Register;
