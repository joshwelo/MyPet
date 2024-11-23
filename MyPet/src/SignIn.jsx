import React, { useState } from 'react';
import logo from './sneatbootstrap/MyPetLogoFull.png';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from './firebaseConfig';  // Ensure this path matches your file structure
import { Modal, Form, Button, Alert } from 'react-bootstrap';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [alert, setAlert] = useState(null);  // State for the alert message

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const errorMessages = {
    'auth/invalid-email': 'The email address is invalid. Please check and try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please register.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already in use. Try logging in.',
    'auth/weak-password': 'The password is too weak. Please use a stronger password.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    default: 'An unexpected error occurred. Please try again later.',
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Signed in successfully, redirect to home page
      window.location.href = '/Home';
    } catch (error) {
      const customMessage = errorMessages[error.code] || errorMessages.default;
      setAlert({
        message: customMessage,
        type: 'danger', // 'danger' for errors
      });
    }
  };
  

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setAlert({
        message: 'Password reset email sent successfully.',
        type: 'success', // 'success' for successful message
      });
      setForgotEmail('');
    } catch (error) {
      const customMessage = errorMessages[error.code] || errorMessages.default;
      setAlert({
        message: customMessage,
        type: 'danger', // 'danger' for errors
      });
    }
  };
  

  return (
    <div className="container-xxl">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner">
          <div className="card">
            <div className="card-body">
              <div className="app-brand justify-content-center">
                <a href="/" className="app-brand-link gap-2">
                  <img src={logo} height="200px" width="200px" alt="Logo" />
                </a>
              </div>

              {alert && (
                <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
                  {alert.message}
                </Alert>
              )}

              <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email or Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="email"
                    name="email-username"
                    placeholder="Enter your email or username"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3 form-password-toggle">
                  <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="password">Password</label>
                    <a href="#!" onClick={() => setShowModal(true)}>
                      <small>Forgot Password?</small>
                    </a>
                  </div>
                  <div className="input-group input-group-merge">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="Enter your password"
                      aria-describedby="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="input-group-text cursor-pointer" onClick={togglePasswordVisibility}>
                      <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}></i>
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <button type="submit" className="btn btn-primary d-grid w-100">Sign in</button>
                </div>
              </form>
              <p className="text-center">
                <span>New on our platform?</span>
                <a href='/Register'>
                  <span> Create an account</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter your email to receive a password reset link.</p>
          <Form.Control
            type="email"
            placeholder="Your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="mb-3"
          />
          {resetMessage && <p className="text-success">{resetMessage}</p>}
        </Modal.Body>
        <Modal.Footer>
          <button className="secondary" onClick={() => setShowModal(false)}>
            Close
          </button>
          <button className="primary" onClick={handleForgotPassword}>
            Send Reset Email
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SignIn;
