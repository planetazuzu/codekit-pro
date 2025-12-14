/**
 * Mobile-optimized Snippets Page
 * Simplified version without heavy syntax highlighting
 */

import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { Search, Copy, Check, Plus, Edit2, Trash2, Star, Code, Eye, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSnippets, useDeleteSnippet, type Snippet } from "@/hooks/use-snippets";
import { SnippetForm } from "@/components/forms";
import { DetailView } from "@/components/DetailView";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { useFavorites } from "@/hooks/use-favorites";
import { MobilePullToRefresh, MobileFloatingButton, MobileSwipeActions, MobileBottomSheet } from "@/components/mobile";
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
import { SnippetCardSkeleton } from "@/components/Skeleton";
import { Input } from "@/components/ui/input";

export default function MobileSnippets() {
  useTrackPageView("page", "snippets-mobile");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "date" | "language">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingSnippet, setViewingSnippet] = useState<Snippet | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toast } = useToast();
  const { data: snippets = [], isLoading, error, refetch } = useSnippets();
  const deleteSnippet = useDeleteSnippet();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["snippets"] });
  }, [refetch, queryClient]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    snippets.forEach(s => s.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [snippets]);

  const languages = useMemo(() => {
    return Array.from(new Set(snippets.map(s => s.language))).sort();
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    let filtered = snippets.filter(snippet => {
      const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ?? false);
      const matchesTag = selectedTag ? snippet.tags?.includes(selectedTag) : true;
      const matchesLanguage = selectedLanguage ? snippet.language === selectedLanguage : true;
      return matchesSearch && matchesTag && matchesLanguage;
    });

    filtered.sort((a, b) => {
      if (sortBy === "title") {
        const comparison = a.title.localeCompare(b.title);
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortBy === "language") {
        const comparison = a.language.localeCompare(b.language);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return filtered;
  }, [snippets, searchTerm, selectedTag, selectedLanguage, sortBy, sortOrder]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El snippet ha sido copiado al portapapeles.",
    });
  }, [toast]);

  const handleCreate = useCallback(() => {
    setEditingSnippet(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((snippet: Snippet) => {
    setEditingSnippet(snippet);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingSnippet) return;
    try {
      await deleteSnippet.mutateAsync(deletingSnippet.id);
      toast({
        title: "Snippet eliminado",
        description: "El snippet ha sido eliminado correctamente.",
      });
      setDeletingSnippet(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar el snippet.",
        variant: "destructive",
      });
    }
  }, [deletingSnippet, deleteSnippet, toast]);

  const handleView = useCallback((snippet: Snippet) => {
    setViewingSnippet(snippet);
    setDetailOpen(true);
  }, []);

  const handleDeleteClick = useCallback((snippet: Snippet) => {
    setDeletingSnippet(snippet);
  }, []);

  const hasActiveFilters = selectedTag || selectedLanguage || searchTerm;

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Snippets</h1>
            <p className="text-muted-foreground mt-1 text-sm">Código reutilizable para desarrollo.</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Buscar snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Filter Button and Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {filteredSnippets.length > 0 && (
                <span>{filteredSnippets.length} de {snippets.length}</span>
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
                <SnippetCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-sm">Error al cargar los snippets</p>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="text-center py-12">
              <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-semibold mb-2">No se encontraron snippets</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros"
                  : "Crea tu primer snippet"}
              </p>
              {!hasActiveFilters && (
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Snippet
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSnippets.map((snippet) => (
                <MobileSwipeActions
                  key={snippet.id}
                  rightActions={[
                    {
                      label: "Editar",
                      icon: <Edit2 className="h-4 w-4" />,
                      bgColor: "bg-blue-500",
                      onAction: () => handleEdit(snippet),
                    },
                    {
                      label: "Eliminar",
                      icon: <Trash2 className="h-4 w-4" />,
                      bgColor: "bg-destructive",
                      onAction: () => handleDeleteClick(snippet),
                    },
                  ]}
                >
                  <MobileSnippetCard 
                    snippet={snippet} 
                    onView={() => handleView(snippet)}
                    onCopy={() => copyToClipboard(snippet.code)}
                    onEdit={() => handleEdit(snippet)}
                  />
                </MobileSwipeActions>
              ))}
            </div>
          )}

          {/* Forms and Dialogs */}
          <SnippetForm
            open={formOpen}
            onOpenChange={setFormOpen}
            snippet={editingSnippet}
          />

          <DetailView
            open={detailOpen}
            onOpenChange={setDetailOpen}
            type="snippet"
            data={viewingSnippet}
          />

          <AlertDialog open={!!deletingSnippet} onOpenChange={(open) => !open && setDeletingSnippet(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar snippet?</AlertDialogTitle>
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
            <div className="space-y-4">
              {/* Languages */}
              {languages.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Lenguajes</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedLanguage(null)}
                      className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                        !selectedLanguage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      Todos
                    </button>
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                          selectedLanguage === lang
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        {lang}
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
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          selectedTag === tag
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border"
                        }`}
                      >
                        #{tag}
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
                    setSelectedTag(null);
                    setSelectedLanguage(null);
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
        title="Nuevo Snippet"
      />
    </Layout>
  );
}

// Mobile-optimized Snippet Card (without heavy syntax highlighting)
interface MobileSnippetCardProps {
  snippet: Snippet;
  onView: () => void;
  onCopy: () => void;
  onEdit: () => void;
}

const MobileSnippetCard = memo(function MobileSnippetCard({ 
  snippet, 
  onView, 
  onCopy, 
  onEdit 
}: MobileSnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFav = isFavorite("snippet", snippet.id);
  
  // Preview of code (first few lines)
  const codePreview = snippet.code.split('\n').slice(0, 3).join('\n');
  const hasMoreLines = snippet.code.split('\n').length > 3;

  return (
    <div 
      onClick={onView}
      className="rounded-xl border border-border bg-card overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="p-4 border-b border-border/50 bg-secondary/30">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-1">{snippet.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{snippet.description}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite("snippet", snippet.id);
            }}
            className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
              isFav ? "text-yellow-500" : "text-muted-foreground"
            }`}
          >
            <Star className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase">
            {snippet.language}
          </span>
          {snippet.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              #{tag}
            </span>
          ))}
          {snippet.tags && snippet.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{snippet.tags.length - 2}</span>
          )}
        </div>
      </div>
      
      {/* Lightweight code preview */}
      <div className="bg-[#1E1E1E] text-xs p-3 font-mono text-gray-300 max-h-[120px] overflow-hidden relative">
        <pre className="whitespace-pre-wrap break-words">{codePreview}</pre>
        {hasMoreLines && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1E1E1E] to-transparent"></div>
        )}
        {hasMoreLines && (
          <div className="absolute bottom-2 right-2 text-[10px] text-gray-500">
            +{snippet.code.split('\n').length - 3} líneas más
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border/50 bg-secondary/10 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="h-8 text-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <div className="flex gap-2">
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
        </div>
      </div>
    </div>
  );
});
