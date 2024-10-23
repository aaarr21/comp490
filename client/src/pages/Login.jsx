import { useEffect, useState, useRef, useCallback } from 'react';
import google from '../components/images/googlethumbnail.webp';
import csunlogo from '../components/images/CSUNlogo.png'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate(); // Define navigate here

    // Simulate checking if user is logged in, e.g., via a token or session check
    const checkLoginStatus = useCallback(async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/uth/status`, {
            credentials: 'include',
        });
        const data = await response.json();
        if (data.loggedIn) {
            navigate('/workBoard');
        }
    }, [navigate]);

    useEffect(() => {
        // Check login status on component mount
        checkLoginStatus();
    }, [checkLoginStatus]);

    // Define the function to handle the Google login
    const googleLogin = () => {
        const width = 500;
        const height = 600;
        
        // Calculate the position to center the window on the screen
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
    
        window.open(
            `${process.env.REACT_APP_API_URL}/api/google`, 
            'Google Login', 
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    const userRef = useRef();
    const [usernameLog, setUsernameLog] = useState('');
    const [passwordLog, setPasswordLog] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, []); 

    const handleLocalLogin = async (e) => {
        e.preventDefault();
        console.log(usernameLog);
        try {
            const response = await axios.post('/login', { username: usernameLog, password: passwordLog });
            console.log(response);
            // Navigate to workBoard after successful login
            navigate('/workBoard');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className='main'>
        <div className="container">
            <section className = "leftSide">
                 <img src={csunlogo} alt ="csunLogo" className ="csunLogo"/>
                 <p className="welcome"> Welcome! <br></br> Don't have an Account?</p>
                 <Link to="/register" className="switchToRegister">
                   Create Account
                 </Link>
  
            </section>
            <section className = "rightSide">
                     <form className ="loginForm">
                     <h1 className= "formTitle">Login!</h1>
                        <div className ="inputs">
                         
                         <div className = "inputBox">
                          <label htmlFor='username' className= "labels">Username </label>

                          <input 
                        type="text" 
                        className="inputField"
                        onChange={(e) => setUsernameLog(e.target.value)}
                        ref={userRef}
                        id="username"
                        placeholder="Username" 
                        required 
                    />
                    </div>
                    <div className ="inputBox">
                    <label htmlFor='password' className = "labels">Password</label>
                    <input 
                        id='password'
                        type="password" 
                        className="inputField"
                        onChange={(e) => setPasswordLog(e.target.value)}
                        placeholder="Password" 
                        required 
                    />
                    </div>
                    </div>
                     </form>

                     <div className ="auxillary">
                      <div className ="rememberCheck">
                     <input type="checkbox" id="check"/> 
                     <label htmlFor="check">Remember me</label>
                     </div>
                     <div className="forgotLink">
                     <Link to="/forgot" > Forgot password? </Link>
                     </div>
                     </div>

                     <div className = "logins">
                         
                          <button onSubmit={handleLocalLogin} className="loginButton"> Log In</button>
                          <p className="or"> OR </p>
                          <button className="loginButton google" onClick={googleLogin}>
                        <img src={google} alt="Google" className="icon" />
                        Sign in 
                         </button>
                     </div>

            </section>
        </div>

        </div>
    );
};

export default LoginPage;
