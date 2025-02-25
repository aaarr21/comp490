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

     

     const [files,setFiles] = useState([]); //Handle the files

     const[displayfile,setDisplayFile] = useState(false); //Display the attachments when they exist in context.

     const handleFileChange = (event) => {
        if(event.target.files){ //Ensure that user did upload a pdf.
   
           
            try {
                if(!displayfile) { // This is probably not needed, but I need to work on other projects before I can modify.
                    setFiles(Array.from(event.target.files));
                    setDisplayFile(true);
                 
                   } else{
                    const yoinkedFiles = Array.from(event.target.files); //use from to convert from FilesList to Array. I need to do this so I can use the map array function.
                    let finalList = [...files,...yoinkedFiles]; //Use spread operator to create a final list of all file elements
                    
                    setFiles(finalList); //Set to final array
                    
                   }
            } catch (error) {
             
            }
           
           
            
        }
     }

     const deleteAttachment = (fileId) => {
         setFiles(files.filter((file) => file.size !== (fileId *10)));
     } 


    return (
        
        <div className="new-task-container">    
            <div className="new-task-head-close"><h2 className="task-head">Create New Task</h2> <button className="close-button" onClick={closeTask}><FontAwesomeIcon icon={faXmark} className="close-icon" /></button></div>
            <div className="new-task-people"><label for="person" className="task-label"> For</label> <p className="person" id="person"> Bianca</p>   <label for="placeholderTwo" className="task-label"> In</label> <p className="person" id="placeholderTwo">Project</p> </div>
            <form className="new-task-form">            
                <textarea placeholder="Description...."></textarea>
                <div className="new-task-form-auxillery">
                   <FontAwesomeIcon icon={faA} className="auxillery-icon" />
                   <FontAwesomeIcon icon={faFaceSmile} className="auxillery-icon" />
                   <input type="file" style = {{display: 'none'}} onChange={handleFileChange} id="attachment-upload" accept=".pdf,.xml,.docx" multiple />
                   <label htmlFor="attachment-upload">
                    <FontAwesomeIcon icon={faPaperclip} className="auxillery-icon"/>
                    </label>
                   <FontAwesomeIcon icon={faCalendar}  className="auxillery-icon"/>
                   <FontAwesomeIcon icon={faUserPlus} className = "person-share" />
                </div>
                <div>
                    <div className="attachment-section"> 
                     <label >Attachments:</label> <span id="attach">{ displayfile && files.map(file =>(
                        <FileInfo key = {file.size} fileName={file.name} deleteAttachment={deleteAttachment}/>
                     ))}</span>
                    </div>
                </div>
                <div className="new-task-submit">
                      <button className="task-submit-button"> Create Task</button>
                </div>
            </form>
           
            
        </div>
    )
};



const FileInfo = ({key,fileName, deleteAttachment}) => {
    const fileID = (key / 10);
    return (
        <div className="file-card">
            {fileName} <button style = {{display: 'none'}} onClick={deleteAttachment}><FontAwesomeIcon icon={faXmark} className="close"/> </button>
        </div>
    )
}

export default Tasks;