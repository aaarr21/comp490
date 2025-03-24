import { useState,useEffect,useRef } from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleXmark, faXmark,faPaperclip, faFaceSmile,faCalendar, faUserPlus, faA, faPaintBrush, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Tasks.css';
import Picker from 'emoji-picker-react'; // for the emoji section
import DatePicker from 'react-date-picker';
import { HexColorPicker } from "react-colorful";

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import ToDo from '../components/TasksToDo';
import { text } from '@fortawesome/fontawesome-svg-core';
import { Toaster, toast } from 'sonner';

const AssignTask = () => {

    const [Loggedin,setLoggedin] = useState(true); // state if person accessing is even logged in.
                                                   //Revert to false to test.
    const [shownewColumn,setnewColumn] = useState(false) // state to determine if the new task should be viewable, 
                                                     // this gets modified by clicking upon the new task button. 
  

    const [deptMembers,setDeptMembers] = useState(null); // state for a list of all possible members to add to task.
    const [btnMsg, setBtnMsg] = useState("Set a New Goal.")
    

    
    const textRef = useRef(null)
   

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
   
      const createNewColumn = () => {   
                   
          setnewColumn(!shownewColumn);
          if(!shownewColumn){
             setBtnMsg("Cancel Goal")
          }
          else{
            setBtnMsg("Create New Goal")
          }
          
      }



    return(
        <div className='no-scroll'>
    <div className ="flex flex-col bg-slate-200 overflow-hidden h-full w-full margin-0"> 
       
        <div className="task-button-container">
            
      <button className="task-button text-black  font-inter"
       aria-describedby="passNote"
       onClick={createNewColumn}
      ><FontAwesomeIcon icon={faCircleXmark} className=  "task-button-icon hover:animate-bounce "/> {btnMsg}  </button>
      </div>
      <ToDo />
       {  Loggedin && (  shownewColumn ?  <NewColumn invertRender={setnewColumn} setBtnMsg={setBtnMsg} members={deptMembers}  /> :'')} 
         <Toaster position="bottom-center" richColors />
         
 </div> </div>
);  
};








const NewColumn = ({invertRender,setBtnMsg, success, fail,members}) => {
    // Determine if this should get any passed in props to determine owner, 
    //should talk to see if we should get a custom object to represent the task and the various attributes.
       const [columnName,setColumnName] = useState("")
       const [column,setColumn] = useState("")
       const [color,setColor] = useState("#aabbcc")
       const [colorText,setColorText] = useState("Choose Color")
       const[rendercolorPicker,setRenderColorPicker] = useState(false)
      
       

       const handleColumnCreation = async (e) => {
             e.preventDefault()
             if(columnName == ""){
              fail("Please enter a name for the column")
                return;
             }
             setColumn(columnName)

             const response = await axios.post('http://localhost:5000/auth/create-new-goal',{column, columnName, color},
              {withCredentials: true}
             );
               toast.promise(response,{
                 loading: 'sending goal to server...',
                 success: (data) =>{
                  setBtnMsg("Create a New Goal")
                  invertRender(false)
                    return "Successfully created Goal!";
                 },
                 error: "Error Occured"
               })

       }

       const colorChoice = () =>{
           setRenderColorPicker(!rendercolorPicker)
           if(!rendercolorPicker){
              setColorText("Close Color")
           } else{
             setColorText("Choose Color")
           }
       }
     
       return(
             <div className = " relative rounded-md w-[350px] h-[300px] bg-white bg-shadow shadow-md rounded-lg shadow-lg font-inter gap-4 justify-between ml-5">
                <h1 className =  " m-2 text-[24px] text-black font-bold" >Give your goal a name.</h1>
                <aside>
                   <p className='text-black text-sm border-b-2 border-b-red-700  p-2'> Create a goal you want you and others to complete. When submitted, 
                       a column should be generated on the assigned member's board.
                     </p>
                </aside>
                <div className = "flex flex-col m-0 p-2 h=[150px]">
                <textarea
                   required
                   value={columnName}
                   onChange={(e) => setColumnName(e.target.value)}
                   placeholder="Give your goal a name."
                   className = " m-0 h-[35px] absolute  border-red-500 border-1 rounded-md resize-none font-inter bg-grey-150 text-black"
                />
                 <div className="h-auto flex flex-row border-t-red-700">
                    <button 
                     onClick={()=> {colorChoice()}}
                    className="w-[40%] mt-[75px] font-inter font-semibold text-black m-4 p-2 
                                       text-md hover:bg-shadow hover:shadow-lg transition: background-color 0.5s">
                      <FontAwesomeIcon icon={faPaintBrush} className="text-[16px] mr-4" style={{ color: color}}/> {colorText}
                    </button>
                     
                 <button className = "p-0 m-0 cursor-pointer w-[40%] mt-[75px] font-inter font-semibold text-black m-4 p-2 text-md hover:bg-shadow hover:shadow-lg"
                           onClick={handleColumnCreation}
                          
                           >
                  <FontAwesomeIcon icon={faCheckSquare} className=" mr-4 hover:text-green-700" />Create</button>
                    </div>
                    </div>
              
                    {rendercolorPicker ? < HexColorPicker  color={color} onChange={setColor} className="z-[1000] bottom-5 absolute"/> : ""}
             </div>

       )

};




export default AssignTask;