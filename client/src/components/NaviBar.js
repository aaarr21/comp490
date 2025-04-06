import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Navibar = () => {
    
      const navigate = useNavigate();

      const handleLogout = async () =>{
         try{
            await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, {}, {withCredentials: true});
             
         } catch (error){
            
         }
      }
    



    return (
        <div className="navibar">
           <span className=" font-lilita pd-2 text-red-800  p-4 text-2xl font-extrabold inline-block"> Workflowban</span>
           <ul className ="list">
            
            <li className = "listItem" onClick=""> 
                <button onClick={handleLogout} className="text-red-600 hover:text-red-800 rounded-md">
                    LOGOUT
                </button>
                
                 </li>
            <li className = "listItem">  </li>
           </ul>
        </div>
    );
};

export default Navibar