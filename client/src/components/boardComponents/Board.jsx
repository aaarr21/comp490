import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from 'sonner';
import Column from './Column';

const Board = ({success,fail,members, columns,setColumns, loggedUser}) => {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [activeCardMenu, setActiveCardMenu] = useState(null); // Manage active card menu globally


  /* 
       column: column,
                     title: text,
                     date: taskDate,
                     creator: creator,
                     id: Math.random().toString(),
                     status: "STARTED",
                     file: files[0],
                     people: chosenMembers,
                     attachment: taskData.attachment,
  
  
  */
useEffect(()=> {
  const getTasks = async () => {
       toast.promise(axios.get(`${process.env.REACT_APP_API_URL}/auth/get-all-tasks`, 
                    {credentials : 'include'} ) , {
                     loading: 'Retriving Data...',
                     success: (response) =>{
                      setCards(response.data);
                         return "Retrived Goals!";
                     },
                     error: "Error occured during retrival.",
                 }); 
  
}
          getTasks();
},[])



  return (
   <div>
    <div className="flex h-full w-full gap-4  p-12">
      {columns.map((column) => <Column
         
         title={column.title}
         column={column.columnAsg}
         headingColor={column.color}
         creator= {column.creator}
         cards={cards}
         setCards={setCards}
         activeCardMenu={activeCardMenu}
         setActiveCardMenu={setActiveCardMenu}
         loggedUser={loggedUser}
        
         taskMembers ={members}
         success = {success}
         fail = {fail}
      />  
  )}
     
    </div>
    </div>
   ); 
  
};

const DEFAULT_CARDS = [
  // Backlog
  { title: "", id: "", column: "", status:""},
  
];

export default Board;