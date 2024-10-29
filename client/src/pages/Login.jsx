

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/styles/LoginPage.css';
import googleIcon from '../components/images/googlethumbnail.webp'; // Adjust the path accordingly
import facebookIcon from '../components/images/facebook.png'; // Add the correct path
import twitterIcon from '../components/images/twitter.png';   // Add the correct path
import linkedinIcon from '../components/images/linkedin.png'; // Add the correct path


const LoginPage = () => {
    const navigate = useNavigate(); // Define navigate here

    // Simulate checking if user is logged in, e.g., via a token or session check
    const checkLoginStatus = useCallback(async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/status`, {
            credentials: 'include',
        });
        const data = await response.json();
        if (data.loggedIn) {
            navigate('/workBoard');
        }
    }, [navigate]);
  

  // State variables
  const [identifier, setIdentifier] = useState(''); // Store username or email
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Check if the user is already logged in
 

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // Handle form submission
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          identifier: identifier,  // Use 'identifier' to handle both email and username
          password: password,
          rememberMe: rememberMe,
        },
        { withCredentials: true }
      );
      console.log('Login successful:', response.data);
      navigate('/workBoard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Google login handler
  const googleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${process.env.REACT_APP_API_URL}/auth/google`,
      'Google Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <main className="sign-in-container">
      <div className="sign-in-wrapper">
        <div className="left-column">
          <section className="welcome-section">
            <div className="welcome-content">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/22632ec5cbf37201259d108df08d01db9d2ab3c3995715785844b13879de98f2?placeholderIfAbsent=true&apiKey=c4c7ee526ddf4189b90887ee1b75d310"
                className="welcome-logo"
                alt="Welcome logo"
                width="200"
                height="200"
              />
              <h2 className="welcome-title">Welcome!</h2>
              <p>Don't have an account?</p>
              <button className="create-account-btn" onClick={() => navigate('/register')}>
                Create Account
              </button>
            </div>
          </section>
        </div>
        <div className="right-column">
          <form className="sign-in-form" onSubmit={handleLocalLogin}>
            <h1 className="sign-in-title">Sign In</h1>

            {/* Add "Login using socials" and social login button */}
            <p className="social-login-text">Login using socials</p>
            <div className="social-login-icons">
              <button type="button" className="social-icon-button" onClick={googleLogin}>
                <img src={googleIcon} alt="Google" className="social-icon" />
              </button>
              <button type="button" className="social-icon-button" onClick={googleLogin}>
                <img src={facebookIcon} alt="Facebook" className="social-icon" />
              </button>
              <button type="button" className="social-icon-button" onClick={googleLogin}>
                <img src={twitterIcon} alt="Twitter" className="social-icon" />
              </button>
              <button type="button" className="social-icon-button" onClick={googleLogin}>
                <img src={linkedinIcon} alt="LinkedIn" className="social-icon" />
              </button>
            </div>

            <p className="or-text">or</p>

            <label htmlFor="identifier" className="input-label">
              Username or Email
            </label>
            <input
              type="text"
              id="identifier"
              className="input-field"
              required
              aria-required="true"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)} // Store either username or email
            />
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input-field"
              required
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="form-footer">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  className="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember Me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>
            <button type="submit" className="create-account-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
