/**
 * Mobile-optimized Guides Page
 * Simplified version without complex gestures
 */

import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { BookOpen, FileText, LayoutTemplate, Plus, Edit2, Trash2, Search, ExternalLink, Star, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGuides, useDeleteGuide, type Guide } from "@/hooks/use-guides";
import { GuideForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { useFavorites } from "@/hooks/use-favorites";
import { MobilePullToRefresh, MobileFloatingButton, MobileBottomSheet } from "@/components/mobile";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTrackPageView } from "@/hooks/use-track-view";
import { GuideCardSkeleton } from "@/components/Skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const typeIcons: Record<string, any> = {
  ui: LayoutTemplate,
  manual: BookOpen,
  template: FileText,
  reference: ExternalLink,
};

const typeColors: Record<string, string> = {
  ui: "bg-blue-500/10 text-blue-500",
  manual: "bg-purple-500/10 text-purple-500",
  template: "bg-green-500/10 text-green-500",
  reference: "bg-orange-500/10 text-orange-500",
};

const typeLabels: Record<string, string> = {
  ui: "Guía UI",
  manual: "Manual",
  template: "Plantilla",
  reference: "Referencia",
};

export default function MobileGuides() {
  useTrackPageView("page", "guides-mobile");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [deletingGuide, setDeletingGuide] = useState<Guide | null>(null);
  const { toast } = useToast();
  const { data: guides = [], isLoading, error, refetch } = useGuides();
  const deleteGuide = useDeleteGuide();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["guides"] });
  }, [refetch, queryClient]);

  const types = useMemo(() => {
    return Array.from(new Set(guides.map(g => g.type)));
  }, [guides]);

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            guide.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType ? guide.type === selectedType : true;
      return matchesSearch && matchesType;
    });
  }, [guides, searchTerm, selectedType]);

  const handleCreate = useCallback(() => {
    setEditingGuide(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((guide: Guide) => {
    setEditingGuide(guide);
    setFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((guide: Guide) => {
    setDeletingGuide(guide);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingGuide) return;
    try {
      await deleteGuide.mutateAsync(deletingGuide.id);
      toast({
        title: "Guía eliminada",
        description: "La guía ha sido eliminada correctamente.",
      });
      setDeletingGuide(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar la guía.",
        variant: "destructive",
      });
    }
  }, [deletingGuide, deleteGuide, toast]);

  const hasActiveFilters = selectedType || searchTerm;

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guías</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Recursos de diseño y mejores prácticas.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Buscar guías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Filter Button and Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {filteredGuides.length > 0 && (
                <span>{filteredGuides.length} de {guides.length}</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className={hasActiveFilters ? "border-primary text-primary" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <GuideCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-sm">Error al cargar las guías</p>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-semibold mb-2">No se encontraron guías</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros"
                  : "Crea tu primera guía"}
              </p>
              {!hasActiveFilters && (
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Guía
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuides.map((guide) => (
                <MobileGuideCard 
                  key={guide.id} 
                  guide={guide}
                  onEdit={() => handleEdit(guide)}
                  onDelete={() => handleDeleteClick(guide)}
                />
              ))}
            </div>
          )}

          {/* Forms and Dialogs */}
          <GuideForm
            open={formOpen}
            onOpenChange={setFormOpen}
            guide={editingGuide}
          />

          <AlertDialog open={!!deletingGuide} onOpenChange={(open) => !open && setDeletingGuide(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar guía?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Mobile Filters Bottom Sheet */}
          <MobileBottomSheet
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title="Filtros"
          >
            <div className="space-y-4 pb-4">
              {/* Type Filter */}
              {types.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Guía</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedType(null);
                        setFiltersOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                        !selectedType
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      Todos ({guides.length})
                    </button>
                    {types.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setFiltersOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                          selectedType === type
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        {typeLabels[type] || type} ({guides.filter(g => g.type === type).length})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedType(null);
                    setSearchTerm("");
                    setFiltersOpen(false);
                  }}
                  className="w-full"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </MobileBottomSheet>
        </div>
      </MobilePullToRefresh>

      {/* Mobile Floating Button */}
      <MobileFloatingButton
        icon={Plus}
        onClick={handleCreate}
        title="Nueva Guía"
      />
    </Layout>
  );
}

// Mobile-optimized Guide Card
const MobileGuideCard = memo(function MobileGuideCard({ 
  guide, 
  onEdit, 
  onDelete 
}: { 
  guide: Guide; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = typeIcons[guide.type] || FileText;
  const iconColor = typeColors[guide.type] || "bg-gray-500/10 text-gray-500";
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite("guide", guide.id);

  const handleClick = () => {
    if (guide.url) {
      window.open(guide.url, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="rounded-xl border border-border bg-card overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Image Preview */}
      {guide.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden bg-secondary/30">
          <img 
            src={guide.imageUrl} 
            alt={guide.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {typeLabels[guide.type] || guide.type}
              </span>
            </div>
            <h3 className="text-base font-semibold mb-1 line-clamp-2">{guide.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{guide.description}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite("guide", guide.id);
            }}
            className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
              isFav ? "text-yellow-500" : "text-muted-foreground"
            }`}
          >
            <Star className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Tags */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {guide.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                #{tag}
              </span>
            ))}
            {guide.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{guide.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {guide.url ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Enlace externo</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Ver detalles</span>
          )}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 w-8 p-0 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
