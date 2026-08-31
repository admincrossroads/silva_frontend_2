import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select-native";

interface DataTableToolbarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  filterOptions?: { label: string; value: string }[];
}

export function DataTableToolbar({ globalFilter, setGlobalFilter, filterOptions }: DataTableToolbarProps) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <div className="relative min-w-[12rem] flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search table…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-9 rounded-lg border-border/80 bg-background pl-9 text-sm shadow-sm"
        />
      </div>
      {filterOptions ? (
        <NativeSelect className="h-9 w-auto rounded-lg border-border/80 bg-background px-3 text-sm shadow-sm">
          <option value="">All statuses</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      ) : null}
    </div>
  );
}
