import { useState,useEffect,useRef } from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleXmark, faXmark,faPaperclip, faFaceSmile,faCalendar, faUserPlus, faA } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Tasks.css';
import Picker from 'emoji-picker-react'; // for the emoji section
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import Select from 'react-select';
import { text } from '@fortawesome/fontawesome-svg-core';

const Tasks = () => {

    const [Loggedin,setLoggedin] = useState(true); // state if person accessing is even logged in.
                                                   //Revert to false to test.
    const [shownewTask,setnewTask] = useState(false) // state to determine if the new task should be viewable, 
                                                     // this gets modified by clicking upon the new task button.

           useEffect(()=>{  
                 const logginInCheck = async () =>{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/Task`, {
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

     /* 
        Note: The list below exist for me to first implement the select options and see if I can grab and use the options 
        for the Task object tbd. The actual iteartion will include an api call to the mysql database to create 
        an array for the departments(probably in some table for departments), and then a created array
         for the people within that department, another api call.
     */

     const DepartmentList = [ //Test list for the select option
        {value: "CompSci", label: "CompSci"},
        {value: "Biology", label: "Biology"},
        {value: "Archives", label: "Archives"},
        {value: "Administration", label: "Administration"}
     ];

      const PeopleList = [ //Test List for the people option
        {value: "Sebastian Sunga", label:"Sebastian"},
        {value: "John Dong" , label:"John"},
        {value: "Bianca Loera", label:"Bianca"},
        {value: "Alyssa Gomez", label: "Alyssa"},
        {value:"Bryan Abrego", label:"Bryan"}
      ]



     const [files,setFiles] = useState([]); //Handle the files

     const [departList,setdepartList] = useState(DepartmentList); //this feels wasteful for now, keep for when we can really do api calls to database.

     const [person,setPerson] = useState(null);

     const[displayfile,setDisplayFile] = useState(false); //Display the attachments when they exist in context.

     const[displayEmoji,setEmoji] = useState(false); // for emoji picker render

     const[displayDate,setDisplayDate] = useState(false); // to render date picker
     
     const[taskDate,settaskDate] = useState(null);

     const textRef = useRef(null); //Ref hook for text area
  

     const [selectedDepartment,setselectedDepartment] = useState();
        //Handle file upload from user by concating to current file array.
     const handleFileChange = (event) => {
        if(event.target.files){ //Ensure that user did upload a pdf.          
            try {
            
                    setFiles(Array.from(event.target.files));
                    setDisplayFile(true);                   
                    const yoinkedFiles = Array.from(event.target.files); //use from to convert from FilesList to Array. 
                                                                         // I need to do this so I can use the map array function.
                  
                   let combinedList = [...files,...yoinkedFiles]; //Use spread operator to create a final list of all file elements
                  
                     
                    setFiles(combinedList); //Set to final array                   
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

     const appendEmoji = (emojiObject) =>{
        
        textRef.current.value += emojiObject.emoji;
        setEmoji(!displayEmoji);
     }

     const appendDate = (date) =>{
        settaskDate(date);
        
        setDisplayDate(false);
     }

     const handleDepartmentSelection = (chosenDepartment) =>{
        setselectedDepartment(chosenDepartment);
        
     }
      //create new instance of task object to the back end.
     const handleTaskupload = async (e) =>{
          e.preventDefault();
          const text = e.target;
          console.log(text);
          const taskData = new FormData(text);
          taskData.append("date", taskDate);
          taskData.append("person", person);

          files.map((file) => taskData.append("attachment", file, file.name));
          console.log(taskData);          
          //console.log(files);
          if(taskDate == null){
            //Use toastify here to create a reponsive error message
            console.log("No date set for task. Please set a date.");
            return;
          }
         const response = await axios.post('http://localhost:5000/auth/create-new-task', taskData, {headers: {
            'Content-Type': 'multipart/form-data',
             withCredentials: true }
          });

         console.log(response);

     }

     const deleteAttachment = (fileId) => {
       // e.preventDefault();
        
        let tempArr = files.filter((file, index) => fileId !== index); //Temp array for the filtered array      
         setFiles(tempArr); //set files state to that temporary array
     } 


    return (
        
        <div className="new-task-container">   
           
            <div className="new-task-head-close"><h2 className="task-head">Create New Task</h2> 
            <button className="close-button" onClick={closeTask}><FontAwesomeIcon icon={faXmark} className="close-icon" /></button>
            </div>

            <div className="new-task-people"><label for="person" className="task-label"> For</label> 
            <DepartmentSelect options={PeopleList} onChanges={ (person) => setPerson(person.value)}/>  
            
            <label for="placeholderTwo" className="task-label"> In</label> 
               <DepartmentSelect options={DepartmentList} onChanges={handleDepartmentSelection}/>
             </div>
            <form className="new-task-form" onSubmit={handleTaskupload} action="/newTask" enctype="multipart/form-data" >            
                <textarea placeholder="Description...." id="textArea" ref={textRef} required name="textPart"></textarea>
                  
                <div className="new-task-form-auxillery">
                   <FontAwesomeIcon icon={faA} className="auxillery-icon" />

                  <button type="button"  onClick={renderEmoji} id="emoji-picker" style = {{display: 'none'}}>   </button>         
                    <div className="emoji-position">   { displayEmoji && <Picker onEmojiClick={appendEmoji} />  }  </div>
                   <label htmlFor="emoji-picker"> <FontAwesomeIcon icon={faFaceSmile}  className="auxillery-icon" /> </label>
                   <input type="file" style = {{display: 'none'}} onChange={handleFileChange} id="attachment-upload"
                    accept=".pdf,.xml,.docx" multiple />
                   <label htmlFor="attachment-upload">
                    <FontAwesomeIcon icon={faPaperclip} className="auxillery-icon"/>
                    </label>

                    <button type="button"  onClick={renderDate} id="date-picker" style = {{display: 'none'}}>   </button>
                   <label htmlFor="date-picker">   <FontAwesomeIcon icon={faCalendar}  className="auxillery-icon"/> </label>
                   <div className="date-position" >   { displayDate && <DatePicker 
                        selected ={taskDate} onChange={appendDate} /> }  </div>
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
                      <button  type="submit"className="task-submit-button"> Create Task</button>
                </div>
            </form>
           
            
        </div>
    )
};


const DepartmentSelect = ({options,onChanges}) => {

       const cpyList = options;
  
    

    return (
        <Select
            options={cpyList}
            onChange={onChanges} />
        
    )
}



const FileInfo = ({id,fileName, deleteAttachment}) => {
      let fileID = id;
   
    return (
        <div className="file-card">
            {fileName} <button  onClick={()=> {deleteAttachment(fileID)}} type="button"><FontAwesomeIcon icon={faXmark} 
            className="close"/> </button>
        </div>
    )
}

export default Tasks;