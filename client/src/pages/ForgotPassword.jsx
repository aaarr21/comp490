
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/styles/ForgotPasswordPage.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faTimes, faInfoCircle} from "@fortawesome/free-solid-svg-icons";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
/* 
  Note:
  Frontend: 75% done.

   TBD:
    figure out logic on going to the reset password component.
    Do the actually backend part, IE routing to find the email, handle if email is really invalid.
    Send an email, with a code, store it to compare to user input
    Then actually modify password.

    
*/
      
 const ForgotPassword  = () =>{

         
      
          const [nextPage, setnextPage] = useState(false);
          const [resetTrue, setresetTrue] = useState(false);
        
      
            
          

        return (    <main className="forgot-password-container">
                <div className="forgot-password-wrapper">
                    
                    <section className = "forgot-password-section">
                       
                     {( resetTrue ? <ResetPassword/> : nextPage ? <EmailCodeSection setCodeState ={setresetTrue}/> :  <VerifyEmailSection  setcompState={setnextPage}/> )} 
                    </section>
                   
                </div>
            </main>
            );

 }


 const VerifyEmailSection = ({setcompState}) =>{


    const userRef = useRef();
    const errorRef = useRef();



     useEffect(()=> {userRef.current.focus();},[]);

    

        const [forgotEmail,setforgotEmail] = useState(''); //State of email input
       
        const [validEmail,setvalidEmail] = useState(false); // Valid email or not
        const [errMsg, seterrorMsg] = useState("");
        
        useEffect(()=> {
            seterrorMsg(''); //Erase error message when user types.
        },[forgotEmail])


        const handleEmailSubmit = async (e) => {
            e.preventDefault();
            
             if(forgotEmail.includes('@')=== false){ //Check if it's even valid
                 seterrorMsg('Invalid email');
                 return;
             }
             setvalidEmail(true);
             setcompState(true);
           
        };

    return (<form className= "forgot-password-form" onSubmit={handleEmailSubmit}>
    <h1 className= "forgot-password-form-title"> Forgot your password? Enter your email to proceed.</h1>

    <label htmlFor='email'> Email:   <p ref={errorRef} className={errMsg ? "forgot-invalid" : "forgot-hide"} aria-live="assertive">{errMsg}</p> </label>
  
    <input id='email' 
    className="forgot-password-input"
    type="text" 
    required
    ref={userRef}
    value={forgotEmail}
    onChange={(e) => setforgotEmail(e.target.value)}
    placeholder="Email" />   
    <button className="forgot-password-button">Submit</button>
</form>
    )
 };


 const EmailCodeSection = ({setCodeState}) =>{ //page to deal with email section. IE type in one time code for password reset.
                                               // Pass in the setCodeState as a prop, if user entered the correct code, set to true to render the next component.
          const userRef = useRef();
          const errorRef = useRef();
          
          
          /* 
            Note: 
                This creates a string that has 5 digits, the A is set in stone for the time being, until I can randomize that.
          */
         
         const handleCodeVerification = async (e) =>{ //
            e.preventDefault();  
              //console.log(usercode); For testing only
              if(passcode !== usercode){
                //Do thing
                seterrorMsg("invalid code");
                return;
              }
              setCodeState(true);
         }
          const [usercode, setUserCode] = useState('');
          const [passcode, setPasscode] = useState('');
          const [errMsg, seterrorMsg] = useState("");
          
          /*  
               For the resend link, should update the usercode with a new code. Then send another email.
               Current issue: Clicking this bricks handleCodeVerification. I presume that usercode isn't updated with the new value in that function.
               This is kinda hacky and I should look at code creation in the backend, as the code may change if user refreshes the page.
          */
          const ResendCode = () =>{  
                      
          }

          useEffect(()=>{
             /*
                  Fetch call to route /auth/passcode
                  I feel this should be an async, await but I'm not sure.
                  It works, that route generates a code, pass it to the request.json, then we setUserCode from here
               */

             fetch(`${process.env.REACT_APP_API_URL}/auth/passcode`, {
              credentials: 'include',
          }).then(res => res.json())
            .then(data => setUserCode(data.code))  
              // update state with new generated code.
               
            },[]);

          useEffect(()=> {
             seterrorMsg('');
      },[passcode]);

          return (
                <form className="forgot-password-form" onSubmit={handleCodeVerification}>
                      <h1 className="forgot-password-form-title"> A one time code has been sent to the provided email</h1>

                      <label htmlFor='resetCode'> Code:   <p ref={errorRef} className={errMsg ? "forgot-invalid" : "forgot-hide"} aria-live="assertive">{errMsg}</p> </label>
            
                      <input 
                      className="forgot-password-input"
                      id="resetcode"
                      type= "text"
                      ref = {userRef}
                      onChange = {(e)=> setPasscode(e.target.value) } 
                                    
                      />
                     <button className="forgot-password-button">Submit</button>
                     <p onClick={ResendCode} className="resend-link">Resend Code</p>

                </form>
   
          );
 }

 const ResetPassword = () =>{
    const userRef = useRef();
    const errorRef = useRef();

    const [newPassword, setPassword] = useState(""); // This seems exploitable.
    const [validPassword,setvalidPassword] = useState(false); // Determine a valid password
    const [errMsg,seterrMsg] = useState(''); //Error message
    const [success,setSuccess] = useState(false); //state to determine successful password reset.
    const navigate = useNavigate();


    useEffect(()=> {
         setvalidPassword(PWD_REGEX.test(newPassword));
        
    },[newPassword]);

    const handlePasswordReset = async (e) =>{
        e.preventDefault();
        setSuccess(true);
        navigate('/login');
        console.log("pressed");
    }

    return ( 
        <form className="forgot-password-form" onSubmit={handlePasswordReset}>
            
        <h1 className="forgot-password-form-title"> Must be 8-24 characters, one special character, one digit,<br/> one upper and lowercase:</h1>

        <label htmlFor='resetCode'> New Password:  
        <FontAwesomeIcon icon={faCheck} className = {validPassword ? "forgot-valid" : "forgot-hide"}/>
        <FontAwesomeIcon icon = {faTimes} className = { !validPassword ? "forgot-invalid" : "forgot-hide"}/>     
        </label>

        <input 
        className="forgot-password-input"
        id="resetcode"
        type= "password"
        ref = {userRef}
        onChange = {(e)=> setPassword(e.target.value) } 
                      
        />
       <button disabled={!validPassword ? true : false} className="forgot-password-button">Submit</button>

  </form> 
    );
  }



   export default ForgotPassword;