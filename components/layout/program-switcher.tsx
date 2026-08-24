"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Program switcher — only when SPX has multiple programs. Farm areas use FarmEstateSwitcher. */
export function ProgramSwitcher() {
  const { programs, activeProgram, switchProgram } = useAuth();
  const { isSpx } = useRole();

  if (!isSpx || !programs || programs.length <= 1) return null;

  return (
    <Select
      value={activeProgram?.id || undefined}
      onValueChange={(id) => {
        void switchProgram(id);
      }}
    >
      <SelectTrigger className="h-8 w-[140px] text-xs text-muted-foreground">
        <SelectValue placeholder="Program" />
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
