import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faXmark,
  faPaperclip,
  faFaceSmile,
  faCalendar,
  faUserPlus,
  faA,
} from "@fortawesome/free-solid-svg-icons";
import Picker from "emoji-picker-react";
import DatePicker from "react-date-picker";
import { Toaster, toast } from "sonner";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { useRBAC } from "../../utils/rbacUtils";

const NewTask = ({
  invertTask,
  taskStatus,
  taskSuccess,
  taskFail,
  members,
  setCards,
  column,
}) => {
  const { user } = useRBAC();

  useEffect(() => {
    console.log("Task members prop:", members);
  }, [members]);

  const closeTask = () => {
    invertTask(!taskStatus);
  };

  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const formRef = useRef(null);
  const membersRef = useRef(null);
  const [chosenMembers, setChosenMembers] = useState([]);
  const [displayfile, setDisplayFile] = useState(false);
  const [displayEmoji, setEmoji] = useState(false);
  const [displayMembers, setDisplayMembers] = useState(false);
  const [displayChosen, setDisplayChosen] = useState(false);
  const [displayDate, setDisplayDate] = useState(false);
  const [taskDate, setTaskDate] = useState(null);
  const textRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files) {
      try {
        if (event.target.files[0].size <= 104857600) {
          setFiles(Array.from(event.target.files));
          setDisplayFile(true);
        } else {
          taskFail("File size exceeds limit.");
        }
      } catch (error) {}
    }
  };

  const renderEmoji = (event) => {
    event.preventDefault();
    setEmoji(!displayEmoji);
  };

  const renderDate = (event) => {
    event.preventDefault();
    setDisplayDate(!displayDate);
  };

  const appendEmoji = (emojiObject) => {
    textRef.current.value += emojiObject.emoji;
    setEmoji(!displayEmoji);
  };

  const appendDate = (date) => {
    // Format the date as YYYY-MM-DD, adjust if needed
    const formattedDate = new Date(date).toISOString().split("T")[0];
    setTaskDate(formattedDate);
    taskSuccess("Date Chosen: " + formattedDate);
    setDisplayDate(false);
  };

  const renderMembers = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("Available members:", members);
    setDisplayMembers(!displayMembers);
  };

  const handleClickOutside = (e) => {
    if (
      formRef.current &&
      !formRef.current.contains(e.target) &&
      !(membersRef.current && membersRef.current.contains(e.target))
    ) {
      invertTask(!taskStatus);
    }
  };

  useEffect(() => {
    if (taskStatus) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [taskStatus]);

  const handleTaskupload = async (e) => {
    e.preventDefault();
    if (taskDate == null || chosenMembers.length === 0) {
      taskFail("One or more empty fields for task, please fix them.");
      return;
    }

    const TaskForm = e.target;
    const taskData = new FormData(TaskForm);

    // Append task data
    taskData.append("date", taskDate);
    // "assigned" field is now a comma-separated string
    taskData.append("assigned", chosenMembers.join(","));
    taskData.append("column", column);
    // Explicitly set the status to "IN PROGRESS"
    taskData.append("status", "IN PROGRESS");
    taskData.append("creator", user?.id || user?.username);

    files.forEach((file) => taskData.append("attachment", file, file.name));

    try {
      taskSuccess("Creating task...");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/create-new-task`,
        taskData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      console.log("Response data:", response.data);
      const { newTask } = response.data;
      if (newTask && newTask.id) {
        setCards((prev) => [...prev, { ...newTask, columnId: column }]);
        invertTask(false);
        taskSuccess("Task created successfully");
      } else {
        const newTaskId = Math.random().toString();
        const newTaskObj = {
          id: newTaskId,
          title: text,
          status: "IN PROGRESS",
          assigned: chosenMembers.join(", "),
          date: taskDate,
          columnId: column,
          creator: user?.id || user?.username,
        };
        setCards((prev) => [...prev, newTaskObj]);
        invertTask(false);
        taskSuccess("Task created successfully");
      }
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error);
      taskFail(error.response?.data?.message || "Failed to create task");
    }
  };

  const deleteAttachment = (fileId) => {
    setFiles((prev) => prev.filter((file, index) => index !== fileId));
  };

  const deletePeople = (memberId) => {
    setChosenMembers((prev) => prev.filter((_, index) => index !== memberId));
  };

  return (
    <div className="absolute flex w-[450px] h-[525px] max-h-[525px] flex-col ml-[0.5em] border font-inter rounded-md inset-y-0 left-0 text-[18px] bg-white m-auto left-1/3 right-1/3 z-[9999]">
      <div className="w-full text-[24px] font-bold h-[15%] flex flex-row">
        <h2 className="w-[50%] ml-[0.5em] mt-[0.5em]">Create New Task</h2>
        <button
          className="float-right mb-[5%] ml-[40%] hover:scale-115"
          onClick={closeTask}
        >
          <FontAwesomeIcon
            icon={faXmark}
            className="scale-100 text-grey-500 hover:text-red-700"
          />
        </button>
      </div>
      <div className="w-full h-[10%] flex flex-row text-[18ox] ml-[1.0em]">
        <label>For:</label>{" "}
        <span id="attach">
          {displayChosen &&
            chosenMembers.map((member, index) => (
              <MemberInfo
                key={index}
                memberId={index}
                memberName={member}
                deletePeople={deletePeople}
              />
            ))}
        </span>
      </div>
      <form
        className="h-[80%] w-full flex flex-col justify-center ml-[0em] mt-[3.5em]"
        ref={formRef}
        onSubmit={handleTaskupload}
        encType="multipart/form-data"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          className="scale-100 w-[95%] h-[40%] ml-[0.68em] border-solid border-3 border-cyan-600 rounded-md mt-[-9.0] p-0"
          placeholder="Give the task a name!"
          id="textArea"
          ref={textRef}
          required
          name="textPart"
        />
        <div className="w-full h-[20%] flex flex-row">
          <button
            type="button"
            onClick={renderEmoji}
            id="emoji-picker"
            style={{ display: "none" }}
          >
            {" "}
          </button>
          <div className="absolute top-1 left-1 z-[1000]">
            {displayEmoji && <Picker onEmojiClick={appendEmoji} />}
          </div>
          <label htmlFor="emoji-picker">
            <FontAwesomeIcon
              icon={faFaceSmile}
              className="scale-145 ml-[2.2em] mt-[1.0em] cursor-pointer transition: background-color 0.5s hover:text-red-500"
            />
          </label>
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
            id="attachment-upload"
            accept=".pdf,.xml,.docx"
          />
          <label htmlFor="attachment-upload">
            <FontAwesomeIcon
              icon={faPaperclip}
              className="scale-145 ml-[2.2em] mt-[1.0em] cursor-pointer transition: background-color 0.5s hover:text-red-500"
            />
          </label>
          <button
            type="button"
            onClick={renderDate}
            id="date-picker"
            style={{ display: "none" }}
          >
            {" "}
          </button>
          <label htmlFor="date-picker">
            <FontAwesomeIcon
              icon={faCalendar}
              className="scale-145 ml-[2.2em] mt-[1.0em] cursor-pointer transition: background-color 0.5s hover:text-red-500"
            />
          </label>
          <div className="absolute left-[325px] bottom-[240px] bg-white rounded-md z-[1000]">
            {displayDate && (
              <DatePicker selected={taskDate} onChange={appendDate} />
            )}
          </div>
          <button
            type="button"
            onClick={renderMembers}
            id="member-picker"
            style={{ display: "none" }}
          >
            {" "}
          </button>
          <label htmlFor="member-picker" className="ml-[50%]">
            <FontAwesomeIcon
              icon={faUserPlus}
              className="scale-145 text-grey-400 cursor-pointer mt-[0.7em]"
            />
          </label>
        </div>
        <div>
          <div className="w-full h-[15%] text-[12px] flex m-0 flex-row">
            <label>Attachments:</label>{" "}
            <span id="attach">
              {displayfile &&
                files.map((file, index) => (
                  <FileInfo
                    key={index}
                    id={index}
                    fileName={file.name}
                    deleteAttachment={deleteAttachment}
                  />
                ))}
            </span>
          </div>
        </div>
        <div className="w-full h-[50px] flex justify-center">
          <button
            type="submit"
            className="w-[75%] mt-[1.0em] h-full font-bold mt-[2.5em] bg-cyan-500 text-center text-[18px] text-white rounded-md transition delay-150 hover:bg-indigo-500"
          >
            Create Task
          </button>
        </div>
      </form>
      <div
        ref={membersRef}
        className="absolute z-[10000] left-[500px] bottom-[100px]"
      >
        {displayMembers && (
          <MemberChecklist
            deptMemberList={members || []}
            close={renderMembers}
            setChosenMembers={setChosenMembers}
            chosen={chosenMembers}
            displayChosen={setDisplayChosen}
          />
        )}
      </div>
    </div>
  );
};

const FileInfo = ({ id, fileName, deleteAttachment }) => {
  return (
    <div className="h-full text-[8px] font-bold ml-[2.0em] bg-red-700 text-white rounded-md justify-center inline-block p-[12px] min-w-[25%] min-h-[50%] m-0 p-0">
      {fileName}{" "}
      <button onClick={() => deleteAttachment(id)} type="button">
        <FontAwesomeIcon icon={faXmark} className="close" />
      </button>
    </div>
  );
};

const MemberInfo = ({ memberId, memberName, deletePeople }) => {
  return (
    <div className="h-full text-[12px] ml-[2.0em] bg-red-700 justify-center inline-block p-[12px] text-white">
      {memberName}{" "}
      <button onClick={() => deletePeople(memberId)} type="button">
        <FontAwesomeIcon icon={faXmark} className="close" />
      </button>
    </div>
  );
};

const MemberChecklist = ({
  deptMemberList = [],
  close,
  setChosenMembers,
  displayChosen,
  chosen,
}) => {
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    console.log("Department Members List:", deptMemberList);
  }, [deptMemberList]);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedItems((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Selected members:", selectedItems);
    if (Array.isArray(chosen) && chosen.length > 0) {
      const combinedList = [...chosen, ...selectedItems];
      setChosenMembers([...new Set(combinedList)]);
    } else {
      setChosenMembers(selectedItems);
    }
    displayChosen(true);
    close();
  };

  const defaultMembers = [
    { id: 1, username: "admin" },
    { id: 2, username: "user1" },
    { id: 3, username: "user2" },
  ];

  const membersToDisplay =
    Array.isArray(deptMemberList) && deptMemberList.length > 0
      ? deptMemberList
      : defaultMembers;
  const filteredMembers = membersToDisplay.filter((member) => {
    const username = member.username || "";
    const email = member.email || "";
    return (
      username.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div
      className="border-solid border-2 border-gray-300 rounded-md w-[300px] max-h-[350px] flex flex-col bg-white shadow-lg z-[10000]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 border-b border-gray-200 bg-gray-50">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
          ref={searchInputRef}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <form className="overflow-auto flex-grow" onSubmit={handleSubmit}>
        {filteredMembers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredMembers.map((member, index) => {
              const value = member.username || member.email || `user${index}`;
              return (
                <li
                  className="py-2 px-3 hover:bg-gray-100"
                  key={index}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`member-${index}`}
                      name="members"
                      value={value}
                      className="h-4 w-4 mr-2"
                      onChange={handleCheckboxChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      htmlFor={`member-${index}`}
                      className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const checkbox = document.getElementById(
                          `member-${index}`
                        );
                        if (checkbox) {
                          checkbox.checked = !checkbox.checked;
                          checkbox.dispatchEvent(
                            new Event("change", { bubbles: true })
                          );
                        }
                      }}
                    >
                      {value}
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {search ? "No users match your search" : "No users available"}
          </div>
        )}
        <div className="flex border-t border-gray-200">
          <button
            type="button"
            className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close();
            }}
          >
            Close
          </button>
          <button
            type="submit"
            className="w-1/2 py-2 bg-green-600 hover:bg-green-700 text-white font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Accept
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTask;
