import '../components/styles/DashBar.css'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faBox } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
const DashBar = () =>{
    //Goal of this is to act as the naviagtion between the pages.
    
    return(
      <div className="siteNavigation" role="region" aria-label="navigation">
          <nav className="nav">
          <ul id="menu" className="dashlistContainer">
          <li > <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/22632ec5cbf37201259d108df08d01db9d2ab3c3995715785844b13879de98f2?placeholderIfAbsent=true&apiKey=c4c7ee526ddf4189b90887ee1b75d310"
                className="dashlogo"
                alt="logo"
              /></li>
          <li className="dashlistItem">
          <Link to="/workBoard">
         <FontAwesomeIcon icon= {faHouse} className="dashImage"/> 
            <div className="dash-test">Dashboard</div>
           </Link>
            </li>
          <li className="dashlistItem">
            <Link to="/task">
              <FontAwesomeIcon icon= {faStar}className="dashImage"/>Task
              </Link>
          </li>
         <li className="dashlistItem"> 
         <Link to="/request">
          <FontAwesomeIcon icon={faBox}className="dashImage"/><div className="dash-text">Request</div>
          </Link>
          </li>
          
          <li className="dashlistItem"> 
          <Link to="/request">
            <FontAwesomeIcon icon= {faCog}className="dashImage"/><div className="dash-test">Settings</div>
          </Link>
          </li>
          </ul>
          </nav>
        
      </div>
    );
};


export default DashBar;