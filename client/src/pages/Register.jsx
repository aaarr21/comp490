import { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;

const Register = () => {
  const [username, setUsername] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');
  const [validPass, setValidPass] = useState(false);
  const [validMatch, setValidMatch] = useState(false);
  
  const [passFocus, setPassFocus] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);
  
  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const userRef = useRef();
  const errorRef = useRef();
  const navigate = useNavigate();

  useEffect(() => { userRef.current.focus(); }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(username));
  }, [username]);

  useEffect(() => {
    setValidPass(PWD_REGEX.test(password));
    setValidMatch(password === passwordMatch);
  }, [password, passwordMatch]);

  useEffect(() => { setErrMsg(''); }, [username, password, passwordMatch]);

  const handleRegistration = async (e) => {
    e.preventDefault();

    const subtestuser = USER_REGEX.test(username);;
    const subtestPass = PWD_REGEX.test(password);

    if (!subtestuser|| !subtestPass) {
      setErrMsg("Invalid entry");
      return;
    }
    
    try {
      const response = await axios.post('/auth/register', { 
        username, password 
      });
      console.log(response);
      setSuccess(true);
      navigate('/login');
    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response');
      } else if (err.response.status === 409) {
        setErrMsg('Username Taken');
      } else {
        setErrMsg('Registration Failed');
      }
      errorRef.current.focus();
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <div className="registerBox">
        {success ? (
          <section className="bg-red-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h1 className="sectiontext">SUCCESS!</h1>
          </section>
        ) : (
          <form className="bg-red-800 shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleRegistration}>
            <p ref={errorRef} className={errMsg ? "errmsg" : "erase"} aria-live="assertive">{errMsg}</p>
            <h1 className="mb-4 text-4xl font-extrabold">Register Here!</h1>
            <div className="mb-4">
              <label htmlFor="username" className="block text-white-700 text-sm font-bold mb-2">Username</label>
              <input 
                type="text"
                id="username"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={validName ? "false" : "true"}
                aria-describedby="userNote"
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Username"
              />
              <p id="userNote" className={userFocus && username && !validName ? "userInstruct" : "erase"}>
                Username must begin with a letter, be 4-24 characters, and contain only letters, numbers, or underscores.
              </p>
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-white-700 text-sm font-bold mb-2">Password</label>
              <input 
                type="password" 
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={validPass ? "false" : "true"}
                aria-describedby="passNote"
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Password"
              />
              <p id="passNote" className={passFocus && !validPass ? "userInstruct" : "erase"}>
                Password must be 8-24 characters and include uppercase, lowercase, a number, and a special character.
              </p>
            </div>
            <div className="mb-6">
              <label htmlFor="passMatch" className="block text-white-700 text-sm font-bold mb-2">Confirm Password</label>
              <input 
                type="password" 
                id="passMatch"
                onChange={(e) => setPasswordMatch(e.target.value)}
                aria-invalid={validMatch ? "false" : "true"}
                aria-describedby="confMatch"
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Confirm Password"
              />
              <p id="confMatch" className={matchFocus && !validMatch ? "userInstruct" : "erase"}>
                Passwords must match.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <button 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                disabled={!validName || !validPass || !validMatch ? true : false}
              >
                Sign Up
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
