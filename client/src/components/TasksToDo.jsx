import '../components/styles/todo.css'
const ToDo = () => {
   
    return (
         
       <div className='toDo-container'>
             <h2> TO DO</h2>
             <div className="task-headers">
              <span className="toDolabels">
               <label> Status</label>
               <label htmlFor='owner'> Owner</label>
               </span>
             </div> 

             <div className="todo-body">
             <div className="progress-column">

             </div>
             <div className ="status-column">
  
             </div>
             <div className = "owner-column" id="owner">
                  <label> Sebastian</label>
                  <label> Bryan </label>
                  <label> Alyssa</label>
             </div>

             </div>
       </div>
    )
}


export default ToDo;