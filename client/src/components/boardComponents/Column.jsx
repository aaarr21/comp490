import { useState, useRef, useEffect } from "react";
import Card from "./Card";
import DropIndicator from "./DropIndicator";
import NewTask from "./newTask";
import { useRBAC } from "../../utils/rbacUtils";
import axios from "axios";

const Column = ({
  title,
  headingColor,
  column,
  cards,
  setCards,
  activeCardMenu,
  setActiveCardMenu,
  taskMembers,
  success,
  fail,
  canCreateTask,
  onDragTask,
  onColumnDeleted,
}) => {
  const [active, setActive] = useState(false);
  const { hasPermission } = useRBAC();

  // Permission checks
  const canMoveTask = hasPermission("task.move");
  const canDeleteColumn = hasPermission("board.delete");

  // Drag handlers
  const handleDragStart = (e, card) => {
    if (!canMoveTask) return;
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!canMoveTask) return;
    setActive(true);
    highlightIndicator(e);
  };

  // Use querySelectorAll on a per-column basis for the drop indicators.
  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const clearHighlight = (els) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;
    return indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    if (!indicators.length) return;
    clearHighlight(indicators);
    const { element } = getNearestIndicator(e, indicators);
    if (element) {
      element.style.opacity = "1";
    }
  };

  const handleDragLeave = () => {
    setActive(false);
    clearHighlight();
  };

  const handleDragEnd = async (e) => {
    setActive(false);
    clearHighlight();
    if (!canMoveTask) return;

    const cardId = e.dataTransfer.getData("cardId");
    if (cardId) {
      try {
        await onDragTask(cardId, column);
      } catch (err) {
        console.error("Error moving task:", err);
      }
    }
  };

  // Card edit/update handlers (unchanged)
  const handleEditCard = async (cardId, newTitle) => {
    if (!newTitle) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/update-title`,
        { cardId, newTitle },
        { withCredentials: true }
      );
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, title: newTitle } : card
        )
      );
      success("Task title updated");
    } catch (err) {
      fail(err.response?.data?.message || "Failed to update task title");
      console.error("Error updating task title:", err);
    }
  };

  const handleEditStatus = async (cardId, newStatus) => {
    if (!newStatus) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/update-status`,
        { cardId, newStatus },
        { withCredentials: true }
      );
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, status: newStatus } : card
        )
      );
      success("Task status updated");
    } catch (err) {
      fail(err.response?.data?.message || "Failed to update task status");
      console.error("Error updating task status:", err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/delete-task`, {
        params: { cardId },
        withCredentials: true,
      });
      setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      success("Task deleted successfully");
    } catch (err) {
      fail(err.response?.data?.message || "Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  const handleDeleteColumn = async () => {
    try {
      // Refetch tasks from the server to ensure we have the latest data
      const tasksResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/get-all-tasks`,
        { withCredentials: true }
      );
      const updatedCards = tasksResponse.data.filter(
        (card) => card.columnId === column
      );

      // Check: allow deletion only if every task's status is "COMPLETED"
      if (
        updatedCards.length > 0 &&
        updatedCards.some((task) => task.status !== "COMPLETED")
      ) {
        fail("Cannot delete column with incomplete tasks");
        return;
      }
    } catch (err) {
      console.error("Error fetching tasks for deletion check:", err);
      fail("Error verifying tasks before deletion");
      return;
    }

    // Confirmation before deletion
    if (
      !window.confirm(`Are you sure you want to delete the "${title}" column?`)
    ) {
      return;
    }

    try {
      // Make the API call to delete the column
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/auth/delete-column`,
        {
          params: { columnId: column },
          withCredentials: true,
        }
      );
      success("Column deleted successfully");
      if (typeof onColumnDeleted === "function") {
        onColumnDeleted(column);
      }
    } catch (err) {
      fail(err.response?.data?.message || "Failed to delete column");
      console.error("Error deleting column:", err);
    }
  };

  const filteredCards = cards.filter((c) => c.columnId === column);

  return (
    <div className="w-56 shrink-0 bg-zinc-300 rounded-lg shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium font-title ${headingColor} ml-2`}>
          {title}
        </h3>
        <span className="rounded text-sm text-neutral-400 mr-1">
          {filteredCards.length}
        </span>
        {canDeleteColumn && (
          <button
            className="text-red-500 text-sm mr-2"
            onClick={handleDeleteColumn}
          >
            &times;
          </button>
        )}
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDragEnd}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => (
          <Card
            key={c.id}
            {...c}
            handleDragStart={handleDragStart}
            onEdit={handleEditCard}
            onEditStatus={handleEditStatus}
            onDelete={handleDeleteCard}
            activeCardMenu={activeCardMenu}
            setActiveCardMenu={setActiveCardMenu}
          />
        ))}
        <DropIndicator beforeId="-1" column={column} />
        {canCreateTask && (
          <AddCard
            column={column}
            setCards={setCards}
            success={success}
            failure={fail}
            members={taskMembers}
          />
        )}
      </div>
    </div>
  );
};

// AddCard component remains similar
const AddCard = ({ column, setCards, success, failure, members }) => {
  const [adding, setAdding] = useState(false);
  return adding ? (
    <NewTask
      invertTask={setAdding}
      taskStatus={adding}
      taskSuccess={success}
      taskFail={failure}
      members={members}
      setCards={setCards}
      column={column}
    />
  ) : (
    <button
      onClick={() => setAdding(true)}
      className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-700 transition-colors hover:text-blue-500"
    >
      <span>Add new task</span>
    </button>
  );
};

export default Column;
