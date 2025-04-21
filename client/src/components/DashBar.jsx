// Updates for DashBar.jsx - cleanup after debugging
import { useRBAC } from "../utils/rbacUtils";
import "../components/styles/DashBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faStar,
  faBox,
  faCog,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { RoleGuard } from "../utils/rbacUtils";

const DashBar = () => {
  return (
    <div
      className="siteNavigation font-inter"
      role="region"
      aria-label="navigation"
    >
      <nav className="nav">
        <ul id="menu" className="dashlistContainer">
          <li>
            {" "}
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/22632ec5cbf37201259d108df08d01db9d2ab3c3995715785844b13879de98f2?placeholderIfAbsent=true&apiKey=c4c7ee526ddf4189b90887ee1b75d310"
              className="dashlogo"
              alt="logo"
            />
          </li>
          <Link to="/workBoard">
            <li className="dashlistItem">
              <FontAwesomeIcon icon={faHouse} className="dashImage" />
              <div className="dash-text">
                <h2>Dashboard</h2>
              </div>
            </li>
          </Link>

          <Link to="/assigntask" className="dash-link">
            <li className="dashlistItem">
              <FontAwesomeIcon icon={faStar} className="dashImage" />
              <div className="dash-text">Create</div>
            </li>
          </Link>
          <Link to="/request">
            <li className="dashlistItem">
              <FontAwesomeIcon icon={faBox} className="dashImage" />
              <div className="dash-text">Request</div>
            </li>
          </Link>
          <Link to="/settings">
            <li className="dashlistItem">
              <FontAwesomeIcon icon={faCog} className="dashImage" />
              <div className="dash-test">Settings</div>
            </li>
          </Link>

          {/* Add RBAC Admin link for admins only */}
          <RoleGuard roles={["admin"]}>
            <Link to="/admin/rbac" className="dash-link">
              <li className="dashlistItem">
                <FontAwesomeIcon icon={faUserShield} className="dashImage" />
                <div className="dash-text">RBAC Admin</div>
              </li>
            </Link>
          </RoleGuard>
        </ul>
      </nav>
    </div>
  );
};

export default DashBar;
