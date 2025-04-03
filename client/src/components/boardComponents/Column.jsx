import { useState, useRef, useEffect } from "react";
import Card from './Card';
import DropIndicator from "./DropIndicator";
import NewTask from './newTask';

const Column = ({ title, headingColor, column, cards, setCards, activeCardMenu, setActiveCardMenu,taskMembers, success,fail }) => {
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
    
    const cardId = e.dataTransfer.getData("cardId"); //get the card t
    setActive(false);
    clearHighlight();
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];
      let cardToMove = copy.find((c) => c.id === cardId);
      if (!cardToMove) return;

      cardToMove = { ...cardToMove, column };
      copy = copy.filter((c) => c.id !== cardId);

      const moveBack = before === "-1";

      if (moveBack) {
        copy.push(cardToMove);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
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

  const handleDeleteCard = (cardId) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const filteredCards = cards.filter((c) => c.column === column);
  
  return (
    <div className="w-56 shrink-0 bg-zinc-300 rounded-lg shadow-lg" >
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium font-title ${headingColor} ml-2`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400 mr-1">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDragEnd}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => (
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
        ))}
        <DropIndicator beforeId={null} column={column} />
        {/* AddCard Component was missing */}
        <AddCard column={column} setCards={setCards} success={success} failure={fail} members={taskMembers} />
      </div>
    </div>
  );
};

// Define AddCard component
const AddCard = ({ column, setCards, success,failure, members}) => {  
  const [text, setText] = useState("");
  const [status,setStatus] = useState("");
  const [adding, setAdding] = useState(false);
  const formRef = useRef(null);

  
  return (
    <>
      {adding ? (
        <NewTask invertTask={setAdding} taskStatus={adding} taskSuccess={success} taskFail={failure} members={members} 
          setCards={setCards} column = {column} 
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