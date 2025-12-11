/**
 * Reusable filter bar component
 */

import { Search, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterBarProps {
  /** Search input value */
  searchTerm: string;
  /** Search input onChange handler */
  onSearchChange: (value: string) => void;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Available categories */
  categories?: FilterOption[];
  /** Selected category */
  selectedCategory?: string | null;
  /** Category onChange handler */
  onCategoryChange?: (value: string | null) => void;
  /** Available tags */
  tags?: FilterOption[];
  /** Selected tag */
  selectedTag?: string | null;
  /** Tag onChange handler */
  onTagChange?: (value: string | null) => void;
  /** Available languages (for snippets) */
  languages?: FilterOption[];
  /** Selected language */
  selectedLanguage?: string | null;
  /** Language onChange handler */
  onLanguageChange?: (value: string | null) => void;
  /** Show clear filters button */
  showClearButton?: boolean;
  /** Clear filters handler */
  onClearFilters?: () => void;
  /** Additional className */
  className?: string;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  categories,
  selectedCategory,
  onCategoryChange,
  tags,
  selectedTag,
  onTagChange,
  languages,
  selectedLanguage,
  onLanguageChange,
  showClearButton = true,
  onClearFilters,
  className,
}: FilterBarProps) {
  const hasActiveFilters =
    searchTerm ||
    selectedCategory ||
    selectedTag ||
    selectedLanguage;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        {categories && categories.length > 0 && onCategoryChange && (
          <Select
            value={selectedCategory || "all"}
            onValueChange={(value) =>
              onCategoryChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                  {cat.count !== undefined && (
                    <span className="ml-2 text-muted-foreground">
                      ({cat.count})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Language Filter */}
        {languages && languages.length > 0 && onLanguageChange && (
          <Select
            value={selectedLanguage || "all"}
            onValueChange={(value) =>
              onLanguageChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos los lenguajes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los lenguajes</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                  {lang.count !== undefined && (
                    <span className="ml-2 text-muted-foreground">
                      ({lang.count})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Tag Filter */}
        {tags && tags.length > 0 && onTagChange && (
          <Select
            value={selectedTag || "all"}
            onValueChange={(value) =>
              onTagChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las etiquetas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etiquetas</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.value} value={tag.value}>
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    {tag.label}
                    {tag.count !== undefined && (
                      <span className="ml-auto text-muted-foreground">
                        ({tag.count})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              Categoría: {categories?.find((c) => c.value === selectedCategory)?.label}
              <button
                onClick={() => onCategoryChange?.(null)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTag && (
            <Badge variant="secondary" className="gap-1">
              Etiqueta: {tags?.find((t) => t.value === selectedTag)?.label}
              <button
                onClick={() => onTagChange?.(null)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedLanguage && (
            <Badge variant="secondary" className="gap-1">
              Lenguaje: {languages?.find((l) => l.value === selectedLanguage)?.label}
              <button
                onClick={() => onLanguageChange?.(null)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

