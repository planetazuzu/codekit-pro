import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { Search, Copy, Check, Loader2, Plus, Edit2, Trash2, Star, Code, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSnippets, useDeleteSnippet, type Snippet } from "@/hooks/use-snippets";
import { SnippetForm } from "@/components/forms";
import { DetailView } from "@/components/DetailView";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { useFavorites } from "@/hooks/use-favorites";
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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTrackPageView } from "@/hooks/use-track-view";
import { SnippetCardSkeleton } from "@/components/Skeleton";

export default function Snippets() {
  useTrackPageView("page", "snippets");
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
  const { toast } = useToast();
  const { data: snippets = [], isLoading, error } = useSnippets();
  const deleteSnippet = useDeleteSnippet();

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

    // Ordenar
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Snippets de Código</h1>
            <p className="text-muted-foreground mt-1">Trozos de código reutilizables para acelerar tu desarrollo.</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar snippets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Snippet
            </Button>
          </div>
        </div>

        {/* Filters */}
        {(allTags.length > 0 || languages.length > 0) && (
          <div className="space-y-3">
            {/* Languages */}
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground self-center">Lenguajes:</span>
                <button 
                  onClick={() => setSelectedLanguage(null)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${!selectedLanguage ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                >
                  Todos
                </button>
                {languages.map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedLanguage === lang ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
            
            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground self-center">Tags:</span>
                <button 
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${!selectedTag ? 'bg-secondary text-foreground border-border' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                >
                  Todos
                </button>
                {allTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTag === tag ? 'bg-primary/20 text-primary border-primary/50' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
            
            {/* Results count and sort */}
            <div className="flex items-center justify-between">
              {filteredSnippets.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredSnippets.length} de {snippets.length} snippets
                </div>
              )}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "title" | "date" | "language")}
                  className="text-xs bg-card border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="date">Fecha</option>
                  <option value="title">Título</option>
                  <option value="language">Lenguaje</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-1.5 rounded-md border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title={`Ordenar ${sortOrder === "asc" ? "descendente" : "ascendente"}`}
                >
                  {sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SnippetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Error al cargar los snippets. Por favor, intenta de nuevo.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSnippets.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Code className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedTag || selectedLanguage ? "No se encontraron snippets" : "No hay snippets disponibles"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedTag || selectedLanguage 
                ? "Intenta con otros términos de búsqueda o filtros."
                : "Crea tu primer snippet para comenzar a construir tu biblioteca de código reutilizable."}
            </p>
            {!searchTerm && !selectedTag && !selectedLanguage && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Snippet
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && filteredSnippets.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredSnippets.map((snippet) => (
              <SnippetCard 
                key={snippet.id} 
                snippet={snippet} 
                onView={() => handleView(snippet)}
                onCopy={() => copyToClipboard(snippet.code)}
                onEdit={() => handleEdit(snippet)}
                onDelete={() => handleDeleteClick(snippet)}
              />
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <SnippetForm
          open={formOpen}
          onOpenChange={setFormOpen}
          snippet={editingSnippet}
        />

        {/* Detail View */}
        <DetailView
          open={detailOpen}
          onOpenChange={setDetailOpen}
          type="snippet"
          data={viewingSnippet}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingSnippet} onOpenChange={(open) => !open && setDeletingSnippet(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar snippet?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El snippet "{deletingSnippet?.title}" será eliminado permanentemente.
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
      </div>
    </Layout>
  );
}

const SnippetCard = memo(function SnippetCard({ 
  snippet, 
  onView,
  onCopy, 
  onEdit, 
  onDelete 
}: { 
  snippet: Snippet; 
  onView: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite("snippet", snippet.id);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col group cursor-pointer" onClick={onView}>
      <div className="p-4 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{snippet.title}</h3>
          <p className="text-xs text-muted-foreground">{snippet.description}</p>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 uppercase">
            {snippet.language}
          </span>
          <button 
            onClick={() => toggleFavorite("snippet", snippet.id)}
            className={`transition-colors p-2 rounded-md hover:bg-secondary ${
              isFav 
                ? "text-yellow-500" 
                : "text-muted-foreground hover:text-yellow-500 opacity-0 group-hover:opacity-100"
            }`}
            title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Star className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>
          <button 
            onClick={onView}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={onEdit}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
            title="Editar"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button 
            onClick={handleCopy}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Copiar"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex-1 bg-[#1E1E1E] text-sm overflow-hidden relative group">
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          <SyntaxHighlighter 
            language={snippet.language} 
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      </div>
      <div className="p-3 border-t border-border/50 bg-secondary/10 flex gap-2 overflow-x-auto">
        {snippet.tags?.map((tag: string) => (
          <span key={tag} className="text-[10px] text-muted-foreground bg-background px-2 py-1 rounded border border-border">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
});
