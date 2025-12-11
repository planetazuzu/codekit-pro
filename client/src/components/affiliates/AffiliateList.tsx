/**
 * Affiliate List Component
 */

import { useState, useMemo } from "react";
import { Search, Filter, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AffiliateCard } from "./AffiliateCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import type { Affiliate } from "@shared/schema";
import { useAffiliates } from "@/hooks/use-affiliates";
import { cn } from "@/lib/utils";

interface AffiliateListProps {
  className?: string;
  showFilters?: boolean;
  limit?: number;
  category?: string;
}

const CATEGORIES = [
  "Todos",
  "Hosting",
  "Deployment",
  "Cloud",
  "IA",
  "IA & DevTools",
  "UI Kits",
  "Productividad",
  "Diseño",
];

export function AffiliateList({ 
  className, 
  showFilters = true, 
  limit,
  category: initialCategory 
}: AffiliateListProps) {
  const { data: affiliates, isLoading, error } = useAffiliates();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "Todos");

  const filteredAffiliates = useMemo(() => {
    if (!affiliates) return [];
    
    let result = affiliates;

    // Filter by category
    if (selectedCategory && selectedCategory !== "Todos") {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.category.toLowerCase().includes(term) ||
          (a.commission && a.commission.toLowerCase().includes(term))
      );
    }

    // Apply limit
    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [affiliates, searchTerm, selectedCategory, limit]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Error al cargar afiliados"
        description="No se pudieron cargar los enlaces de afiliados."
      />
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showFilters && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar afiliados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAffiliates.length} afiliado{filteredAffiliates.length !== 1 ? "s" : ""} encontrado{filteredAffiliates.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Affiliate grid */}
      {filteredAffiliates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAffiliates.map((affiliate) => (
            <AffiliateCard key={affiliate.id} affiliate={affiliate} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No hay afiliados"
          description={
            searchTerm || selectedCategory !== "Todos"
              ? "No se encontraron afiliados con esos filtros."
              : "Aún no hay enlaces de afiliados configurados."
          }
        />
      )}
    </div>
  );
}

