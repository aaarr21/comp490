import { useState } from "react";
import Column from './Column';

const Board = ({success,fail,members}) => {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [activeCardMenu, setActiveCardMenu] = useState(null); // Manage active card menu globally
  
  const testList = [{
    title: "CAIN",
    column: "CAIN",
    headingColor: "text-neutral-500"   
}, {
    title: "UNDER/HEAVEN",
    column: "UNDER/HEAVEN",
    headingColor:"text-red-800"
}
 ]


  const [columns,setColumns] = useState(testList)
   


  return (
   
    <div className="flex h-full w-full gap-3  p-12">
      {columns.map((column) => <Column
         title={column.title}
         column={column.column}
         headingColor={column.headingColor}
         cards={cards}
         setCards={setCards}
         activeCardMenu={activeCardMenu}
         setActiveCardMenu={setActiveCardMenu}
         taskMembers ={members}
         success = {success}
         fail = {fail}
      />  
  )}
     
    </div>
  );
};

const DEFAULT_CARDS = [
  // Backlog
  { title: "", id: "", column: "", status:""},
  
];

export default Board;