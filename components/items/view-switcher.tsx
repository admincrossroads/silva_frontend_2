"use client";

import { LayoutGrid, Table2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleViewMode } from "@/lib/config/procore-modules";

type ViewSwitcherProps = {
  value: ModuleViewMode;
  onChange: (mode: ModuleViewMode) => void;
  modes?: ModuleViewMode[];
  className?: string;
};

const MODE_META: Record<ModuleViewMode, { label: string; icon: typeof LayoutGrid }> = {
  board: { label: "Board", icon: LayoutGrid },
  table: { label: "Table", icon: Table2 },
  calendar: { label: "Calendar", icon: CalendarDays },
};

export function ViewSwitcher({ value, onChange, modes = ["board", "table"], className }: ViewSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border bg-muted/40 p-0.5",
        className,
      )}
      role="tablist"
      aria-label="View mode"
    >
      {modes.map((mode) => {
        const Icon = MODE_META[mode].icon;
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {MODE_META[mode].label}
          </button>
        );
      })}
    </div>
  );
}
