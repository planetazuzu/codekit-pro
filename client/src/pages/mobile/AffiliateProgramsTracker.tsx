/**
 * Mobile-optimized AffiliateProgramsTracker Page
 * Simplified version with cards instead of tables
 */

import React, { useState, useMemo, useCallback } from "react";
import { Layout } from "@/layout/Layout";
import type {
  AffiliateProgramStatus,
  AffiliateProgramPriority,
} from "@shared/types";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/common/BackButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/hooks/use-toast";
import {
  useAffiliatePrograms,
  useAffiliateProgramsStats,
  useCreateAffiliateProgram,
  useUpdateAffiliateProgram,
  useDeleteAffiliateProgram,
  useSyncAffiliateProgram,
  useSyncAllAffiliatePrograms,
  type AffiliateProgram,
  type InsertAffiliateProgram,
} from "@/hooks/use-affiliate-programs";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MobilePullToRefresh, MobileFloatingButton, MobileBottomSheet } from "@/components/mobile";

const STATUS_COLORS: Record<string, string> = {
  not_requested: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const STATUS_ICONS: Record<string, any> = {
  not_requested: AlertCircle,
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  inactive: AlertCircle,
};

export default function MobileAffiliateProgramsTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AffiliateProgram | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AffiliateProgram | null>(null);
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { toast } = useToast();

  const filters = useMemo(() => ({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    search: searchTerm || undefined,
  }), [categoryFilter, statusFilter, priorityFilter, searchTerm]);

  const { data: programs = [], isLoading } = useAffiliatePrograms(filters);
  const { data: stats } = useAffiliateProgramsStats();
  const createProgram = useCreateAffiliateProgram();
  const updateProgram = useUpdateAffiliateProgram();
  const deleteProgram = useDeleteAffiliateProgram();
  const syncProgram = useSyncAffiliateProgram();
  const syncAll = useSyncAllAffiliatePrograms();

  const categories = useMemo(() => {
    const cats = new Set<string>();
    programs.forEach((p) => cats.add(p.category));
    return Array.from(cats).sort();
  }, [programs]);

  const handleCreate = useCallback(() => {
    setSelectedProgram(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((program: AffiliateProgram) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((program: AffiliateProgram) => {
    setSelectedProgram(program);
    setIsDetailOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteProgram.mutateAsync(deleteTarget.id);
      toast({
        title: "Programa eliminado",
        description: "El programa de afiliados ha sido eliminado correctamente.",
      });
      setDeleteTarget(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar el programa.",
        variant: "destructive",
      });
    }
  }, [deleteTarget, deleteProgram, toast]);

  const handleSync = useCallback(async (programId: string) => {
    try {
      await syncProgram.mutateAsync(programId);
      toast({
        title: "Sincronización completada",
        description: "Los datos del programa han sido actualizados.",
      });
    } catch (error) {
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar el programa.",
        variant: "destructive",
      });
    }
  }, [syncProgram, toast]);

  const hasActiveFilters = categoryFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" || searchTerm;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Tracker de Afiliados</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona programas de afiliados
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar programas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className={hasActiveFilters ? "border-primary text-primary" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-2 gap-2">
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{stats.total || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-xs text-muted-foreground">Aprobados</p>
                  <p className="text-xl font-bold text-green-400">{stats.byStatus.approved || 0}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sync All Button */}
          <Button
            variant="outline"
            onClick={() => syncAll.mutate()}
            disabled={syncAll.isPending}
            className="w-full"
            size="sm"
          >
            {syncAll.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar Todos
              </>
            )}
          </Button>

          {/* Programs List */}
          {programs.length > 0 ? (
            <div className="space-y-3">
              {programs.map((program) => {
                const StatusIcon = STATUS_ICONS[program.status] || AlertCircle;
                return (
                  <Card key={program.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-2 line-clamp-1">
                            {program.name}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={STATUS_COLORS[program.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {program.status}
                            </Badge>
                            <Badge variant="outline">{program.category}</Badge>
                            {program.priority && (
                              <Badge variant="outline" className="text-xs">
                                {program.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {program.url && (
                        <div className="mb-3">
                          <a
                            href={program.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver programa
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(program)}
                          className="h-8 flex-1"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSync(program.id)}
                          className="h-8 flex-1"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                          Sync
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(program)}
                          className="h-8"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(program)}
                          className="h-8 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Tag}
              title="No hay programas"
              description="Añade tu primer programa de afiliados para empezar."
              action={
                <Button onClick={handleCreate} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir programa
                </Button>
              }
            />
          )}

          {/* Detail Dialog - Simplified */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedProgram?.name}</DialogTitle>
              </DialogHeader>
              {selectedProgram && (
                <div className="space-y-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge className={STATUS_COLORS[selectedProgram.status]}>
                        {selectedProgram.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Categoría</Label>
                    <p className="mt-1">{selectedProgram.category}</p>
                  </div>
                  {selectedProgram.url && (
                    <div>
                      <Label className="text-xs text-muted-foreground">URL</Label>
                      <a
                        href={selectedProgram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {selectedProgram.url}
                      </a>
                    </div>
                  )}
                  {selectedProgram.notes && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Notas</Label>
                      <p className="mt-1">{selectedProgram.notes}</p>
                    </div>
                  )}
                  {selectedProgram.internalNotes && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs text-muted-foreground">Notas Internas</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowInternalNotes(!showInternalNotes)}
                        >
                          {showInternalNotes ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                      {showInternalNotes && (
                        <p className="mt-1 text-xs">{selectedProgram.internalNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Filters Bottom Sheet */}
          <MobileBottomSheet
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title="Filtros"
          >
            <div className="space-y-4 pb-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Categoría</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="not_requested">No solicitado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Prioridad</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setPriorityFilter("all");
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

          {/* Delete Confirmation */}
          <ConfirmDialog
            open={!!deleteTarget}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Eliminar programa"
            description={`¿Estás seguro de que quieres eliminar "${deleteTarget?.name}"?`}
            onConfirm={handleDelete}
            confirmText="Eliminar"
            variant="destructive"
          />
        </div>
      </MobilePullToRefresh>

      {/* Floating Button */}
      <MobileFloatingButton
        icon={Plus}
        onClick={handleCreate}
        title="Nuevo Programa"
      />
    </Layout>
  );
}
