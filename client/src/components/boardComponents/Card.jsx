import { useState, useEffect, useCallback } from "react";

const Card = ({ title, id, column, handleDragStart, onEdit, onDelete, setActiveCardMenu, activeCardMenu }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  // Handle right-click event
  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.pageX, y: e.pageY });
    setMenuVisible(true);
    setActiveCardMenu(id);
  };

  // Handle click outside to close the menu
  const handleClickOutside = useCallback(
    (e) => {
      if (menuVisible && !e.target.closest(".context-menu")) {
        setMenuVisible(false);
        setActiveCardMenu(null);
      }
    },
    [menuVisible, setActiveCardMenu]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  // Close menu if another card's context menu is opened
  useEffect(() => {
    if (activeCardMenu !== id) {
      setMenuVisible(false);
    }
  }, [activeCardMenu, id]);

  // Handle edit action
  const handleEdit = () => {
    setIsEditing(true);
    setMenuVisible(false);
  };

  // Handle save action
  const handleSaveEdit = () => {
    if (editTitle.trim() !== "") {
      onEdit(id, editTitle);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        onContextMenu={handleContextMenu}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
      >
        {isEditing ? (
          <textarea
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent new line on enter
                handleSaveEdit();
              }
            }}
            autoFocus
            className="w-full bg-neutral-800 text-neutral-100 p-1 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        ) : (
          <p
            className="text-sm text-neutral-100 break-words"
            style={{
              maxWidth: "100%",
              wordWrap: "break-word",
            }}
          >
            {title}
          </p>
        )}
      </div>

      {/* Custom Context Menu */}
      {menuVisible && (
        <div
          className="context-menu rounded-md bg-white shadow-md p-1.5"
          style={{
            top: menuPosition.y,
            left: menuPosition.x,
            position: "absolute",
            zIndex: 1000,
          }}
        >
          <ul className="list-none m-0 p-0 text-sm">
            <li
              onClick={handleEdit}
              className="cursor-pointer px-3 py-1 rounded hover:bg-violet-100 transition-colors"
            >
              ✏️ Edit
            </li>
            <li
              onClick={() => {
                onDelete(id);
                setMenuVisible(false);
                setActiveCardMenu(null);
              }}
              className="cursor-pointer px-3 py-1 rounded hover:bg-red-100 transition-colors"
            >
              🗑️ Delete
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Card;
