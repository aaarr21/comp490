import { useState } from "react";


const Register = () =>{
       const [userName, setuserName] = useState(false);

       const [passWord, Setpassword] = useState(false);

       const handleRegistration = () =>{
          console.log(userName);
          console.log(passWord);
       }


  return( <div className="h-screen w-full bg-neutral-900 text neutral-50">


  <div className ="registerBox">
  <div className="wrapAround">  
<form className="bg-neutral-900 shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-white-700 text-sm font-bold mb-2">
          Username
        </label>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"  type="text"
           onChange = {(e)=> setuserName(e.target.value)}
        placeholder="Username"/>
      </div>
      <div class="mb-6">
        <label class="block text-white-700 text-sm font-bold mb-2" >
          Password
        </label>
        <input className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
           onChange = {(e)=> Setpassword(e.target.value)}
        type="password" placeholder="password" />
       
      </div>
      <div className="flex items-center justify-between">
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={handleRegistration}>
          Sign In
        </button>
        <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
          Register Account
        </a>
      </div>
    </form>
    

    </div>
    
    </div>
  </div> 
);



};


export default Register;