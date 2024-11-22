import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/styles/ForgotPasswordPage.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faTimes, faInfoCircle} from "@fortawesome/free-solid-svg-icons";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const ForgotPassword = () => {
  const [userId, setUserId] = useState(null); // Moved inside the component
  const [nextPage, setNextPage] = useState(false);
  const [resetTrue, setResetTrue] = useState(false);
  const [email, setEmail] = useState('');

        return (    <main className="forgot-password-container">
      <div className="forgot-password-wrapper">
                    
                    <section className = "forgot-password-section">
                       
                     {( resetTrue ? <ResetPassword/> : nextPage ? <EmailCodeSection setCodeState ={setresetTrue} userEmail={email} /> :  <VerifyEmailSection  setcompState={setnextPage} setuserEmail={setEmail}/> )} 
        </section>
                   
      </div>
    </main>
  );

 }


 const VerifyEmailSection = ({setcompState, setuserEmail}) =>{


  const userRef = useRef();
  const errorRef = useRef();

  const [forgotEmail, setForgotEmail] = useState('');
  const [errMsg, setErrorMsg] = useState('');

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrorMsg(''); // Clear error message when user types
  }, [forgotEmail]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!forgotEmail.includes('@')) {
      setErrorMsg('Invalid email');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset`, { userEmail: forgotEmail });
      setUserEmail(forgotEmail);
      setCompState(true);
    } catch (error) {
      setErrorMsg('Failed to send reset email. Please try again.');
      console.error("Error in handleEmailSubmit:", error.response?.data || error.message);
    }
  };

  return (
    <form className="forgot-password-form" onSubmit={handleEmailSubmit}>
      <h1 className="forgot-password-form-title">Forgot your password? Enter your email to proceed.</h1>

      <label htmlFor="email">
        Email:{' '}
        <p ref={errorRef} className={errMsg ? 'forgot-invalid' : 'forgot-hide'} aria-live="assertive">
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
  const [passcode, setPasscode] = useState('');
  const [errMsg, setErrorMsg] = useState('');

  const handleCodeVerification = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify-reset`, {
            userEmail,
            usercode: String(passcode),
        });

        if (response.data.success) {
            setUserId(response.data.userId); // Store userId
            setCodeState(true);
        } else {
            setErrorMsg('Invalid code');
        }
    } catch (error) {
        console.error("Error during verification:", error.response?.data || error.message);
        setErrorMsg(error.response?.data?.message || 'Verification failed. Please try again.');
    }
};

  const resendCode = async () => {
    console.log("Attempting to resend code to:", userEmail); //debug code

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset`, { userEmail });
      setErrorMsg('A new code has been sent to your email.');
    } catch (error) {
      console.error("Error resending code:", error.response?.data || error.message);
      setErrorMsg('Failed to resend code. Please try again.');
    }
  };

  return (
    <form className="forgot-password-form" onSubmit={handleCodeVerification}>
      <h1 className="forgot-password-form-title">A one-time code has been sent to your email</h1>

      <label htmlFor="resetCode">
        Code:{' '}
        <p ref={errorRef} className={errMsg ? 'forgot-invalid' : 'forgot-hide'} aria-live="assertive">
          {errMsg}
        </p>
      </label>

      <input
        className="forgot-password-input"
        id="resetCode"
        type="text"
        ref={userRef}
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        placeholder="Enter your code"
      />
      <button className="forgot-password-button">Submit</button>
      <p onClick={resendCode} className="resend-link">
        Resend Code
      </p>
    </form>
  );
};

const ResetPassword = ({ userEmail, userId }) => {
  const userRef = useRef();
  const [newPassword, setNewPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(newPassword));
  }, [newPassword]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!userId) {
        console.error('User ID is missing.');
        return;
    }

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password`, { userId, newPassword });
        navigate('/login');
    } catch (error) {
        console.error('Failed to reset password:', error.response?.data || error.message);
    }
};


  return (
    <form className="forgot-password-form" onSubmit={handlePasswordReset}>
      <h1 className="forgot-password-form-title">
        Must be 8-24 characters, include one special character, one digit, one uppercase and one lowercase letter:
      </h1>

      <label htmlFor="newPassword">
        New Password:{' '}
        <FontAwesomeIcon icon={faCheck} className={validPassword ? 'forgot-valid' : 'forgot-hide'} />
        <FontAwesomeIcon icon={faTimes} className={!validPassword ? 'forgot-invalid' : 'forgot-hide'} />
      </label>

      <input
        className="forgot-password-input"
        id="newPassword"
        type="password"
        ref={userRef}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
      />
      <button disabled={!validPassword} className="forgot-password-button">
        Submit
      </button>
    </form>
  );
};

export default ForgotPassword;
