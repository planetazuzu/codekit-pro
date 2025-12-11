/**
 * Reusable sort select component
 */

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SortOrder } from "@/hooks/utils/use-filter";

export interface SortOption {
  value: string;
  label: string;
}

export interface SortSelectProps {
  /** Available sort options */
  options: SortOption[];
  /** Current sort field */
  sortBy: string;
  /** Current sort order */
  sortOrder: SortOrder;
  /** Sort field onChange handler */
  onSortByChange: (field: string) => void;
  /** Sort order onChange handler */
  onSortOrderChange: (order: SortOrder) => void;
  /** Toggle sort order handler */
  onToggleSortOrder?: () => void;
  /** Additional className */
  className?: string;
}

export function SortSelect({
  options,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onToggleSortOrder,
  className,
}: SortSelectProps) {
  const handleToggleOrder = () => {
    if (onToggleSortOrder) {
      onToggleSortOrder();
    } else {
      onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleOrder}
        className="h-9 w-9"
        title={`Ordenar ${sortOrder === "asc" ? "descendente" : "ascendente"}`}
      >
        {sortOrder === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

