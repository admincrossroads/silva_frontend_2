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
import { formatWorkflowLabel } from "@/lib/config/procore-modules";
import { ItemCard, ItemCardSkeleton } from "./item-card";
import type { BoardItem } from "./types";
import { cn } from "@/lib/utils";

type DraggableBoardViewProps = {
  columns: readonly string[];
  items: BoardItem[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onItemMove?: (item: BoardItem, toStatus: string) => void;
};

function DraggableCard({ item }: { item: BoardItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
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
}: {
  col: string;
  colItems: BoardItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[17rem] max-w-[20rem] flex-1 flex-col rounded-xl border bg-muted/20",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {formatWorkflowLabel(col)}
        </h3>
        <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
          {colItems.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2 min-h-[8rem]">
        {colItems.length ? (
          colItems.map((item) => <DraggableCard key={item.id} item={item} />)
        ) : (
          <p className="px-2 py-6 text-center text-[11px] text-muted-foreground/80">Empty</p>
        )}
      </div>
    </div>
  );
}

export function DraggableBoardView({
  columns,
  items,
  loading,
  emptyMessage = "No items in this workflow.",
  className,
  onItemMove,
}: DraggableBoardViewProps) {
  const [active, setActive] = useState<BoardItem | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (loading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-3 xl:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
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
      <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
        {columns.map((col) => (
          <DropColumn key={col} col={col} colItems={items.filter((i) => i.status === col)} />
        ))}
      </div>
      <DragOverlay>{active ? <ItemCard item={active} /> : null}</DragOverlay>
    </DndContext>
  );
}
