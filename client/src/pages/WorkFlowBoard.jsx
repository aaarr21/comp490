import Board from '../components/boardComponents/Board'
import { useState,useEffect } from 'react';
import { Axios } from 'axios';

 const WorkFlowBoard = () =>{

      const [Loggedin,setLoggedin] = useState(true); // state if person accessing is even logged in.
                                                     //Revert to false to test.
      useEffect(()=>{  
        const logginInCheck = async () =>{
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/WorkBoard`, {
            credentials: 'include',
        })    
        if(response.status === 401)
            console.log("AAAAAA");
        else{
            setLoggedin(true);
        }
       // const data = await response.json();
        //console.log(data);
    }
       logginInCheck();
      } ,[]);

    return ( <div className ="h-screen w-full bg-neutral-900 text neutral-50">

       ({ Loggedin ?  <Board /> : (<section></section>) })
    </div>);


       
};



export default WorkFlowBoard;