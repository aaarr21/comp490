import { useEffect, useState, useRef } from 'react';
import google from '../components/images/googlethumbnail.webp';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    // Define the function to handle the Google login
    const googleLogin = () => {
        window.open("http://localhost:5000/auth/google", "_self");
    };

    const userRef = useRef();




    const [usernameLog,setuserNameLog] = useState('');

    const [passwordLog, setpasswordLog] = useState('');

     useEffect(()=> {
        userRef.current.focus();
     },[])


    const handleLocalLogin = async (e) => {
        e.preventDefault();
        console.log(usernameLog); 
          try {
            const response = await axios.post('/login', {username:usernameLog, password: passwordLog});
            console.log(response);
          } catch (error) {
            
          }
    }
     


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
                      onChange={ (e) => setuserNameLog(e.target.value)}
                      ref = {userRef}
                    placeholder="Username" required />
                    <input type="password" className="inputField"
                      onChange={ (e) => setpasswordLog(e.target.value)}
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
