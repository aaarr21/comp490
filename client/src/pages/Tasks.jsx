import { useState,useEffect } from 'react';
import { Axios } from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Tasks.css';


const Tasks = () => {

    const [Loggedin,setLoggedin] = useState(true); // state if person accessing is even logged in.
                                                   //Revert to false to test.
   
      const createNewTask = (e) =>{
        e.preventDefault();
          console.log("I have been pressed!!!!")
      }



    return(
        <div className='no-scroll'>
    <div className ="h-screen w-full bg-white-p-2 text neutral-50"> 

        <div className="task-button-container">
            <div clasName=""></div>
      <button className="task-button"
       aria-describedby="passNote"
       onClick={createNewTask}
      ><FontAwesomeIcon icon={faCircleXmark} className="task-button-icon"/>Create New Task!</button>
      </div>

 </div> </div>
);  
};






export default Tasks;