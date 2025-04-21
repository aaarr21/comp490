import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faPaperclip,
  faFaceSmile,
  faCalendar,
  faUserPlus,
  faPaintBrush,
  faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import "../components/styles/Tasks.css";
import Picker from "emoji-picker-react"; // for the emoji section
import DatePicker from "react-date-picker";
import { HexColorPicker } from "react-colorful";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import ToDo from "../components/TasksToDo";
import { Toaster, toast } from "sonner";

const AssignTask = ({ user }) => {
  const [Loggedin, setLoggedin] = useState(true); // state for logged in status
  const [shownewColumn, setnewColumn] = useState(false); // determines if NewColumn is visible
  const [deptMembers, setDeptMembers] = useState(null); // list of department members
  const [btnMsg, setBtnMsg] = useState("Set a New Goal.");

  const successNotify = (dialog) => {
    toast.success(dialog);
  };

  const failNotify = (dialog) => {
    toast.error(dialog);
  };

  useEffect(() => {
    const logginInCheck = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/status`,
        { credentials: "include" }
      );
      if (response.status === 401) console.log("Not logged in");
      else setLoggedin(true);
    };

    const getTheUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/get-all-members`,
          { withCredentials: true }
        );
        if (response.status === 500) failNotify(response.error);
        else {
          setDeptMembers(response.data);
          successNotify("Successfully acquired department members!");
        }
      } catch (error) {
        failNotify("Failed to get department members.");
      }
    };

    logginInCheck();
    getTheUsers();
  }, []);

  const createNewColumn = () => {
    setnewColumn(!shownewColumn);
    setBtnMsg(!shownewColumn ? "Cancel Goal" : "Create New Goal");
  };

  return (
    <div className="no-scroll">
      <div className="flex flex-col bg-slate-200 overflow-hidden h-full w-full margin-0">
        <div className="task-button-container">
          <button
            className="task-button text-black font-inter"
            aria-describedby="passNote"
            onClick={createNewColumn}
          >
            <FontAwesomeIcon
              icon={faCircleXmark}
              className="task-button-icon hover:animate-bounce"
            />{" "}
            {btnMsg}{" "}
          </button>
        </div>
        <ToDo />
        {Loggedin &&
          (shownewColumn ? (
            <NewColumn
              invertRender={setnewColumn}
              setBtnMsg={setBtnMsg}
              success={successNotify}
              fail={failNotify}
              user={user}
            />
          ) : (
            ""
          ))}
        <Toaster position="bottom-center" richColors />
      </div>
    </div>
  );
};

const NewColumn = ({ invertRender, setBtnMsg, success, fail, user }) => {
  const [columnName, setColumnName] = useState("");
  const [color, setColor] = useState("#aabbcc");
  const [colorText, setColorText] = useState("Choose Color");
  const [rendercolorPicker, setRenderColorPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleColumnCreation = async (e) => {
    e.preventDefault();
    if (!columnName.trim()) {
      fail("Please enter a name for the column");
      return;
    }
    if (isLoading) return; // Prevent duplicate submissions
    setIsLoading(true);

    // Compute the column slug from the entered name.
    const columnSlug = columnName.trim().toLowerCase().replace(/\s+/g, "_");
    // Force using user.id as the creator. Do not fall back to username.
    const loggedInUser = user?.id;
    if (!loggedInUser) {
      fail("User ID is missing; cannot create column.");
      setIsLoading(false);
      return;
    }
    const payload = {
      column: columnSlug, // This will be stored as columnAsg
      columnName: columnName.trim(), // Display title
      color,
      loggedInUser, // Use numeric user ID only
    };
    console.log("Payload:", payload);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/create-new-goal`,
        payload,
        { withCredentials: true }
      );
      toast.promise(Promise.resolve(response), {
        loading: "Sending goal to server...",
        success: () => {
          setBtnMsg("Create a New Goal");
          invertRender(false);
          setIsLoading(false);
          return "Successfully created Goal!";
        },
        error: "Error Occurred",
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating goal:", error.response || error);
      fail(
        "Error Occurred: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const colorChoice = () => {
    setRenderColorPicker(!rendercolorPicker);
    setColorText(!rendercolorPicker ? "Close Color" : "Choose Color");
  };

  return (
    <div className="relative rounded-md w-[350px] h-[300px] bg-white shadow-md font-inter gap-4 justify-between ml-5">
      <h1 className="m-2 text-[24px] text-black font-bold">
        Give your goal a name.
      </h1>
      <aside>
        <p className="text-black text-sm border-b-2 border-b-red-700 p-2">
          Create a goal you and others will work on. When submitted, a column
          will be generated on the assigned member's board.
        </p>
      </aside>
      <div className="flex flex-col m-0 p-2" style={{ height: "150px" }}>
        <textarea
          required
          value={columnName}
          onChange={(e) => setColumnName(e.target.value)}
          placeholder="Give your goal a name."
          className="m-0 h-[35px] absolute border-red-500 border rounded-md resize-none font-inter bg-grey-150 text-black"
        />
        <div className="h-auto flex flex-row border-t-red-700">
          <button
            onClick={colorChoice}
            className="w-[40%] mt-[75px] font-inter font-semibold text-black m-4 p-2 text-md hover:bg-shadow hover:shadow-lg transition duration-500"
          >
            <FontAwesomeIcon
              icon={faPaintBrush}
              className="text-[16px] mr-4"
              style={{ color: color }}
            />{" "}
            {colorText}
          </button>

          <button
            className="p-0 m-0 cursor-pointer w-[40%] mt-[75px] font-inter font-semibold text-black m-4 p-2 text-md hover:bg-shadow hover:shadow-lg"
            onClick={handleColumnCreation}
            disabled={isLoading}
          >
            <FontAwesomeIcon
              icon={faCheckSquare}
              className="mr-4 hover:text-green-700"
            />
            Create
          </button>
        </div>
      </div>

      {rendercolorPicker ? (
        <HexColorPicker
          color={color}
          onChange={setColor}
          className="z-[1000] absolute bottom-5"
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default AssignTask;
