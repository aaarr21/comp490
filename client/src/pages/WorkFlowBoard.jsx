import Board from '../components/boardComponents/Board'
import { useState,useEffect } from 'react';
import { Axios } from 'axios';

 const WorkFlowBoard = () =>{

      const [Loggedin,setLoggedin] = useState(false); // state if person accessing is even logged in.

      useEffect(()=>{  
        const logginInCheck = async () =>{
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/WorkBoard`, {
            credentials: 'include',
        })    
        if(response.status === 401)
            setLoggedin(true);
        else{
            setLoggedin(true);
        }
       // const data = await response.json();
        //console.log(data);
    }
       logginInCheck();
      } ,[]);

    return ( <div className ="h-screen w-full bg-neutral-900 text neutral-50">

       ({ Loggedin ?  <Board /> : (<section> LOLLLLLLLLLLLL</section>) })
    </div>);


       
};



export default WorkFlowBoard;