import { useState,useEffect,useRef } from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {  faXmark,faPaperclip, faFaceSmile,faCalendar, faUserPlus,  } from '@fortawesome/free-solid-svg-icons';
import Picker from 'emoji-picker-react'; // for the emoji section
import DatePicker from 'react-date-picker';

import { Toaster, toast } from 'sonner';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';



const NewTask = ({invertTask, taskStatus, taskSuccess, taskFail,members, setCards, column, creator}) => {
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
     
     const [text,setText] = useState("");
     const formRef = useRef(null)
     const [chosenMembers,setchosenMembers] = useState(null);

     const[displayfile,setDisplayFile] = useState(false); //Display the attachments when they exist in context.

     const[displayEmoji,setEmoji] = useState(false); // for emoji picker render

     const [displayMembers,setDisplayMembers] = useState(false); // Boolean logic to render Display Members component

     const [displayChosen, setdisplayChosen] = useState(false); // Boolean logic to render the chosen members

     const[displayDate,setDisplayDate] = useState(false); // to render date picker
     
     const[taskDate,settaskDate] = useState(null); // State for the chosen date

   
  
        //Handle file upload from user by concating to current file array.
     const handleFileChange = (event) => {
        if(event.target.files){ //Ensure that user did upload a pdf.          
            try {
                   if(event.target.files[0].size  <= 104857600 ) {
                    setFiles(Array.from(event.target.files));
                    setDisplayFile(true);                   
                   }
                   else{
                     taskFail("File size exceeds limit.")
                   }
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
        
        setText((prevText) => prevText + emojiObject.emoji);
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
          taskData.append("date", taskDate.toISOString().slice(0,19).replace('T',' '));
          taskData.append("assigned", chosenMembers)
          taskData.append('column', column)
          taskData.append('creator', creator)
          files.map((file) => taskData.append("attachment", file, file.name));
                   
      
            
            toast.promise(axios.post('http://localhost:5000/auth/create-new-task', taskData, {
              'Content-Type': 'multipart/form-data',
                withCredentials: true }) , {
                loading: 'sending task to server...',
                success: (response) =>{
                    console.log(response.data);
                    invertTask(!taskStatus);                         
                   setCards((prev) => [...prev, response.data]); //Something screwy is going on here.
                  
                   setText(""); // Clear input field
                    return 'Task created Successfully';
                },
                error: "Error occured during task creation.",
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
        
        <div className="fixed flex w-[450px] h-[525px] max-h-[525px] flex-col ml-[0.5em] border font-inter 
        rounded-md inset-y-0 left-0 text-[18px] bg-white m-auto left-1/3 right-1/3 z-50">   
           
            <div className="w-full text-[24px] font-bold h-[15%] flex flex-row"><h2 className="w-[50%] ml-[0.5em] mt-[0.5em]">Create New Task</h2> 
            <button className="float-right mb-[5%] ml-[40%] hover:scale-115" onClick={closeTask}><FontAwesomeIcon icon={faXmark} 
            className="scale-100 text-grey-500 hover:text-red-700" 
            /></button>
            </div>

            <div className="w-full h-[10%] flex flex-row text-[18ox] ml-[1.0em]; mb-2">
            
                     <label className='ml-2'>For:</label> <span id="attach">{ displayChosen && chosenMembers.map( (member,index) =>(
                        <MemberInfo memberId = {index} memberName={member} deletePeople={deletePeople}/>
                     ))}</span>
                    
             </div>
            <form className="h-[80%] w-full flex flex-col justify-center ml-[0em] mt-[3.5em]" ref={formRef} onSubmit={handleTaskupload} enctype="multipart/form-data" >            
                <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                className='scale-100 w-[95%]  h-[40%] ml-[0.68em] border-solid border-3 border-cyan-600 rounded-md mt-[-9.0] p-0'
                placeholder="Give the task a name!" id="textArea"  required name="textPart"/>

                <div className="w-full h-[20%] flex flex-row items-center">
                   

                  <button type="button"  onClick={renderEmoji} id="emoji-picker" style = {{display: 'none'}}>   </button>         
                    <div className="absolute top-1 left-1 z-[1000]">   { displayEmoji && <Picker onEmojiClick={appendEmoji} />  }  
                    </div>
                   <label htmlFor="emoji-picker" className="cursor-pointer  transition: background-color 0.5s hover:text-red-500  ml-[2.2em]"> 
                    <FontAwesomeIcon icon={faFaceSmile} 
                    className="scale-145  mt-[0.5em] " /> {/*auxillery-icon */}
                     </label>
                   <input type="file" style = {{display: 'none'}} onChange={handleFileChange} id="attachment-upload"
                    accept=".pdf,.xml,.docx" />
                   <label htmlFor="attachment-upload"  className="cursor-pointer  transition: background-color 0.5s hover:text-red-500  ml-[2.2em]">
                    <FontAwesomeIcon icon={faPaperclip} className="scale-145  mt-[0.5em] "/> {/*auxillery-icon */}
                    </label>

                    <button type="button"  onClick={renderDate} id="date-picker" style = {{display: 'none'}}>   </button>
                   <label htmlFor="date-picker"  className="cursor-pointer  transition: background-color 0.5s hover:text-red-500 ml-[2.2em]" >  
                     <FontAwesomeIcon icon={faCalendar} 
                    className="scale-145  mt-[0.5em]  "/> </label>
                   <div className="absolute left-[150px] bottom-[220px] bg-white rounded-md z-[1000]" >  {/* .date-position*/}
                     { displayDate && <DatePicker  selected={taskDate} onChange={appendDate} /> }  </div>
                    
                    {taskDate && (
                       <p className="ml-[2.2em] text-sm text-gray-700 font-inter">
                          Selected Date: {taskDate.toLocaleDateString()}
                       </p>
                    )}

                     <button type="button"  onClick={renderMembers} id="member-picker"style = {{display: 'none'}}>   </button>
                  <label htmlFor="member-picker"  className="cursor-pointer  transition: background-color 0.5s hover:text-red-500 left-[400px] absolute"  > 
                     <FontAwesomeIcon icon={faUserPlus} 
                  className = "scale-145 text-grey-400 cursor-pointer mt-[0.7em]" /></label> {/*person-share*/}
                     
                </div>
                
                <div className="flex h-[40px]">
                    <div className="w-full  h-[15%] text-[12px] flex  flex-wrap m-0 "> {/*.attachments-section*/} 
                     <label className="ml-2" >Attachments:</label> <span id="attach">{ displayfile && files.map( (file,index) =>(
                        <FileInfo id = {index} fileName={file.name} deleteAttachment={deleteAttachment}/>
                     ))}</span>
                    </div>
                </div>
                <div className="flex justify-center"> {/*new-task-submit */}
                      <button  type="submit"className="w-[75%] mt-[1.0em] h-full font-bold mt-[2.5em] bg-cyan-500 
                         text-center text-[18px]
                         text-white rounded-md transition delay-150 hover:bg-indigo-500 
                      "> Create Task</button>  {/*task-submit-button*/}
                </div>
              
            </form>
            <div className="absolute z-[1000] left-[500px] bottom-[100px]">{displayMembers && < MemberChecklist deptMemberList={members} 
                 close={renderMembers} setChosenMembers={setchosenMembers} chosen ={chosenMembers} 
                 displayChosen={setdisplayChosen}/>}</div>
           
            
        </div>
    )
};






const FileInfo = ({id,fileName, deleteAttachment}) => {
      let fileID = id;
   
    return (
        <div className="h-[40px] text-[12px] font-bold ml-[2.0em] bg-red-700 text-white rounded-md justify-center
        inline-block p-[12px] min-w-[25%] min-h-[50%] m-0 p-0 "> {/*file-card*/}
            {fileName} <button  onClick={()=> {deleteAttachment(fileID)}} type="button"><FontAwesomeIcon icon={faXmark} 
            className="close"/> </button>
        </div>
    )
}

//Same as FileInfo, but for members
const MemberInfo = ({memberId,memberName, deletePeople}) => {
  let memberID = memberId;
      
return (
    <div className="h-[40px] text-[12px] ml-[2.0em] bg-red-700 justify-center rounded-md inline-block p-[12px] text-white"> {/*   */}
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
      <div className="border-solid border-3 border-cyan-600 rounded-md w-[300px] max-h-[250px] flex flex-col bg-white"> {/*check-list-container */}
        <form className="overflow-hidden overflow-y-scroll" onSubmit={handleMemberSelection}> {/*check-list */}
          <ul>
            {deptMemberList.map((member) => (
              <li className="border-b-2 border-black" key={member.username}> {/*check-list-option */}
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
            <button type="button" className="w-[50%] bg-red-800 transition delay-150 hover:bg-red-500" onClick={close}> {/*check-list-close */}
              Close
            </button>
            <button  type="submit" className="w-[45%] transition delay-150 bg-green-800 hover:bg-indigo-500"> {/* check-list-accept*/}
              Accept
            </button>
          </div>
        </form>
      </div>
    );
  };


  export default NewTask;