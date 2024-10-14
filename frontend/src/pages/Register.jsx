import { useState, useRef, useEffect } from "react";
import axios from 'axios';

import { Navigate, useNavigate } from "react-router-dom";


const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/; // Password must be between 8-24 chracters, 
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/; // start with a upper or lower case letter, 3,23 characters

const Register = () =>{ //Component
       const [username, setUsername] = useState(''); // username state

       const [validName, setValidName] = useState(false);

       const [userFocus, setUserFocus] = useState(false);

       const [password, setPassword] = useState('');

       const [passwordMatch,setpasswordMatch] = useState('');

       const [passFocus,setPassFocus] = useState(false);

       const [validMatch,setValidMatch] = useState(false); // Valid matching password

       const [validPass, setValidPass] = useState(false); //valid password  state

       const [matchFocus, setmatchFocus] = useState(false);

       const [errMsg, setErrmsg] = useState('');

       const [success,setSuccess] = useState(false); // State if user succesfully registers 

       const userRef = useRef();

       const errorRef= useRef(); 
       
       const navigate = useNavigate();

      
         useEffect(()=> {
            userRef.current.focus();
         },[])

        useEffect(() => {

          const testResult = USER_REGEX.test(username);
         
          setValidName(testResult);


        },[username])

        useEffect(() => {
           const testpwdresult = PWD_REGEX.test(password);
           setValidPass(testpwdresult);
           const pwdMatch = password === passwordMatch;
           setValidMatch(pwdMatch);
           
        },[password,passwordMatch])

        useEffect(() =>{
           setErrmsg('');
        },[username,password,passwordMatch])





       const handleRegistration = async (e) =>{
          e.preventDefault();
           const subtestuser = USER_REGEX.test(username);
           const subtestPass = PWD_REGEX.test(password);

           if(!subtestuser || !subtestPass){
              setErrmsg("Invalid entry");
              return;
           }
             try{
             const response = await axios.post('/register', { username,  password  });
            console.log(response);
            setSuccess(true);
            setTimeout(()=>{
               navigate('/');
            },2000
             )
             } catch(err){
                if(!err?.reponse){
                  setErrmsg('No Server reponse');
                }
             }
             errorRef.current.focus();
       };


  return( <div className="h-screen w-full bg-neutral-900 text neutral-50">

   
  <div className ="registerBox">
     <>
  <div classname="wrapAround">  
  
     
      {success ? (<section className = "bg-red-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
           <h1 className = "sectiontext"> SUCCESS!</h1>
           
      </section>
      ) : (

<form className="bg-red-800 shadow-md rounded px-8 pt-6 pb-8 mb-4 " onSubmit={handleRegistration} >
      <p ref = {errorRef} className = {errMsg ? "errmsg" : "erase"} aria-live="assertive"> {errMsg}</p>
      <h1 className ="mb-4 text-4xl font-extrabold  "> Register Here!</h1>
      <div className="mb-4">
        <label htmlFor="username" className="block text-white-700 text-sm font-bold mb-2">
          Username
        </label>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  
           type="text"
           onChange = {(e)=> setUsername(e.target.value)}
           id="username"
           ref={userRef}
           autoComplete="off"
           aria-invalid= {validName ? "false" : "true"} //For accessibility, screenreader
           aria-describedby="userNote"
           onFocus={() => setUserFocus(true)}
           onBlur={() => setUserFocus(false)}

        placeholder="Username"/>

          <p id="userNote" className ={userFocus && username && !validName ? "userInstruct" : "erase"}>
                Username must begin with a letter and within 4-24 characters. <br /> 
                any character inbetween is allowed.
          </p>

      </div>
      <div class="mb-6">
        <label htmlFor="password" class="block text-white-700 text-sm font-bold mb-2" >
          Password
        </label>
        <input className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
           onChange = {(e)=> setPassword(e.target.value)} 
           id="password"
           aria-invalid= {validPass ? "false" : "true"} //For accessibility, screenreader
           aria-describedby={validPass ? "false" : "true"}
           onFocus={() => setPassFocus(true)}
           onBlur={() => setPassFocus(false)}
           type="password" 
           placeholder="Password" />

              <p id="passNote" className ={passFocus  && !validPass ? "userInstruct" : "erase"}>
                   Password must be within 8-23 characters, <br/>
                   contain one special character: <span aria-label="exlamation mark">!</span><span aria-label="hash tag">#</span><span aria-label="dollar sign">$</span>
                   <span aria-label="percent sign">%</span> <br/>
                   and one number. 
          </p>

       
      </div>

      <div class="mb-6">
        <label htmlFor="passMatch" class="block text-white-700 text-sm font-bold mb-2" >
         Confirm Password
        </label>
        <input className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
           onChange = {(e)=> setpasswordMatch(e.target.value)}
           type="password" 
           id="passmatch"
           placeholder="Confirm Password"
           onFocus={() => setmatchFocus(true)}
           onBlur= {() => setmatchFocus(false)} 
         aria-invalid={validMatch ? "false" : "true"}
         aria-describedby="confMatch"
        />
         <p id ="confMatch" className = { matchFocus && !validMatch ? "userInstruct" : "erase" }>
                Must Match first password.
         </p>
       
      </div>


      <div className="flex items-center justify-between">
        <button  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
           disabled={!validName || !validPass || !validMatch ? true : false}>
          Sign up
        </button>
      </div>
    </form>
      
     
      )}  
    </div> 
    </>
    </div>
    
  </div> 
);



};


export default Register;