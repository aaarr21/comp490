import { useState,useEffect,useRef } from 'react';
import { Axios } from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleXmark, faXmark,faPaperclip, faFaceSmile,faCalendar, faUserPlus, faA } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Tasks.css';
import Picker from 'emoji-picker-react'; // for the emoji section
import { text } from '@fortawesome/fontawesome-svg-core';

const Tasks = () => {

    const [Loggedin,setLoggedin] = useState(true); // state if person accessing is even logged in.
                                                   //Revert to false to test.
    const [shownewTask,setnewTask] = useState(false) // state to determine if the new task should be viewable, 
                                                     // this gets modified by clicking upon the new task button.

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
       {  Loggedin && (shownewTask ? < NewTask invertTask = {setnewTask} taskStatus={shownewTask} /> : '')} 

 </div> </div>
);  
};








const NewTask = ({invertTask, taskStatus}) => {
    // Determine if this should get any passed in props to determine owner, 
    //should talk to see if we should get a custom object to represent the task and the various attributes.
     const closeTask = () =>{ //close task, this deletes all of the contents of the task and when clicked again renders a new task.
        invertTask(!taskStatus);
     }

     

     const [files,setFiles] = useState([]); //Handle the files

     const[displayfile,setDisplayFile] = useState(false); //Display the attachments when they exist in context.

     const[displayEmoji,setEmoji] = useState(false);

     const textRef = useRef(null);

     const handleFileChange = (event) => {
        if(event.target.files){ //Ensure that user did upload a pdf.          
            try {
            
                    setFiles(Array.from(event.target.files));
                    setDisplayFile(true);                   
                    const yoinkedFiles = Array.from(event.target.files); //use from to convert from FilesList to Array. I need to do this so I can use the map array function.
                  
                   let combinedList = [...files,...yoinkedFiles]; //Use spread operator to create a final list of all file elements
                  
                     
                    setFiles(combinedList); //Set to final array                   
            } catch (error) {
             
            }            
        }
     }

     const renderEmoji = (event) =>{
       
         event.preventDefault();
         textRef.current.value += "HUH";
         setEmoji(!displayEmoji);
     }

     const appendEmoji = (emojiObject) =>{
        
        textRef.current.value += emojiObject.emoji;
        setEmoji(!displayEmoji);
     }

     const deleteAttachment = (fileId) => {
       // e.preventDefault();
        
        let tempArr = files.filter((file, index) => fileId !== index); //Temp array for the filtered array      
         setFiles(tempArr); //set files state to that temporary array
     } 


    return (
        
        <div className="new-task-container">   
           
            <div className="new-task-head-close"><h2 className="task-head">Create New Task</h2> <button className="close-button" onClick={closeTask}><FontAwesomeIcon icon={faXmark} className="close-icon" /></button></div>
            <div className="new-task-people"><label for="person" className="task-label"> For</label> <p className="person" id="person"> Bianca</p>   <label for="placeholderTwo" className="task-label"> In</label> <p className="person" id="placeholderTwo">Project</p> </div>
            <form className="new-task-form">            
                <textarea placeholder="Description...." id="textArea" ref={textRef}></textarea>
                  
                <div className="new-task-form-auxillery">
                   <FontAwesomeIcon icon={faA} className="auxillery-icon" />

                  <button type="button"  onClick={renderEmoji} id="emoji-picker" style = {{display: 'none'}}>   </button>         
                    <div className="emoji-position">   { displayEmoji && <Picker onEmojiClick={appendEmoji} />  }  </div>
                   <label htmlFor="emoji-picker"> <FontAwesomeIcon icon={faFaceSmile}  className="auxillery-icon" /> </label>
                   <input type="file" style = {{display: 'none'}} onChange={handleFileChange} id="attachment-upload" accept=".pdf,.xml,.docx" multiple />
                   <label htmlFor="attachment-upload">
                    <FontAwesomeIcon icon={faPaperclip} className="auxillery-icon"/>
                    </label>
                   <FontAwesomeIcon icon={faCalendar}  className="auxillery-icon"/>
                   <FontAwesomeIcon icon={faUserPlus} className = "person-share" />
                </div>
                <div>
                    <div className="attachment-section"> 
                     <label >Attachments:</label> <span id="attach">{ displayfile && files.map( (file,index) =>(
                        <FileInfo id = {index} fileName={file.name} deleteAttachment={deleteAttachment}/>
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



const FileInfo = ({id,fileName, deleteAttachment}) => {
      let fileID = id;
   
    return (
        <div className="file-card">
            {fileName} <button  onClick={()=> {deleteAttachment(fileID)}} type="button"><FontAwesomeIcon icon={faXmark} className="close"/> </button>
        </div>
    )
}

export default Tasks;