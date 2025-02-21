import { useState,useEffect } from 'react';
import { Axios } from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleXmark, faXmark,faPaperclip, faFaceSmile,faCalendar, faUserPlus, faA } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Tasks.css';


const Tasks = () => {

    const [Loggedin,setLoggedin] = useState(true); // state if person accessing is even logged in.
                                                   //Revert to false to test.
    const [shownewTask,setnewTask] = useState(false) // state to determine if the new task should be viewable, 
                                                     // this gets modified by clicking upon the new task button.
   
      const createNewTask = () => {               
          setnewTask(!shownewTask);
          
      }



    return(
        <div className='no-scroll'>
    <div className ="task-page"> 
       
        <div className="task-button-container">
            <div clasName=""></div>
      <button className="task-button"
       aria-describedby="passNote"
       onClick={createNewTask}
      ><FontAwesomeIcon icon={faCircleXmark} className="task-button-icon"/>Create New Task!</button>
      </div>
       { shownewTask ? < NewTask invertTask = {setnewTask} taskStatus={shownewTask} /> : ''} 

 </div> </div>
);  
};








const NewTask = ({invertTask, taskStatus}) => {
    // Determine if this should get any passed in props to determine owner, 
    //should talk to see if we should get a custom object to represent the task and the various attributes.
     const closeTask = () =>{
        invertTask(!taskStatus);
     }


    return (
        
        <div className="new-task-container">    
            <div className="new-task-head-close"><h2>Create New Task</h2> <button className="close-button" onClick={closeTask}><FontAwesomeIcon icon={faXmark} className="close-icon" /></button></div>
            <div className="new-task-people"><label for="person" > For</label> <p className="person" id="person"> Bianca</p>   <label for="placeholderTwo"> In</label> <p className="person" id="placeholderTwo">Project</p> </div>
            <form className="new-task-form">            
                <textarea placeholder="Description...."></textarea>
                <div className="new-task-form-auxillery">
                   <FontAwesomeIcon icon={faA} className="auxillery-icon" />
                   <FontAwesomeIcon icon={faFaceSmile} className="auxillery-icon" />
                   <FontAwesomeIcon icon={faPaperclip} className="auxillery-icon"/>
                   <FontAwesomeIcon icon={faCalendar}  className="auxillery-icon"/>
                   <FontAwesomeIcon icon={faUserPlus} className = "person-share" />
                </div>
                <div className="new-task-submit">
                      <button className="task-submit-button"> Create Task</button>
                </div>
            </form>
           
            
        </div>
    )
};

export default Tasks;