import { useState, useEffect, useCallback, useRef } from "react";

const Card = ({ title, id, column, handleDragStart, onEdit, onDelete }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
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

  return (
    <div
      draggable="true"
      onDragStart={(e) => handleDragStart(e, { title, id, column })}
      className="relative cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
    >
      {/* Horizontal three-dot menu button, adjusted for extra spacing */}
      <button
        onClick={() => setMenuVisible((prev) => !prev)}
        className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-50"
        style={{ padding: "0", margin: "4px", transform: "translate(50%, -50%)" }}
      >
        &#x2026; {/* Horizontal ellipsis */}
      </button>

      {isEditing ? (
        <textarea
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
          className="w-full bg-neutral-800 text-neutral-100 p-1 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      ) : (
        <p className="text-sm text-neutral-100 break-words">{title}</p>
      )}

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
              ✏️ Edit
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
          </ul>
        </div>
      )}
    </div>
  );
};

export default Card;
