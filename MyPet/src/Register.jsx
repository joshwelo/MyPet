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

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const { email, password } = formData;
    const response = await registerUser(email, password);
    setMessage(response.message);
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
                        <a href='/policy'> privacy policy & terms</a>
                      </label>
                    </div>
                  </div>
                  <button className="btn btn-primary d-grid w-100" type="submit">Sign up</button>
                </form>

                {message && <p className="text-center">{message}</p>}

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
    </>
  );
}

export default Register;
