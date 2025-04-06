import { useState, useRef, useEffect } from "react";
import Card from './Card';
import axios from 'axios';
import DropIndicator from "./DropIndicator";
import NewTask from './newTask';

const Column = ({ title, column, headingColor, creator, cards, setCards, activeCardMenu, loggedUser, 
  setActiveCardMenu,taskMembers, success,fail}) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

    

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true); //Set to the current column area
    highlightIndicator(e);
    
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const clearHighlight = (els) => {
    const indicators = els || getIndicators();
 
    indicators.forEach((i) => { //Get every indicator
      i.style.opacity = "0";  // make the indicator invisible
    });
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    
    clearHighlight(indicators);
    const el = getNearestIndicator(e, indicators);
    
      el.element.style.opacity = "1";
    
  };

  const handleDragLeave = (e) => { 
    setActive(false);
    clearHighlight();
  };

  const handleDragEnd = (e) => { //Handle end of the drag event
    const cardId = e.dataTransfer.getData("cardId"); //get the card 
    
     
    setActive(false);
    clearHighlight();
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    
    const before = element.dataset.before || "-1";
     
    if ( parseInt(before) !== parseInt(cardId) ) {
      let copy = [...cards];
     
      let cardToMove = copy.find((c) => c.id === parseInt(cardId) ); //why does this do nothing?
    
      if (!cardToMove) 
            return;
      let columnId = column;
      cardToMove = { ...cardToMove, columnId };
      copy = copy.filter((c) => c.id !== parseInt(cardId) );

      const moveBack = parseInt(before) === -1;

        if(moveBack) {
        copy.push(cardToMove);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === parseInt(before) );
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToMove);
      }

      setCards(copy);
    }
  };

  const handleEditCard = (cardId, newTitle) => {
    if (newTitle) {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, title: newTitle } : card
        )
      );
    }
  };

  const handleEditStatus = (cardId, newStatus) =>{
    if(newStatus) {
      setCards((prevCards)=> prevCards.map((card)=>
        card.id === cardId ? {...card,status: newStatus} : card
      ));
    }
  }

  const handleDeleteCard = async (cardId, taskCreator) => {
    
     if(loggedUser !== taskCreator){
        fail("Not the Creator of the task, please notify the task creator.");
        return;
     }
     try{
     const response = await axios.delete(`${process.env.REACT_APP_API_URL}/auth/delete-task`,
      {
        params: {cardId},
        credentials: 'include'
      }
     );
     if(response.status === 201){
        setCards((prevCards) => prevCards.filter((card) => card.id !== cardId)); //filter 
        success("Task removed!");
     }
     else{
        fail("Failed to delete task.");
     }
    } catch(error) {
        fail("Internal Server Error: Code: " + error.response.status);
    }
  };

  const filteredCards = cards.filter((c) => c.columnId === column);
  
  return (
    <div className="w-56 shrink-0 bg-zinc-300 rounded-lg shadow-lg h-[500px] " >
      <div className="mb-3 flex items-center justify-between px-2">
        <h3 className={`font-medium font-title ml-2` } style={{ color: headingColor}}>{title}</h3>
        <span className="rounded text-sm text-neutral-400 mr-1">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDragEnd}
        className={`h-full w-full transition-colors flex flex-col overflow-y-auto ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        } `}
      >
         
        {filteredCards.map((c) => 
           
          (
           
          <Card
            key={c.id}
            {...c}
            handleDragStart={handleDragStart}
            onEdit={handleEditCard}
            onEditStatus={handleEditStatus}
            onDelete={handleDeleteCard}
            activeCardMenu={activeCardMenu}
            setActiveCardMenu={setActiveCardMenu}
          /> 
        ) )}
        <DropIndicator beforeId={null} column={column} />
        {/* AddCard Component was missing */}
        
        <AddCard column={column} setCards={setCards} success={success} failure={fail} members={taskMembers} creator={loggedUser} />
        
        </div>
      
    </div>
  );
};

// Define AddCard component
const AddCard = ({ column, setCards, success,failure, members,creator}) => {  
  const [text, setText] = useState("");
  const [status,setStatus] = useState("");
  const [adding, setAdding] = useState(false);
  const formRef = useRef(null);

  
  return (
    <>
      {adding ? (
        <NewTask invertTask={setAdding} taskStatus={adding} taskSuccess={success} taskFail={failure} members={members} 
          setCards={setCards} column = {column} creator={creator}
        /> /* Satan*/
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-700 transition-colors hover:text-blue-500"
        >
          <span>Add new task</span>
        </button>
      )}
    </>
  );
};



export default Column;