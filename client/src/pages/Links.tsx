import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { ExternalLink, Loader2, Plus, Edit2, Trash2, Star, Search } from "lucide-react";
import { useLinks, useDeleteLink, type Link } from "@/hooks/use-links";
import { LinkForm } from "@/components/forms";
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
import { useToast } from "@/hooks/use-toast";
import { useTrackPageView } from "@/hooks/use-track-view";
import { LinkCardSkeleton } from "@/components/Skeleton";
import { Code2, Terminal, Palette, Database, Globe, Github, Cloud, Link as LinkIcon, BookOpen } from 'lucide-react';
import { VirtualizedGrid } from "@/components/common";

// Icon mapping for links
const iconMap: Record<string, any> = {
  Terminal,
  Code2,
  Palette,
  Database,
  Globe,
  Github,
  Cloud,
  Link: LinkIcon,
  BookOpen,
};

export default function Links() {
  useTrackPageView("page", "links");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { data: links = [], isLoading, error } = useLinks();
  const deleteLink = useDeleteLink();

  const categories = useMemo(() => {
    return Array.from(new Set(links.map(l => l.category)));
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = searchTerm === "" || 
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? link.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [links, searchTerm, selectedCategory]);

  const handleCreate = useCallback(() => {
    setEditingLink(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((link: Link) => {
    setEditingLink(link);
    setFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((link: Link) => {
    setDeletingLink(link);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingLink) return;
    try {
      await deleteLink.mutateAsync(deletingLink.id);
      toast({
        title: "Enlace eliminado",
        description: "El enlace ha sido eliminado correctamente.",
      });
      setDeletingLink(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar el enlace.",
        variant: "destructive",
      });
    }
  }, [deletingLink, deleteLink, toast]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enlaces Rápidos</h1>
            <p className="text-muted-foreground mt-1">Acceso directo a las herramientas esenciales del ecosistema.</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar enlaces..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Enlace
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <LinkCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Error al cargar los enlaces. Por favor, intenta de nuevo.</p>
          </div>
        )}

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
              >
                Todos ({filteredLinks.length})
              </button>
              {categories.map(cat => {
                const count = links.filter(l => l.category === cat).length;
                return (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            
            {/* Results count */}
            {filteredLinks.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredLinks.length} de {links.length} enlaces
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredLinks.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedCategory ? "No se encontraron enlaces" : "No hay enlaces disponibles"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory 
                ? "Intenta con otros términos de búsqueda o filtros."
                : "Añade tu primer enlace para comenzar a construir tu biblioteca de recursos."}
            </p>
            {!searchTerm && !selectedCategory && (
              <Button onClick={() => { setEditingLink(null); setFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Enlace
              </Button>
            )}
          </div>
        )}

        {/* Grid - Virtualized for large lists */}
        {!isLoading && !error && filteredLinks.length > 0 && (
          <>
            {filteredLinks.length > 50 ? (
              <VirtualizedGrid
                items={filteredLinks}
                height={600}
                itemHeight={280}
                columnCount={4}
                gap={24}
                renderItem={(link) => (
                  <LinkCard 
                    link={link}
                    onEdit={() => handleEdit(link)}
                    onDelete={() => handleDeleteClick(link)}
                  />
                )}
                emptyMessage="No hay enlaces para mostrar"
                emptyIcon={LinkIcon}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLinks.map((link) => (
                  <LinkCard 
                    key={link.id} 
                    link={link}
                    onEdit={() => handleEdit(link)}
                    onDelete={() => handleDeleteClick(link)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Form Dialog */}
        <LinkForm
          open={formOpen}
          onOpenChange={setFormOpen}
          link={editingLink}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar enlace?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El enlace "{deletingLink?.title}" será eliminado permanentemente.
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

const LinkCard = memo(function LinkCard({ link, onEdit, onDelete }: { link: Link; onEdit: () => void; onDelete: () => void }) {
  const Icon = link.icon ? iconMap[link.icon] || Code2 : Code2;
  
  return (
    <div className="group relative flex flex-col p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <FavoriteButton type="link" id={link.id} />
        <button
          onClick={(e) => { e.preventDefault(); onEdit(); }}
          className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
          title="Editar"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <a 
        href={link.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col flex-1"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
          <p className="text-sm text-muted-foreground">{link.description}</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">
            {link.category}
          </span>
        </div>
      </a>
    </div>
  );
});

const FavoriteButton = memo(function FavoriteButton({ type, id }: { type: "link"; id: string }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(type, id);

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggleFavorite(type, id); }}
      className={`p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border hover:bg-secondary transition-colors ${
        isFav 
          ? "text-yellow-500" 
          : "text-muted-foreground hover:text-yellow-500"
      }`}
      title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Star className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
    </button>
  );
});
