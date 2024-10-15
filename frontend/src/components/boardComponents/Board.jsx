import {useState, useEffect} from "react";
import Column from './Column';
import axios from "axios";


const Board = () => {
   const [cards , setCards] = useState([]); 
   const [hasChecked, sethasChecked] = useState(false);

    useEffect( () => {
        hasChecked && localStorage.setItem("cards", JSON.stringify(cards));
    }, [cards]);

    useEffect( () => {
        //const response =  axios.get('/WorkBoard');
       // console.log(response);
      const cardData = localStorage.getItem("cards");
      setCards( cardData ? JSON.parse(cardData) : DEFAULT_CARDS);

      sethasChecked(true);
    }, []);

   return (<div className ="flex h-full w-full gap-3 overflow-scroll p-12">
     
     <Column         
     title="Backlog"                  //Backlog column, for all tasks to be done in some random time
     column="backlog"                 //designator on what column type it is
     headingColor="text-neutral-500"
     cards={cards}                    // card objects within said column
     setCards={setCards}
     />
     <Column                        // Todo column, current tasks that aren't being worked on.
     title="TBD"
     column="TBD"
     headingColor="text-yellow-200"
     cards={cards}
     setCards={setCards}
     />
     <Column 
     title="In Progress"                // Active column, tasks that are currently being done.
     column="active"
     headingColor="text-blue-200"
     cards={cards}
     setCards={setCards}
     />
      <Column 
     title="Done"
     column="done"
     headingColor="text-emerald-500"
     cards={cards}
     setCards={setCards}
     />
   </div>
    

   );

};


const DEFAULT_CARDS = [
    //Back-log
    {title : "Rework our routing", id: "1", column: "backlog"},
    {title : "Revamp our login screen", id :"2" , column: "backlog"},
    {title : "consider passport-local for non-google login ", id: "3", column: "backlog"},
    //TODO
    {
        title: "Draft user schema",
        id: "5",
        column: "todo"
    },

    {title: "Lorem Ipsum", id: "6", column: "TBD"},
    {title: "Get Vons Chocolate Chip cookies 36 pack", id: "7", column: "TBD"},
    {title: "Enrollment Unit form", id: "8", column: "TBD"},

    //Doing
    {title: "Visit Bookstore" , id: "9", column: "active"},
    {title: "study for comp333 exam", id: "10", column: "active"},

    //Done
    {title: "call for academic advisement", id: "11", column: "done"},
    {title: "Cancel subscription", id: "12", column:"done"}

]


export default Board;