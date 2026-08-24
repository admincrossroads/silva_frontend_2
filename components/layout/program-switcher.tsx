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
import { cn } from "@/lib/utils";

type ProgramSwitcherProps = {
  compact?: boolean;
};

/** Program switcher — only when SPX has multiple programs. Farm areas use FarmEstateSwitcher. */
export function ProgramSwitcher({ compact = false }: ProgramSwitcherProps) {
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
      <SelectTrigger
        className={cn(
          "h-8 min-w-0 text-xs text-muted-foreground [&>span]:truncate",
          compact ? "w-[min(10rem,38vw)]" : "w-[140px]",
        )}
        aria-label="Program"
      >
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
