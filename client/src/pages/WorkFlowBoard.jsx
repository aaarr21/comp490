import Board from '../components/boardComponents/Board'
import { useState,useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';

 const WorkFlowBoard = () =>{


    const [Loggedin,setLoggedin] = useState(false); // state if person accessing is even logged in.
                                                     //Revert to false to test.
    const [loggedUser,setLoggedUser] = useState(null);                
                                                     
     const [deptMembers,setDeptMembers] = useState(null); // state for a list of all possible members to add to task.
      useEffect(()=>{  
        const logginInCheck = async () =>{
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/status`, {
            credentials: 'include',
        })    
        if(response.status === 401)
            console.log("AAAAAA");
        else{
            setLoggedin(true);
        }
        const data = await response.json();
        setLoggedUser(data.user.username);
    }
    const getTheUsers = async () => {
    
                            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/get-all-members`,
                                {credentials: 'include'},
                            ) 
                                 
                                  if(response.status === 500)
                                     failNotify(response.error);
                                 else{
                                    setDeptMembers(response.data);
                                    successNotify("Sucessfully acquired department members!");
                                 }
    
                        }
       logginInCheck();
       getTheUsers();
      } ,[]);

       const successNotify = (dialog) => {
                    toast.success(dialog);
              }
      
              const failNotify = (dialog) => {
                  toast.error(dialog);
            }

    return (
    <div className='no-scroll'>
    <div className ="h-screen w-full bg-slate-200 p-2 text neutral-50 font-inter">

       { Loggedin ?  <Board success={successNotify} fail={failNotify} members={deptMembers}/> : <section></section> }
       <Toaster position="bottom-center" richColors />
    </div>
    </div>    
);
     
};



export default WorkFlowBoard;