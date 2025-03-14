import { useState,useEffect,useRef } from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleXmark, faXmark,faPaperclip, faFaceSmile,faCalendar, faUserPlus, faA } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Tasks.css';
import Picker from 'emoji-picker-react'; // for the emoji section
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import ToDo from '../components/TasksToDo';
import { text } from '@fortawesome/fontawesome-svg-core';
import { Toaster, toast } from 'sonner';

const Tasks = () => {

    const [Loggedin,setLoggedin] = useState(true); // state if person accessing is even logged in.
                                                   //Revert to false to test.
    const [shownewTask,setnewTask] = useState(false) // state to determine if the new task should be viewable, 
                                                     // this gets modified by clicking upon the new task button. 

    const [deptMembers,setDeptMembers] = useState(null); // state for a list of all possible members to add to task.

        const successNotify = (dialog) => {
              toast.success(dialog);
        }

        const failNotify = (dialog) => {
            toast.error(dialog);
      }


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
                                                       // const data = await response.json();
                                                        //console.log(data);
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
   
      const createNewTask = () => {               
          setnewTask(!shownewTask);
          
      }



    return(
        <div className='no-scroll'>
    <div className ="task-page"> 
       
        <div className="task-button-container">
            
      <button className="task-button"
       aria-describedby="passNote"
       onClick={createNewTask}
      ><FontAwesomeIcon icon={faCircleXmark} className="task-button-icon"/>Create New Task!</button>
      </div>
      <ToDo />
       {  Loggedin && (shownewTask ? < NewTask invertTask = {setnewTask} taskStatus={shownewTask} taskSuccess ={successNotify} taskFail ={failNotify} members ={deptMembers}/> : '')} 
         <Toaster position="bottom-center" richColors />
         
 </div> </div>
);  
};








const NewTask = ({invertTask, taskStatus, taskSuccess, taskFail,members}) => {
    // Determine if this should get any passed in props to determine owner, 
    //should talk to see if we should get a custom object to represent the task and the various attributes.
     const closeTask = () =>{ //close task, this deletes all of the contents of the task and when clicked again renders a new task.
        invertTask(!taskStatus);
     }

     /* 
        Note: The list below exist for me to first implement the select options and see if I can grab and use the options 
        for the Task object tbd. The actual iteartion will include an api call to the mysql database to create 
        an array for the departments(probably in some table for departments), and then a created array
         for the people within that department, another api call.
     */

     const [files,setFiles] = useState([]); //Handle the files
     

     const [chosenMembers,setchosenMembers] = useState(null);

     const[displayfile,setDisplayFile] = useState(false); //Display the attachments when they exist in context.

     const[displayEmoji,setEmoji] = useState(false); // for emoji picker render

     const [displayMembers,setDisplayMembers] = useState(false); // Boolean logic to render Display Members component

     const [displayChosen, setdisplayChosen] = useState(false); // Boolean logic to render the chosen members

     const[displayDate,setDisplayDate] = useState(false); // to render date picker
     
     const[taskDate,settaskDate] = useState(null); // State for the chosen date

     const textRef = useRef(null); //Ref hook for text area
  
        //Handle file upload from user by concating to current file array.
     const handleFileChange = (event) => {
        if(event.target.files){ //Ensure that user did upload a pdf.          
            try {
            
                    setFiles(Array.from(event.target.files));
                    setDisplayFile(true);                   
                    //const yoinkedFiles = Array.from(event.target.files); //use from to convert from FilesList to Array. 
                                                                         // I need to do this so I can use the map array function.
                  
                 //  let combinedList = [...files,...yoinkedFiles]; //Use spread operator to create a final list of all file elements
                  
                     
                   // setFiles(combinedList); //Set to final array                   
            } catch (error) {
             
            }            
        }
     }

  


     const renderEmoji = (event) =>{
       
         event.preventDefault();
         
         setEmoji(!displayEmoji);
     }
      //starter to render date picker
     const renderDate = (event) =>{
         event.preventDefault();
         setDisplayDate(!displayDate);
     }
     // take a passed in emojiObject from the EmojiPicker and append it to our task text area
     const appendEmoji = (emojiObject) =>{
        
        textRef.current.value += emojiObject.emoji;
        setEmoji(!displayEmoji);
     }

     // Take chosen date and set it to our task date.
     const appendDate = (date) =>{
        settaskDate(date);
        taskSuccess(("Date Chosen: " + date))
        setDisplayDate(false);
     }

     // Render the members list component.
     const renderMembers = () =>{
       
    
        setDisplayMembers(!displayMembers);
      
     }

    
      //create new instance of task object and store it within our seleted users.
     const handleTaskupload = async (e) =>{
          e.preventDefault();
          const TaskForm = e.target;
          if(taskDate == null || chosenMembers == null){
            //Use toastify here to create a reponsive error message
            taskFail("One or More empty fields for task, please fix them.")
            return;
          }
          const taskData = new FormData(TaskForm);
          taskData.append("date", taskDate);
          taskData.append("people", chosenMembers)

          files.map((file) => taskData.append("attachment", file, file.name));
          console.log(taskData);          
          
          
         const response = await axios.post('http://localhost:5000/auth/create-new-task', taskData, {
            'Content-Type': 'multipart/form-data',
              withCredentials: true });  

            toast.promise(response, {
                loading: 'sending task to server...',
                success: (data) =>{
                    invertTask(!taskStatus);
                    return 'Task created Successfully';
                },
                error: "Error Occured",
            });

     }

     //Helper function to the file component to delete from files array once user clicks on the x mark.
     const deleteAttachment = (fileId) => {
      
        
        let tempArr = files.filter((file, index) => fileId !== index); //Temp array for the filtered array      
         setFiles(tempArr); //set files state to that temporary array
     } 

     const deletePeople = (memberId) => {
     
       
       let tempArr = chosenMembers.filter((member, index) => memberId !== index); //Temp array for the filtered array      
        setchosenMembers(tempArr); //set chosenMembers state to that temporary array
    } 


    return (
        
        <div className="new-task-container">   
           
            <div className="new-task-head-close"><h2 className="task-head">Create New Task</h2> 
            <button className="close-button" onClick={closeTask}><FontAwesomeIcon icon={faXmark} className="close-icon" /></button>
            </div>

            <div className="new-task-people">
            
                     <label >For:</label> <span id="attach">{ displayChosen && chosenMembers.map( (member,index) =>(
                        <MemberInfo memberId = {index} memberName={member} deletePeople={deletePeople}/>
                     ))}</span>
                    
             </div>
            <form className="new-task-form" onSubmit={handleTaskupload} enctype="multipart/form-data" >            
                <textarea placeholder="Description...." id="textArea" ref={textRef} required name="textPart"></textarea>
                  
                <div className="new-task-form-auxillery">
                   

                  <button type="button"  onClick={renderEmoji} id="emoji-picker" style = {{display: 'none'}}>   </button>         
                    <div className="emoji-position">   { displayEmoji && <Picker onEmojiClick={appendEmoji} />  }  </div>
                   <label htmlFor="emoji-picker" className="label-please"> <FontAwesomeIcon icon={faFaceSmile} 
                    className="auxillery-icon" /> </label>
                   <input type="file" style = {{display: 'none'}} onChange={handleFileChange} id="attachment-upload"
                    accept=".pdf,.xml,.docx" />
                   <label htmlFor="attachment-upload">
                    <FontAwesomeIcon icon={faPaperclip} className="auxillery-icon"/>
                    </label>

                    <button type="button"  onClick={renderDate} id="date-picker" style = {{display: 'none'}}>   </button>
                   <label htmlFor="date-picker" >   <FontAwesomeIcon icon={faCalendar} 
                    className="auxillery-icon"/> </label>
                   <div className="date-position" >   { displayDate && <DatePicker 
                        selected ={taskDate} onChange={appendDate} /> }  </div>


                     <button type="button"  onClick={renderMembers} id="member-picker"style = {{display: 'none'}}>   </button>
                  <label htmlFor="member-picker" className="person-label"  >  <FontAwesomeIcon icon={faUserPlus} className = "person-share" /></label>
                     
                </div>
                
                <div>
                    <div className="attachment-section"> 
                     <label >Attachments:</label> <span id="attach">{ displayfile && files.map( (file,index) =>(
                        <FileInfo id = {index} fileName={file.name} deleteAttachment={deleteAttachment}/>
                     ))}</span>
                    </div>
                </div>
                <div className="new-task-submit">
                      <button  type="submit"className="task-submit-button"> Create Task</button>
                </div>
            </form>
            <div className="member-position">{displayMembers && < MemberChecklist deptMemberList={members} 
                 close={renderMembers} setChosenMembers={setchosenMembers} chosen ={chosenMembers} 
                 displayChosen={setdisplayChosen}/>}</div>
           
            
        </div>
    )
};






const FileInfo = ({id,fileName, deleteAttachment}) => {
      let fileID = id;
   
    return (
        <div className="file-card">
            {fileName} <button  onClick={()=> {deleteAttachment(fileID)}} type="button"><FontAwesomeIcon icon={faXmark} 
            className="close"/> </button>
        </div>
    )
}

//Same as FileInfo, but for members
const MemberInfo = ({memberId,memberName, deletePeople}) => {
  let memberID = memberId;
      
return (
    <div className="member-card">
        {memberName} <button  onClick={()=> {deletePeople(memberID)}} type="button"><FontAwesomeIcon icon={faXmark} 
        className="close"/> </button>
    </div>
)
}

const MemberChecklist = ({ deptMemberList, close, setChosenMembers, displayChosen, chosen  }) => {
  const handleMemberSelection = (e) => {
       e.preventDefault();
    
    const memberData = e.target;
     const formData = new FormData(memberData);
     const chosenList = [];
     for (let [key, value] of formData.entries()) {
       chosenList.push(value);
     }
       if(chosen !== null){
       let combinedList = [...chosen,...chosenList];
       setChosenMembers(combinedList);
       }
       else{
           setChosenMembers(chosenList);
       }
     displayChosen(true);
    close();  
  };
    return (
      <div className="check-list-container">
        <form className="check-list" onSubmit={handleMemberSelection}>
          <ul>
            {deptMemberList.map((member) => (
              <li className="check-list-option" key={member.username}>
                <input
                  type="checkbox"
                  id={member.username}
                  name="members"
                  value={member.username}
                />
                <label htmlFor={member.username}>{member.username}</label>
              </li>
            ))}
          </ul>
  
          <div className="adjacent-check-list">
            <button type="button" className="check-list-close" onClick={close}>
              Close
            </button>
            <button  type="submit" className="check-list-accept">
              Accept
            </button>
          </div>
        </form>
      </div>
    );
  };



export default Tasks;