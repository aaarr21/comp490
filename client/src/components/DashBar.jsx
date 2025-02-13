import '../components/styles/DashBar.css'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faBox } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
const DashBar = () =>{
    //Goal of this is to act as the naviagtion between the pages.
    console.log("this doesn't render");
    return(
      <div className="siteNavigation" role="region" aria-label="navigation">
          
          <ul id="menu" className="dashlistContainer">
          <li className="dashlistItem">
             <FontAwesomeIcon icon= {faHouse} className="dashlistImage"/> 
            <p>Dashboard</p>
            </li>
          <li className="dashlistItem"><FontAwesomeIcon icon= {faStar}className="dashlistImage"/>  <p>Task</p></li>
         <li className="dashlistItem"> <FontAwesomeIcon icon= {faBox}className="dashlistImage"/>Request</li>
          <li className="dashlistItem"> <FontAwesomeIcon icon= {faCog}className="dashlistImage"/>Settings</li>
          </ul>
          
        
      </div>
    );
};


export default DashBar;