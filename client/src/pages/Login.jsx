import { useEffect, useState, useRef } from 'react';
import google from '../components/images/googlethumbnail.webp';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {

 // Simulate checking if user is logged in, e.g., via a token or session check
 const checkLoginStatus = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/status`, {
        credentials: 'include',
    });
    const data = await response.json();
    if (data.loggedIn) {
        navigate('/workBoard');
    }
};

useEffect(() => {
    // Check login status on component mount
    checkLoginStatus();
}, []);


    // Define the function to handle the Google login
    const googleLogin = () => {
        const width = 500;
        const height = 600;
        
        // Calculate the position to center the window on the screen
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
    
        window.open(
            `${process.env.REACT_APP_API_URL}/auth/google`, 
            'Google Login', 
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };
    

    const userRef = useRef();
    const [usernameLog, setUsernameLog] = useState('');
    const [passwordLog, setPasswordLog] = useState('');
    const navigate = useNavigate(); // <-- Define navigate here

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
        <div className="loginBox">
            <h1 className="loginTitle">Choose your Login Type</h1>
            <div className="wrapAround">
                <div className="leftSide">
                    <button className="loginButton google" onClick={googleLogin}>
                        <img src={google} alt="Google" className="icon" />
                        Sign in with Google
                    </button>
                </div>
                <div className="center">
                    <div className="line" />
                    <div className="or">OR</div>
                </div>
                <div className="rightSide">
                    <input type="text" className="inputField"
                        onChange={(e) => setUsernameLog(e.target.value)}
                        ref={userRef}
                        placeholder="Username" required />
                    <input type="password" className="inputField"
                        onChange={(e) => setPasswordLog(e.target.value)}
                        placeholder="Password" required />
                    <div className="forgot">
                        <section>
                            <input type="checkbox" id="check" />
                            <label htmlFor="check">Remember me</label>
                        </section>
                        <section>
                            <a href="#">Forgot Password</a>
                        </section>
                    </div>
                    <button className="submitButton" onClick={handleLocalLogin}>Login</button>

                    <Link to="/register">
                        <button className="registerButton"> Sign up!</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
