import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/styles/ForgotPasswordPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const ForgotPassword = () => {
  const [userId, setUserId] = useState(null);
  const [nextPage, setNextPage] = useState(false);
  const [resetTrue, setResetTrue] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <main className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <section className="forgot-password-section">
          {resetTrue ? (
            <ResetPassword userEmail={email} userId={userId} />
          ) : nextPage ? (
            <EmailCodeSection
              setCodeState={setResetTrue}
              userEmail={email}
              setUserId={setUserId}
            />
          ) : (
            <VerifyEmailSection
              setCompState={setNextPage}
              setUserEmail={setEmail}
            />
          )}
        </section>
      </div>
    </main>
  );
};

const VerifyEmailSection = ({ setCompState, setUserEmail }) => {
  const userRef = useRef();
  const errorRef = useRef();

  const [forgotEmail, setForgotEmail] = useState("");
  const [errMsg, setErrorMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrorMsg("");
  }, [forgotEmail]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!forgotEmail.includes("@")) {
      setErrorMsg("Invalid email");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset`, {
        userEmail: forgotEmail,
      });
      setUserEmail(forgotEmail);
      setCompState(true);
    } catch (error) {
      setErrorMsg("Failed to send reset email. Please try again.");
      console.error(
        "Error in handleEmailSubmit:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <form className="forgot-password-form" onSubmit={handleEmailSubmit}>
      <h1 className="forgot-password-form-title">
        Forgot your password? Enter your email to proceed.
      </h1>

      <label htmlFor="email">
        Email:{" "}
        <p
          ref={errorRef}
          className={errMsg ? "forgot-invalid" : "forgot-hide"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
      </label>

      <input
        id="email"
        className="forgot-password-input"
        type="text"
        required
        ref={userRef}
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        placeholder="Email"
      />
      <button className="forgot-password-button">Submit</button>
    </form>
  );
};

const EmailCodeSection = ({ setCodeState, userEmail, setUserId }) => {
  const userRef = useRef();
  const errorRef = useRef();
  const [passcode, setPasscode] = useState("");
  const [errMsg, setErrorMsg] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Basic validation
    if (!passcode || passcode.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/verify-reset`,
        {
          userEmail,
          usercode: String(passcode),
        }
      );

      if (response.data.success) {
        setUserId(response.data.userId);
        setCodeState(true);
      } else {
        setErrorMsg("Invalid code");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Verification failed. Please try again.";
      setErrorMsg(errorMessage);
      console.error("Verification error:", error);
    }
  };

  const resendCode = async () => {
    if (isResending || resendTimer > 0) return;

    setIsResending(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset`, {
        userEmail,
      });
      setErrorMsg("A new code has been sent to your email.");
      setResendTimer(60); // Start 60-second cooldown
    } catch (error) {
      setErrorMsg("Failed to resend code. Please try again later.");
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form className="forgot-password-form" onSubmit={handleCodeVerification}>
      <h1 className="forgot-password-form-title">
        A one-time code has been sent to your email
      </h1>

      {errMsg && (
        <div className="forgot-invalid" role="alert">
          {errMsg}
        </div>
      )}

      <label htmlFor="resetCode">Code:</label>

      <input
        className="forgot-password-input"
        id="resetCode"
        type="text"
        ref={userRef}
        value={passcode}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, "");
          if (value.length <= 6) setPasscode(value);
        }}
        maxLength={6}
        placeholder="Enter 6-digit code"
        pattern="[0-9]*"
        inputMode="numeric"
      />

      <button type="submit" className="forgot-password-button">
        Verify Code
      </button>

      <button
        type="button"
        onClick={resendCode}
        className={`resend-link ${
          isResending || resendTimer > 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isResending || resendTimer > 0}
      >
        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
      </button>
    </form>
  );
};

const ResetPassword = ({ userEmail, userId }) => {
  const userRef = useRef();
  const [newPassword, setNewPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(newPassword));
  }, [newPassword]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Invalid session. Please try the reset process again.");
      return;
    }

    if (!validPassword) {
      setError("Please enter a valid password matching all requirements.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/reset-password`,
        {
          userId,
          newPassword,
        }
      );

      if (response.data.success) {
        // First, ensure user is logged out
        try {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/logout`,
            {},
            {
              withCredentials: true,
            }
          );
        } catch (error) {
          console.error("Logout error:", error);
          // Continue with navigation even if logout fails
        }

        // Navigate to login with success message
        navigate("/login", {
          state: {
            message:
              "Password reset successful. Please login with your new password.",
          },
        });
      }
    } catch (error) {
      console.error("Password reset error:", error.response?.data || error);
      if (error.response?.data?.message?.includes("social login")) {
        setError("Password reset is not available for social login accounts.");
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to reset password. Please try again."
        );
      }
    }
  };

  return (
    <form className="forgot-password-form" onSubmit={handlePasswordReset}>
      <h1 className="forgot-password-form-title">
        Must be 8-24 characters, include one special character, one digit, one
        uppercase and one lowercase letter:
      </h1>

      {error && (
        <div className="forgot-invalid" role="alert">
          {error}
        </div>
      )}

      <label htmlFor="newPassword">
        New Password:{" "}
        <FontAwesomeIcon
          icon={faCheck}
          className={validPassword ? "forgot-valid" : "forgot-hide"}
        />
        <FontAwesomeIcon
          icon={faTimes}
          className={!validPassword ? "forgot-invalid" : "forgot-hide"}
        />
      </label>

      <input
        className="forgot-password-input"
        id="newPassword"
        type="password"
        ref={userRef}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        autoComplete="new-password"
      />

      <button
        disabled={!validPassword}
        className={`forgot-password-button ${
          !validPassword ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Reset Password
      </button>
    </form>
  );
};

export default ForgotPassword;
