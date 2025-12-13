import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { BookOpen, FileText, LayoutTemplate, Loader2, Plus, Edit2, Trash2, Search, Tag, ExternalLink, Star, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGuides, useDeleteGuide, type Guide } from "@/hooks/use-guides";
import { GuideForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { useFavorites } from "@/hooks/use-favorites";
import { MobilePullToRefresh, MobileFloatingButton, MobileBottomSheet, MobileOnly, DesktopOnly, MobileShareSheet, MobileGestureHandler } from "@/components/mobile";
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

export default function Guides() {
  useTrackPageView("page", "guides");
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

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Guías Visuales</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Recursos de diseño, manuales de estilo y mejores prácticas.</p>
          </div>
          
          <DesktopOnly>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar guías..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                />
              </div>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Guía
              </Button>
            </div>
          </DesktopOnly>
          
          <MobileOnly>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar guías..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </MobileOnly>
        </div>

        {/* Filters - Desktop */}
        <DesktopOnly>
          {types.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              <button 
                onClick={() => setSelectedType(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${!selectedType ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
              >
                Todos
              </button>
              {types.map(type => (
                <button 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                >
                  {typeLabels[type] || type}
                </button>
              ))}
            </div>
          )}
        </DesktopOnly>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <GuideCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Error al cargar las guías. Por favor, intenta de nuevo.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredGuides.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedType ? "No se encontraron guías" : "No hay guías disponibles"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedType 
                ? "Intenta con otros términos de búsqueda o filtros."
                : "Crea tu primera guía para comenzar a construir tu biblioteca de recursos."}
            </p>
            {!searchTerm && !selectedType && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Guía
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && filteredGuides.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map((guide) => (
              <GuideCard 
                key={guide.id} 
                guide={guide}
                onEdit={() => handleEdit(guide)}
                onDelete={() => handleDeleteClick(guide)}
              />
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <GuideForm
          open={formOpen}
          onOpenChange={setFormOpen}
          guide={editingGuide}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingGuide} onOpenChange={(open) => !open && setDeletingGuide(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar guía?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La guía "{deletingGuide?.title}" será eliminada permanentemente.
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

        {/* Mobile Bottom Sheet para filtros */}
        <MobileBottomSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title="Filtros"
        >
          <div className="space-y-4 p-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Tipo de Guía</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setFiltersOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    !selectedType
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  Todos
                </button>
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setFiltersOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {typeLabels[type] || type}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredGuides.length} guías disponibles
            </div>
          </div>
        </MobileBottomSheet>

        {/* Mobile Floating Button */}
        <MobileFloatingButton
          icon={Plus}
          onClick={handleCreate}
          title="Nueva Guía"
        />
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}

const GuideCard = memo(function GuideCard({ 
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

  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all flex flex-col">
      {/* Actions */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => toggleFavorite("guide", guide.id)}
          className={`p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-secondary transition-colors ${
            isFav 
              ? "text-yellow-500" 
              : "text-muted-foreground hover:text-yellow-500"
          }`}
          title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Star className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
          title="Editar"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Image */}
      {guide.imageUrl && (
        <MobileGestureHandler
          gestures={{
            onPinch: (scale) => {
              // Zoom en imagen con pinch (se puede implementar visualmente)
              console.log("Pinch scale:", scale);
            },
            onDoubleTap: () => {
              // Toggle fullscreen o zoom
              console.log("Double tap on image");
            },
          }}
        >
          <div className="mb-4 rounded-lg overflow-hidden border border-border">
            <img 
              src={guide.imageUrl} 
              alt={guide.title}
              className="w-full h-32 object-cover"
            />
          </div>
        </MobileGestureHandler>
      )}

      {/* Content */}
      <div className="flex items-start gap-4 flex-1">
        <div className={`p-3 rounded-lg ${iconColor} flex-shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg leading-tight">{guide.title}</h3>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded whitespace-nowrap">
              {typeLabels[guide.type] || guide.type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {guide.description}
          </p>
          
          {/* Tags */}
          {guide.tags && guide.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {guide.tags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-flex items-center text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/50">
                  <Tag className="h-3 w-3 mr-1 opacity-50" />
                  {tag}
                </span>
              ))}
              {guide.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{guide.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
