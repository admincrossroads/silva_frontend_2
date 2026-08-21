"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProgramSwitcher() {
  const { programs, activeProgram, switchProgram } = useAuth();
  if (!programs?.length) {
    return (
      <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[140px]">
        No program
      </span>
    );
  }

  return (
    <Select
      value={activeProgram?.id || undefined}
      onValueChange={(id) => {
        void switchProgram(id);
      }}
    >
      <SelectTrigger className="h-8 w-[160px] text-xs">
        <SelectValue placeholder="Select program" />
      </SelectTrigger>
      <SelectContent>
        {programs.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
