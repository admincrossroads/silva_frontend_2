"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { BoardColumnEmpty, BoardColumnShell, BoardEmptyState, BoardLoadingSkeleton } from "./board-column";
import { ItemCard } from "./item-card";
import type { BoardItem } from "./types";
import { cn } from "@/lib/utils";

type DraggableBoardViewProps = {
  columns: readonly string[];
  items: BoardItem[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  columnSummaries?: Record<string, string>;
  onItemMove?: (item: BoardItem, toStatus: string) => void;
};

function DraggableCard({ item }: { item: BoardItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.35 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <ItemCard item={item} />
    </div>
  );
}

function DropColumn({
  col,
  colItems,
  summary,
}: {
  col: string;
  colItems: BoardItem[];
  summary?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col });

  return (
    <BoardColumnShell status={col} count={colItems.length} summary={summary} isOver={isOver} droppableRef={setNodeRef}>
      {colItems.length ? (
        colItems.map((item) => <DraggableCard key={item.id} item={item} />)
      ) : (
        <BoardColumnEmpty status={col} />
      )}
    </BoardColumnShell>
  );
}

export function DraggableBoardView({
  columns,
  items,
  loading,
  emptyMessage = "Create your first item or switch to table view to see all records.",
  className,
  columnSummaries,
  onItemMove,
}: DraggableBoardViewProps) {
  const [active, setActive] = useState<BoardItem | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (loading) {
    return <BoardLoadingSkeleton columns={columns.length || 4} />;
  }

  if (!items.length) {
    return <BoardEmptyState message={emptyMessage} />;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActive(null);
    const { active: dragItem, over } = event;
    if (!over || !onItemMove) return;
    const item = dragItem.data.current?.item as BoardItem | undefined;
    const toStatus = String(over.id);
    if (!item || item.status === toStatus) return;
    onItemMove(item, toStatus);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const item = event.active.data.current?.item as BoardItem | undefined;
    setActive(item ?? null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn("flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory", className)}>
        {columns.map((col) => (
          <div key={col} className="snap-start">
            <DropColumn
              col={col}
              colItems={items.filter((i) => i.status === col)}
              summary={columnSummaries?.[col]}
            />
          </div>
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {active ? (
          <div className="rotate-1 scale-[1.02] shadow-xl">
            <ItemCard item={active} compact />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
