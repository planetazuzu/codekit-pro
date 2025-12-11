import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { Copy, Check, Loader2, Plus, Edit2, Trash2, Star, MessageSquare, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePrompts, useDeletePrompt, type Prompt } from "@/hooks/use-prompts";
import { PromptForm } from "@/components/forms";
import { DetailView } from "@/components/DetailView";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { useTrackPageView } from "@/hooks/use-track-view";
import { PromptCardSkeleton } from "@/components/Skeleton";
import { FilterBar, SortSelect, type FilterOption, type SortOption, BackButton } from "@/components/common";
import { useFilter } from "@/hooks/utils/use-filter";
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

export default function Prompts() {
  useTrackPageView("page", "prompts");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);
  const { toast } = useToast();
  const { data: prompts = [], isLoading, error } = usePrompts();
  const deletePrompt = useDeletePrompt();

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

  const categories = useMemo<FilterOption[]>(() => {
    const cats = Array.from(new Set(prompts.map(p => p.category)));
    return cats.map(cat => ({
      value: cat,
      label: cat,
      count: prompts.filter(p => p.category === cat).length,
    }));
  }, [prompts]);

  const allTags = useMemo<FilterOption[]>(() => {
    const tags = new Set<string>();
    prompts.forEach(p => p.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort().map(tag => ({
      value: tag,
      label: tag,
      count: prompts.filter(p => p.tags?.includes(tag)).length,
    }));
  }, [prompts]);

  const sortOptions: SortOption[] = [
    { value: "date", label: "Fecha" },
    { value: "title", label: "Título" },
  ];

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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Prompts</h1>
            <p className="text-muted-foreground mt-1">Colección curada de prompts para optimizar tu desarrollo.</p>
          </div>
          
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Prompt
          </Button>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar prompts..."
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          tags={allTags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          showClearButton={true}
          onClearFilters={resetFilters}
        />

        {/* Results count and sort */}
        <div className="flex items-center justify-between">
          {filteredPrompts.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredCount} de {totalCount} prompts
            </div>
          )}
          <SortSelect
            options={sortOptions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
            onToggleSortOrder={toggleSortOrder}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <PromptCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error al cargar los prompts</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron prompts</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory || selectedTag
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primer prompt"}
            </p>
            {!searchTerm && !selectedCategory && !selectedTag && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Prompt
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <PromptCard
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
                Esta acción no se puede deshacer. El prompt será eliminado permanentemente.
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
      </div>
    </Layout>
  );
}

// Prompt Card Component
interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: () => void;
  onView: () => void;
  onCopy: (text: string) => void;
}

const PromptCard = memo(function PromptCard({ prompt, onEdit, onDelete, onView, onCopy }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCopy = () => {
    onCopy(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFav = isFavorite("prompt", prompt.id);

  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:shadow-primary/5 hover:border-primary/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1 line-clamp-1">{prompt.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {prompt.category}
            </span>
            {prompt.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => toggleFavorite("prompt", prompt.id)}
          className={`p-1.5 rounded-md transition-colors ${
            isFav ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
          }`}
        >
          <Star className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{prompt.content}</p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(prompt)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
