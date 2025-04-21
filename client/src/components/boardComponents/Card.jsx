// Card.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useRBAC } from "../../utils/rbacUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faEdit,
  faTrash,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const Card = ({
  id,
  title,
  status,
  columnId,
  creator,
  assigned,
  date,
  handleDragStart,
  onEdit,
  onDelete,
  onEditStatus,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editStatus, setEditStatus] = useState(status);
  const menuRef = useRef(null);
  const { hasPermission, hasRole, user } = useRBAC();

  // Permission checks using our RBAC context (the RBACProvider now handles trimming and case below)
  const canUpdateTask = hasPermission("task.update");
  const canUpdateAnyTask = hasPermission("task.update.any");
  const canDeleteTask = hasPermission("task.delete");
  const canDeleteAnyTask = hasPermission("task.delete.any");
  const isAdmin = hasRole("admin");

  // Compare creator and user.id as strings
  const isCreator =
    String(creator).trim() === String(user?.id).trim() ||
    creator === user?.username;

  const canEditThisTask =
    isAdmin || canUpdateAnyTask || (canUpdateTask && isCreator);

  const canDeleteThisTask =
    isAdmin || canDeleteAnyTask || (canDeleteTask && isCreator);

  const canDragTask = hasPermission("task.move");

  const handleClickOutside = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuVisible(false);
    }
  }, []);

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
    if (editTitle.trim() !== "" && canEditThisTask) {
      onEdit(id, editTitle);
      setIsEditing(false);
    }
  };

  const handleSaveStatus = () => {
    if (editStatus.trim() !== "" && canEditThisTask) {
      onEditStatus(id, editStatus);
      setIsEditingStatus(false);
    }
  };

  // Format date for display
  const formattedDate = date ? new Date(date).toLocaleDateString() : null;

  // Format assigned users for display
  const assignedDisplay = assigned || "Unassigned";

  return (
    <div
      draggable={canDragTask}
      onDragStart={(e) =>
        canDragTask && handleDragStart(e, { title, id, columnId })
      }
      className="rounded-lg p-2 m-2 px-3 shadow-lg bg-white active:cursor_grabbing max-w-full min-h-24 relative"
    >
      {/* Only show menu toggle if user can edit or delete */}
      {(canEditThisTask || canDeleteThisTask) && (
        <button
          onClick={() => setMenuVisible((prev) => !prev)}
          className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-50"
          style={{
            padding: "0",
            margin: "4px",
            transform: "translate(50%, -50%)",
          }}
        >
          &#x2026; {/* Horizontal ellipsis */}
        </button>
      )}

      <div className="text-sm py-2">
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
            className="w-full bg-neutral-100 text-neutral-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
            disabled={!canEditThisTask}
          />
        ) : (
          <p className="border-b-2 border-y-black font-medium font-inter">
            {title}
          </p>
        )}

        {isEditingStatus ? (
          <input
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
            className="w-full bg-neutral-100 text-neutral-800 p-1 mt-5 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={!canEditThisTask}
          />
        ) : (
          <div className="text-md flex gap-4 justify-between mt-5 py-1 text-grey-800">
            <p>{status}</p>
          </div>
        )}

        {/* Display assigned users */}
        <div className="text-xs text-gray-500 mt-2">
          Assigned: {assignedDisplay}
        </div>

        {/* Display due date if available */}
        {formattedDate && (
          <div className="text-xs text-gray-500">Due: {formattedDate}</div>
        )}
      </div>

      {/* Dropdown menu for Edit and Delete */}
      {menuVisible && (
        <div
          ref={menuRef}
          className="absolute top-6 right-2 z-10 rounded-md bg-white shadow-md p-1.5"
        >
          <ul className="list-none m-0 p-0 text-sm">
            {canEditThisTask && (
              <>
                <li
                  onClick={() => {
                    setIsEditing(true);
                    setMenuVisible(false);
                  }}
                  className="cursor-pointer px-3 py-1 rounded hover:bg-violet-100 transition-colors"
                >
                  Edit Task
                </li>
                <li
                  onClick={() => {
                    setIsEditingStatus(true);
                    setMenuVisible(false);
                  }}
                  className="cursor-pointer px-3 py-1 rounded hover:bg-teal-100 transition-colors"
                >
                  Edit Status
                </li>
              </>
            )}

            {canDeleteThisTask && (
              <li
                onClick={() => {
                  onDelete(id);
                  setMenuVisible(false);
                }}
                className="cursor-pointer px-3 py-1 rounded hover:bg-red-100 transition-colors"
              >
                Delete
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Card;
