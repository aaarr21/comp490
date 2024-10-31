
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/styles/ForgotPasswordPage.css';

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
        
      
            
          

        return (    <main className="forgot-password-container">
                <div className="forgot-password-wrapper">
                    
                    <section className = "forgot-password-section">
                       
                     {( nextPage ? <EmailCodeSection/> :  <VerifyEmailSection  setcompState={setnextPage}/> )} 
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
            console.log(validEmail);
             if(forgotEmail.includes('@')=== false){ //Check if it's even valid
                 seterrorMsg('Invalid email');
                 return;
             }
             setvalidEmail(true);
             setcompState(true)
           
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


 const EmailCodeSection = () =>{ //page to deal with email section. IE type in one time code for password reset.
                                 //This will probably be act mostly the same as forgotPasswor
          const userRef = useRef();
          const errorRef = useRef();

         const handleCodeVerification = async (e) =>{ // TBD, guessing we use something to create a code and then check here?
            e.preventDefault();  
            let value = '89AE';
              if(passcode != value){
                //Do thing
                seterrorMsg("invalid code");
                return;
              }
             <ResetPassword/>
         }

          const [passcode, setPasscode] = useState('');
          const [errMsg, seterrorMsg] = useState("");

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

                </form>
   
          );
 }

 const ResetPassword = () =>{
    const userRef = useRef();
    const errorRef = useRef();

    const [newPassword, setPassword] = useState(""); // This seems exploitable.
    const [validPassword,setvalidPassword] = useState(false);
    const [errMsg,seterrMsg] = useState('');

    const handlePasswordReset = () =>{
        console.log("LLLLLLLLL");
    }

    return (
        <form className="forgot-password-form" onSubmit={handlePasswordReset}>
        <h1 className="forgot-password-form-title"> Must be 8-24 characters, one special character, one digit,<br/> one upper and lowercase:</h1>

        <label htmlFor='resetCode'> New Password:   <p ref={errorRef} className={errMsg ? "forgot-invalid" : "forgot-hide"} aria-live="assertive">{errMsg}</p> </label>

        <input 
        className="forgot-password-input"
        id="resetcode"
        type= "text"
        ref = {userRef}
        onChange = {(e)=> setPassword(e.target.value) } 
                      
        />
       <button className="forgot-password-button">Submit</button>

  </form>
    );
  }



   export default ForgotPassword;