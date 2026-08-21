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
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>
      {filterOptions && (
        <NativeSelect className="h-8 w-auto px-2.5 text-xs">
          <option value="">All statuses</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </NativeSelect>
      )}
    </div>
  );
}
