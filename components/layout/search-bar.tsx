"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-center">
      {expanded && (
        <Input
          autoFocus
          type="text"
          placeholder="Search..."
          className="h-8 w-48"
          onBlur={() => setExpanded(false)}
        />
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn("p-1 text-muted-foreground hover:text-primary", expanded && "ml-1")}
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
