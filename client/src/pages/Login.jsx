import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/styles/LoginPage.css";
import googleIcon from "../components/images/googlethumbnail.webp";
import facebookIcon from "../components/images/facebook.png";
import githubIcon from "../components/images/github.webp";
import linkedinIcon from "../components/images/linkedin.png";
// 1) Import useRBAC
import { useRBAC } from "../utils/rbacUtils";

const LoginPage = () => {
  const navigate = useNavigate();

  // 2) Get refetch from useRBAC
  const { refetch } = useRBAC();

  const [errMsg, setErrMsg] = useState("");
  const errorRef = useRef();

  // Function to check if the user is already logged in
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/status`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200 && response.data.loggedIn) {
        navigate("/workBoard", { replace: true }); // Redirect if already authenticated
      }
    } catch (error) {
      console.error("Failed to check login status:", error);
    }
  }, [navigate]);

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // State variables for form fields
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Handle form submission
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          identifier, // same as identifier: identifier
          password,
          rememberMe,
        },
        { withCredentials: true }
      );
      console.log("Login successful:", response.data);

      // 3) Force RBAC refetch before navigate
      await refetch();

      navigate("/workBoard", { replace: true });
    } catch (error) {
      setErrMsg(error.response?.data?.error || "Login failed");
      errorRef.current?.focus();
    }
  };

  useEffect(() => {
    setErrMsg("");
  }, [identifier, password]);

  // Google login handler
  const googleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${process.env.REACT_APP_API_URL}/auth/google?prompt=select_account`,
      "Google Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  const githubLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${process.env.REACT_APP_API_URL}/auth/github?prompt=select_account`,
      "Github Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  const facebookLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${process.env.REACT_APP_API_URL}/auth/facebook?prompt=select_account`,
      "Facebook Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  const linkedinLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${process.env.REACT_APP_API_URL}/auth/linkedin?prompt=select_account`,
      "LinkedIn Login",
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
              <button
                className="create-account-btn"
                onClick={() => navigate("/register")}
              >
                Create Account
              </button>
            </div>
          </section>
        </div>
        <div className="right-column">
          <form className="sign-in-form" onSubmit={handleLocalLogin}>
            <h1 className="sign-in-title">Sign In</h1>

            <p className="social-login-text">Login using socials</p>
            <div className="social-login-icons">
              <button
                type="button"
                className="social-icon-button"
                onClick={googleLogin}
              >
                <img src={googleIcon} alt="Google" className="social-icon" />
              </button>
              <button
                type="button"
                className="social-icon-button"
                onClick={facebookLogin}
              >
                <img
                  src={facebookIcon}
                  alt="Facebook"
                  className="social-icon"
                />
              </button>
              <button
                type="button"
                className="social-icon-button"
                onClick={githubLogin}
              >
                <img src={githubIcon} alt="GitHub" className="social-icon" />
              </button>
              <button
                type="button"
                className="social-icon-button"
                onClick={linkedinLogin}
              >
                <img
                  src={linkedinIcon}
                  alt="LinkedIn"
                  className="social-icon"
                />
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
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <label htmlFor="password" className="input-label">
              Password:{" "}
              <p
                ref={errorRef}
                className={errMsg ? "errmsg" : "erase"}
                aria-live="assertive"
              >
                {errMsg}
              </p>
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
