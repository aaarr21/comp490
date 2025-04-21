import React, { useState, useEffect } from "react";
import axios from "axios";
import Column from "./Column";
import { useRBAC } from "../../utils/rbacUtils";
import { toast } from "sonner";

const Board = ({ success, fail }) => {
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [activeCardMenu, setActiveCardMenu] = useState(null);
  const [deptMembers, setDeptMembers] = useState([]);
  const { hasPermission, hasRole } = useRBAC();

  // Check permissions
  const canCreateTask = hasPermission("task.create");
  const canViewAllTasks = hasPermission("task.view.all") || hasRole("admin");
  const canCreateColumn = hasPermission("board.create");

  // Function to refetch board data (columns and tasks)
  const fetchBoardData = async () => {
    try {
      const columnsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/get-all-goals`,
        { withCredentials: true }
      );
      setColumns(columnsResponse.data);

      const tasksResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/get-all-tasks`,
        { withCredentials: true }
      );
      setCards(tasksResponse.data);
    } catch (err) {
      fail("Error loading board data");
      console.error("Error fetching board data:", err);
    }
  };

  // Initial fetch for board and members data
  useEffect(() => {
    fetchBoardData();

    const getMembersData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/get-all-members?limit=100`,
          { withCredentials: true }
        );
        console.log("Members data fetched:", response.data);
        setDeptMembers(response.data || []);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };

    getMembersData();
  }, [fail]);

  // Handle task drag between columns with refetch after drop
  const handleTaskDrag = async (cardId, newColumnId) => {
    try {
      // Convert cardId to a string and compare with card.id converted to a string
      const cardToMove = cards.find((card) => String(card.id) === cardId);
      if (!cardToMove) {
        console.error("Card not found:", cardId);
        return;
      }

      // Save original column ID for rollback if needed
      const originalColumnId = cardToMove.columnId;

      // Optimistically update UI
      setCards((prevCards) =>
        prevCards.map((card) =>
          String(card.id) === cardId ? { ...card, columnId: newColumnId } : card
        )
      );

      // Send API request
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/swap-columns`,
        { cardId, columnId: newColumnId },
        { withCredentials: true }
      );

      success("Task moved successfully");

      // Refetch tasks to get the updated state from the server
      const tasksResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/get-all-tasks`,
        { withCredentials: true }
      );
      setCards(tasksResponse.data);
    } catch (err) {
      // Revert UI on error
      const originalColumn = cards.find(
        (card) => String(card.id) === cardId
      )?.columnId;
      if (originalColumn) {
        setCards((prevCards) =>
          prevCards.map((card) =>
            String(card.id) === cardId
              ? { ...card, columnId: originalColumn }
              : card
          )
        );
      }
      fail(err.response?.data?.message || "Failed to move task");
      console.error("Error moving task:", err);
    }
  };

  const handleColumnDeleted = (deletedColumnId) => {
    // Remove the deleted column and its cards from state
    setColumns((prevColumns) =>
      prevColumns.filter((column) => column.columnAsg !== deletedColumnId)
    );
    setCards((prevCards) =>
      prevCards.filter((card) => card.columnId !== deletedColumnId)
    );
  };

  return (
    <div className="p-12">
      {/* Board container with horizontal scrolling */}
      <div className="flex gap-3 overflow-x-auto">
        {columns.map((column) => (
          <Column
            key={column.columnAsg}
            title={column.title}
            column={column.columnAsg}
            headingColor={column.color}
            cards={cards.filter((card) => card.columnId === column.columnAsg)}
            setCards={setCards}
            activeCardMenu={activeCardMenu}
            setActiveCardMenu={setActiveCardMenu}
            success={success}
            fail={fail}
            canCreateTask={canCreateTask}
            onDragTask={handleTaskDrag}
            onColumnDeleted={handleColumnDeleted}
            taskMembers={deptMembers}
          />
        ))}
        {/* Only show add column button if user has permission */}
        {canCreateColumn && (
          <button
            className="add-column-btn self-start"
            onClick={() => {
              /* Add column logic */
            }}
          >
            Add Column
          </button>
        )}
      </div>
    </div>
  );
};

export default Board;
