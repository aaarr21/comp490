import Board from '../components/boardComponents/Board'
import { useState,useEffect } from 'react';
import { Axios } from 'axios';

//There is a sinister ) at the bottom that casuses some empty space, unsure of why its there
 const WorkFlowBoard = () =>{

      const [Loggedin,setLoggedin] = useState(false); // state if person accessing is even logged in.
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
        const data = await response.json();
        console.log(data);
    }
       logginInCheck();
      } ,[]);

    return (
    <div className='no-scroll'>
    <div className ="h-screen w-full bg-white-p-2 text neutral-50">

       { Loggedin ?  <Board/> : <section></section> }
    </div>
    </div>    
);
     
};



export default WorkFlowBoard;