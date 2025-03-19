import { Link } from "react-router-dom";

const Navibar = () => {
    
    return (
        <div className="navibar">
           <span className="nav-logo font-lilita pd-2 text-red-800 p-5 text-2xl font-extrabold"> Workflowban</span>
           <ul className ="list">
            
            <li className = "listItem"> LOGOUT </li>
            <li className = "listItem">  </li>
           </ul>
        </div>
    );
};

export default Navibar