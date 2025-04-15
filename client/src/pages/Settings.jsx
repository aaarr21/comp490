import { useEffect,useState,useRef } from "react";
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom';
import { Toaster, toast } from 'sonner';


const Settings = () =>{
    const[loggedIn,setLoggedin] = useState(false);
    const[userId,setUserId] = useState(null); // keep user id in context
    const [currUser,setCurrUser] = useState("");
    const [editUser,setEditUser] = useState("");
    const [user,setUser] = useState(null);
    const [editEmail,setEditEmail] = useState("");
    const [currEmail,setCurrEmail] = useState("");
    const [currRole,setCurrRole] = useState("Student");
    const [isEditingUser,setIsEditingUser] = useState(false)
    const [isEditingEmail,setIsEditingEmail] = useState(false);


    const successNotify = (dialog) => {
        toast.success(dialog);
  }

  const failNotify = (dialog) => {
      toast.error(dialog);
}

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
        setUser(data);
        setCurrUser(data.user.username);
        setCurrEmail(data.user.email);
        setUserId(data.user.id);
    } 
    logginInCheck();
}, [])

   const updateEmail = async (userId, nextEmail) =>{
    setIsEditingEmail(!isEditingEmail);
    setCurrEmail(currEmail);
          
    let username = currUser;
    let email = nextEmail;
    console.log(email.includes('@'));
    if(nextEmail === "" || !(email.includes('@')) ){
        failNotify("Please enter a valid email.")
        return;
    }
    let role = user.user.role;

    toast.promise(axios.put(`${process.env.REACT_APP_API_URL}/auth/update-user/:${userId}`, {username,email, role },
        {withCredentials : true }) , {
          loading: 'updating email...',
          success: (response) =>{
              // Clear input field
              setIsEditingEmail(false);
              setCurrEmail(nextEmail);
              setEditEmail('');
              
              return 'Updated Email!';
          },
          error: "Error occured while updating",
      }); 
   }

   const updateName = async (userId, nextUser) => {
    setIsEditingUser(!editEmail);
          let username = nextUser;
          let email = currEmail;
          if(nextUser === "")
            return;
          let role = user.user.role;
          toast.promise(axios.put(`${process.env.REACT_APP_API_URL}/auth/update-user/:${userId}`, {username,email, role },
            {withCredentials : true }) , {
              loading: 'updating user...',
              success: (response) =>{
                  // Clear input field
                  
                  setCurrUser(nextUser);
                  setEditUser('');
                  
                  return 'Updated User!';
              },
              error: "Error occured while updating",
          }); 
             
          
         // if successful, update here
         //if fail, throw up error.
   }

   return (
       <div
           className="h-[650px] w-auto ">
           <h1 className="font-lilita text-lg relative  text-bold mt-1 ml-[300px]">IN CONSTRUCTION</h1>
           <div className=" mt-5 shadow-md h-[500px] w-[50%] bg-white shadow-md ml-[350px] rounded">
           
               <div className="w-[80%] h-[80%]   inline-block">
                
               <h2 className="font-inter font-semibold ml-5 text-[20px] mt-5">User:</h2>
                
                <div className ="mt-1 inline-block w-[250px] flex flex-column">
                {isEditingUser ? (<input 
                value={editUser} 
                onChange={(e) =>(setEditUser(e.target.value))}
                onKeyDown={(e)=>{
                    if(e.key === "Enter"){
                        e.preventDefault();
                        updateName(userId,editUser);
                    }
                }
                }
                 autoFocus
                 className="w-full bg-neutral-100 text-neutral-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-black "
                >
                    
                </input>) : 
                (  <p className="font-inter ml-6">{currUser} </p> )
                }
                 <button className="ml-2 p-0 hover:bg-grey-500 hover:animate-pulse" title="update Username" 
                 type="button" onClick={() => (setIsEditingUser(!isEditingUser))} > ✏️ 
                    
                 </button>
                 </div>
                 <h2 className="font-inter font-semibold ml-5 text-[20px] mt-5">Email:</h2>
                 <div className="mt-1 w-[350px] flex ">
                
                 {isEditingEmail ? (<input 
                value={editEmail} 
                onChange={(e) =>(setEditEmail(e.target.value))}
                onKeyDown={(e)=>{
                    if(e.key === "Enter"){
                        e.preventDefault();
                        updateEmail(userId,editEmail);
                    }
                }
                }
                 autoFocus
                 className="w-full bg-neutral-100 text-neutral-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-black "
                >
                    
                </input>) : 
                (  <p className="font-inter ml-6">{currEmail} </p> )
                }
                 <button className="ml-2 p-0 hover:bg-grey-500 hover:animate-pulse" title="update Email" type="button" onClick={() => (setIsEditingEmail(!isEditingEmail))} > ✏️ 
                    
                 </button>
                 
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
           <Toaster position="bottom-center" richColors />
       </div>
   )
}

export default Settings;