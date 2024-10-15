import { useState } from "react";
import Card from './Card';
import DropIndicator from "./DropIndicator";

const Column = ({ title, headingColor, column, cards, setCards, activeCardMenu, setActiveCardMenu }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
    if (highlightIndicator) {
      highlightIndicator(e);
    }
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const clearHighlight = (els) => {
    const indicators = els || getIndicators();
    if (indicators.length === 0) return;
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    if (indicators.length === 0) return;
    clearHighlight(indicators);
    const el = getNearestIndicator(e, indicators);
    if (el && el.element) {
      el.element.style.opacity = "1";
    }
  };

  const handleDragLeave = (e) => {
    setActive(false);
    clearHighlight();
  };

  const handleDragEnd = (e) => {
    setActive(false);
    clearHighlight();

    const cardId = e.dataTransfer.getData("cardId");
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];
      let cardToMove = copy.find((c) => c.id === cardId);
      if (!cardToMove) return;

      cardToMove = { ...cardToMove, column };
      copy = copy.filter((c) => c.id !== cardId);

      const moveBack = before === "-1";

      if (moveBack) {
        copy.push(cardToMove);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToMove);
      }

      setCards(copy);
    }
  };

  const handleEditCard = (cardId, newTitle) => {
    if (newTitle) {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, title: newTitle } : card
        )
      );
    }
  };

  const handleDeleteCard = (cardId) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span>
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
            onDelete={handleDeleteCard}
            activeCardMenu={activeCardMenu}
            setActiveCardMenu={setActiveCardMenu}
          />
        ))}
        <DropIndicator beforeId="-1" column={column} />
        {/* AddCard Component was missing */}
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

// Define AddCard component
const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim().length) return;

    const newCard = {
      column,
      title: text.trim(),
      id: Math.random().toString(),
    };

    setCards((prev) => [...prev, newCard]);

    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <form onSubmit={handleSubmit}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new Form..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>Add</span>
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add new form</span>
        </button>
      )}
    </>
  );
};

export default Column;
