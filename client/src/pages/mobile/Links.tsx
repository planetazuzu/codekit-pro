/**
 * Mobile-optimized Links Page
 * Simplified version without VirtualizedGrid
 */

import { Layout } from "@/layout/Layout";
import { useState, useMemo, useCallback, memo } from "react";
import { ExternalLink, Plus, Edit2, Trash2, Star, Search, Filter, Link as LinkIcon, Code2 } from "lucide-react";
import { useLinks, useDeleteLink, type Link } from "@/hooks/use-links";
import { LinkForm } from "@/components/forms";
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
import { useToast } from "@/hooks/use-toast";
import { useTrackPageView } from "@/hooks/use-track-view";
import { LinkCardSkeleton } from "@/components/Skeleton";
import { Input } from "@/components/ui/input";
import { Terminal, Palette, Database, Globe, Github, Cloud, BookOpen } from 'lucide-react';

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

export default function MobileLinks() {
  useTrackPageView("page", "links-mobile");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toast } = useToast();
  const { data: links = [], isLoading, error, refetch } = useLinks();
  const deleteLink = useDeleteLink();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["links"] });
  }, [refetch, queryClient]);

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

  const hasActiveFilters = selectedCategory || searchTerm;

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Enlaces</h1>
            <p className="text-muted-foreground mt-1 text-sm">Acceso directo a herramientas esenciales.</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Buscar enlaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Filter Button and Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {filteredLinks.length > 0 && (
                <span>{filteredLinks.length} de {links.length}</span>
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
                <LinkCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-sm">Error al cargar los enlaces</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-semibold mb-2">No se encontraron enlaces</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros"
                  : "Añade tu primer enlace"}
              </p>
              {!hasActiveFilters && (
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Enlace
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => (
                <MobileSwipeActions
                  key={link.id}
                  rightActions={[
                    {
                      label: "Editar",
                      icon: <Edit2 className="h-4 w-4" />,
                      bgColor: "bg-blue-500",
                      onAction: () => handleEdit(link),
                    },
                    {
                      label: "Eliminar",
                      icon: <Trash2 className="h-4 w-4" />,
                      bgColor: "bg-destructive",
                      onAction: () => handleDeleteClick(link),
                    },
                  ]}
                >
                  <MobileLinkCard 
                    link={link}
                    onEdit={() => handleEdit(link)}
                  />
                </MobileSwipeActions>
              ))}
            </div>
          )}

          {/* Forms and Dialogs */}
          <LinkForm
            open={formOpen}
            onOpenChange={setFormOpen}
            link={editingLink}
          />

          <AlertDialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar enlace?</AlertDialogTitle>
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
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Categorías</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setFiltersOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                        !selectedCategory
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      Todas ({links.length})
                    </button>
                    {categories.map((cat) => {
                      const count = links.filter(l => l.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setFiltersOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                            selectedCategory === cat
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border hover:border-primary/50"
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(null);
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
        title="Nuevo Enlace"
      />
    </Layout>
  );
}

// Mobile-optimized Link Card
const MobileLinkCard = memo(function MobileLinkCard({ 
  link, 
  onEdit 
}: { 
  link: Link; 
  onEdit: () => void;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const Icon = link.icon ? iconMap[link.icon] || Code2 : Code2;
  const isFav = isFavorite("link", link.id);

  return (
    <a 
      href={link.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block rounded-xl border border-border bg-card p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2.5 rounded-lg bg-secondary flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-1">{link.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{link.description}</p>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded inline-block">
              {link.category}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite("link", link.id);
          }}
          className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
            isFav ? "text-yellow-500" : "text-muted-foreground"
          }`}
        >
          <Star className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Enlace externo</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          className="h-8 text-xs"
        >
          Editar
        </Button>
      </div>
    </a>
  );
});
