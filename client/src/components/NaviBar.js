import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const Navibar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Show success message
        toast.success("Logged out successfully");

        // Navigate to login page
        navigate("/login");
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    }
  };

  return (
    <div className="navibar">
      <span className="font-lilita pd-2 text-red-800 p-4 text-2xl font-extrabold inline-block">
        Workflowban
      </span>
      <ul className="list">
        <li
          className="listItem cursor-pointer hover:text-red-600 transition-colors"
          onClick={handleLogout}
        >
          LOGOUT
        </li>
        <li className="listItem"></li>
      </ul>
    </div>
  );
};

export default Navibar;
