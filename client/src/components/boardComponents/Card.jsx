import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import DropIndicator from "./DropIndicator";
import {motion} from "framer-motion"

const Card = ({ title, id, status,file,people,date, column, handleDragStart, onEdit, onDelete,onEditStatus }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingStatus,setIsEditingStatus] = useState(false)
  const [editTitle, setEditTitle] = useState(title);
  const [editStatus, setEditStatus] = useState(status);
  const [attachment,setAttachment] = useState(file); // Attached file

  const menuRef = useRef(null);



  const handleClickOutside = useCallback(
    (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuVisible(false);
      }
    },
    []
  );

  useEffect(() => {
    if (menuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible, handleClickOutside]);

  const handleSaveEdit = () => {
    if (editTitle.trim() !== "") {
      onEdit(id, editTitle);
      setIsEditing(false);
    }
  };

  const handleSaveStatus = () => {
    if(editStatus.trim() !== ""){
      onEditStatus(id, editStatus)
      setIsEditingStatus(false);
    }
  }

  return (
    <>
    <DropIndicator beforeId={id} column={column} />
    <motion.div
      layout
      layoutId={id}
      draggable="true"
      onDragStart={(e) => handleDragStart(e, { title, id, column })}
      className="rounded-lg p-2 m-2 px-3 shadow-lg bg-white active:cursor_grabbing max-w-full shadow-lg min-h-24 relative"
    >
      {/* Horizontal three-dot menu button, adjusted for extra spacing */}
      <button
        onClick={() => setMenuVisible((prev) => !prev)}
        className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-50"
        style={{ padding: "0", margin: "4px", transform: "translate(50%, -50%)" }}
      >
        &#x2026; {/* Horizontal ellipsis */}
      </button>
      <div className ="text-sm py-2">
      {isEditing ? (
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveEdit();
            }
          }}
          autoFocus
          className="w-full bg-neutral-100 text-neutral-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 "
        />
      ) : (
        
          <p className=" border-b-2 border-y-black font-medium font-inter">{title}</p>
        
       
        
      )}
      {
          isEditingStatus ? <input
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value)}
          onBlur={handleSaveStatus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveStatus();
            }
          }}
          autoFocus
          className="w-full bg-neutral-100 text-neutral-800 p-1 mt-5 rounded focus:outline-none focus:ring-2 focus:ring-red-500 "
        />
         : (<div className="text-md flex gap-4 justify-between mt-5 py-1 text-grey-800"> 
                <p>{status}</p> 
               
               { attachment !== undefined ? <a href={URL.createObjectURL(file)}  
                 download={file.name}> <FontAwesomeIcon icon={faPaperclip} 
                 className="scale-145 ml-[2.2em] mt-[1.0em] 
                    cursor-pointer transition: background-color 0.5s hover:text-red-500" 
                    onClick={console.log(attachment)} /> </a> : <section></section> }
          </div> )
      }
       
       </div>
      {/* Dropdown menu for Edit and Delete */}
      {menuVisible && (
        <div
          ref={menuRef}
          className="absolute top-6 right-2 z-10 rounded-md bg-white shadow-md p-1.5"
        >
          <ul className="list-none m-0 p-0 text-sm">
            <li
              onClick={() => {
                setIsEditing(true);
                setMenuVisible(false);
              }}
              className="cursor-pointer px-3 py-1 rounded hover:bg-violet-100 transition-colors"
            >
              ✏️ Edit Task
            </li>
            <li
              onClick={() => {
                onDelete(id);
                setMenuVisible(false);
              }}
              className="cursor-pointer px-3 py-1 rounded hover:bg-red-100 transition-colors"
            >
              🗑️ Delete
            </li>
            <li
              onClick={() => {
                setIsEditingStatus(true);
                setMenuVisible(false);
              }}
              className="cursor-pointer px-3 py-1 rounded hover:bg-teal-100 transition-colors"
            >
              🔧 Edit Task Status
            </li>
          </ul>
        </div>
      )}
    </motion.div>
    </>
  );
};

export default Card;