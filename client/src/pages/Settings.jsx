import { useEffect,useState,useRef } from "react";
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'


const Settings = () =>{
    const[loggedIn,setLoggedin] = useState(false)
    const [currUser,setCurrUser] = useState("");
    const [currEmail,setCurrEmail] = useState("");
    const [currRole,setCurrRole] = useState("Student");

    useEffect(()=> {  
        const logginInCheck = async () =>{
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/status`, {
            credentials: 'include',
        })    
        if(response.status === 401)
            console.log("User is authenticated, proceeding.");
        else{
            setLoggedin(true);
        }
        const data = await response.json();
        setCurrUser(data.user.username);
        setCurrEmail(data.user.email);
    } 
    logginInCheck();
}, [])

   return (
       <div
           className="h-[650px] w-auto ">
           <h1 className="font-lilita text-lg relative  text-bold mt-1 ml-[300px]">IN CONSTRUCTION</h1>
           <div className=" mt-5 shadow-md h-[500px] w-[50%] bg-white shadow-md ml-[350px] rounded">
           
               <div className="w-full h-[80%]  gap-4 inline-block">
                <div className ="mt-5">
                 <h2 className="font-inter font-semibold ml-5 text-[20px]">User:</h2>
                 <p className="font-inter ml-6">{currUser}</p>
                 </div>
                 <div className="mt-5">
                 <h2 className="font-inter font-semibold ml-5 text-[20px]">Email:</h2>
                 <p className="ml-6">{currEmail}</p>
                 </div>

                 <div className="mt-5">
                 <h2 className="font-inter font-semibold ml-5 text-[20px]">Role:</h2>
                 <p className="ml-6">{currRole}</p>
                 </div>

                 <div className="mt-5">
                 <h2 className="font-inter font-semibold ml-5 text-[20px]">Appearence:</h2>
                 <p className="ml-6">Don'tknow</p>
                 </div>

               </div>
               
           </div>
       </div>
   )
}

export default Settings;