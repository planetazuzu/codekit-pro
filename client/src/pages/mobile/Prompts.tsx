/**
 * Mobile-optimized Prompts Page
 * Simplified version for better mobile performance
 */

import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { Copy, Check, Plus, Edit2, Trash2, Star, MessageSquare, Eye, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePrompts, useDeletePrompt, type Prompt } from "@/hooks/use-prompts";
import { PromptForm } from "@/components/forms";
import { DetailView } from "@/components/DetailView";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { useTrackPageView } from "@/hooks/use-track-view";
import { PromptCardSkeleton } from "@/components/Skeleton";
import { BackButton } from "@/components/common";
import { useFilter } from "@/hooks/utils/use-filter";
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
import { Input } from "@/components/ui/input";

export default function MobilePrompts() {
  useTrackPageView("page", "prompts-mobile");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toast } = useToast();
  const { data: prompts = [], isLoading, error, refetch } = usePrompts();
  const deletePrompt = useDeletePrompt();
  const queryClient = useQueryClient();

  // Use filter hook
  const {
    filteredData: filteredPrompts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    resetFilters,
    filteredCount,
    totalCount,
  } = useFilter(prompts, {
    getSearchableText: (p) => `${p.title} ${p.content} ${p.tags?.join(" ") || ""}`,
    getCategory: (p) => p.category,
    getTags: (p) => p.tags || [],
    getSortValue: (p, field) => {
      if (field === "date" || field === "createdAt") {
        return p.createdAt ? new Date(p.createdAt).getTime() : 0;
      }
      return (p as Record<string, unknown>)[field] as string;
    },
    sortBy: "date",
    sortOrder: "desc",
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(prompts.map(p => p.category)));
    return cats.map(cat => ({
      value: cat,
      label: cat,
      count: prompts.filter(p => p.category === cat).length,
    }));
  }, [prompts]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    prompts.forEach(p => p.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort().map(tag => ({
      value: tag,
      label: tag,
      count: prompts.filter(p => p.tags?.includes(tag)).length,
    }));
  }, [prompts]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El prompt ha sido copiado al portapapeles.",
    });
  }, [toast]);

  const handleCreate = useCallback(() => {
    setEditingPrompt(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingPrompt) return;
    try {
      await deletePrompt.mutateAsync(deletingPrompt.id);
      toast({
        title: "Prompt eliminado",
        description: "El prompt ha sido eliminado correctamente.",
      });
      setDeletingPrompt(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar el prompt.",
        variant: "destructive",
      });
    }
  }, [deletingPrompt, deletePrompt, toast]);

  const handleView = useCallback((prompt: Prompt) => {
    setViewingPrompt(prompt);
    setDetailOpen(true);
  }, []);

  const handleDeleteClick = useCallback((prompt: Prompt) => {
    setDeletingPrompt(prompt);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["prompts"] });
  }, [refetch, queryClient]);

  const hasActiveFilters = selectedCategory || selectedTag || searchTerm;

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Prompts</h1>
            <p className="text-muted-foreground mt-1 text-sm">Colección de prompts para desarrollo.</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Buscar prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Filter Button and Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {filteredPrompts.length > 0 && (
                <span>{filteredCount} de {totalCount}</span>
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
                <PromptCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-sm">Error al cargar los prompts</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-semibold mb-2">No se encontraron prompts</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros"
                  : "Comienza creando tu primer prompt"}
              </p>
              {!hasActiveFilters && (
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Prompt
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrompts.map((prompt) => (
                <MobilePromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onEdit={handleEdit}
                  onDelete={() => handleDeleteClick(prompt)}
                  onView={() => handleView(prompt)}
                  onCopy={copyToClipboard}
                />
              ))}
            </div>
          )}

          {/* Forms and Dialogs */}
          <PromptForm
            open={formOpen}
            onOpenChange={setFormOpen}
            prompt={editingPrompt}
          />

          <DetailView
            open={detailOpen}
            onOpenChange={setDetailOpen}
            data={viewingPrompt}
            type="prompt"
          />

          <AlertDialog open={!!deletingPrompt} onOpenChange={(open) => !open && setDeletingPrompt(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar prompt?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Categorías</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                        !selectedCategory
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      Todas ({totalCount})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                          selectedCategory === cat.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        !selectedTag
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border"
                      }`}
                    >
                      Todos
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => setSelectedTag(tag.value)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          selectedTag === tag.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border"
                        }`}
                      >
                        {tag.label} ({tag.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSortBy("date");
                      setSortOrder("desc");
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                      sortBy === "date" && sortOrder === "desc"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    Más recientes
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("title");
                      setSortOrder("asc");
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                      sortBy === "title" && sortOrder === "asc"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    Título A-Z
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    resetFilters();
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
        title="Nuevo Prompt"
      />
    </Layout>
  );
}

// Mobile-optimized Prompt Card
interface MobilePromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: () => void;
  onView: () => void;
  onCopy: (text: string) => void;
}

const MobilePromptCard = memo(function MobilePromptCard({ 
  prompt, 
  onEdit, 
  onDelete, 
  onView, 
  onCopy 
}: MobilePromptCardProps) {
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCopy = () => {
    onCopy(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFav = isFavorite("prompt", prompt.id);

  return (
    <div 
      onClick={onView}
      className="rounded-xl border border-border bg-card p-4 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold mb-1 line-clamp-1">{prompt.title}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {prompt.category}
            </span>
            {prompt.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                #{tag}
              </span>
            ))}
            {prompt.tags && prompt.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{prompt.tags.length - 2}</span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite("prompt", prompt.id);
          }}
          className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
            isFav ? "text-yellow-500" : "text-muted-foreground"
          }`}
        >
          <Star className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{prompt.content}</p>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="h-8 w-8 p-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(prompt);
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
  );
});
