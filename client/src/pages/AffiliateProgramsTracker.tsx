/**
 * Affiliate Programs Tracker Page
 * Panel interno para gestionar el estado de los programas de afiliados
 */

import React, { useState, useMemo, useCallback } from "react";
import { Layout } from "@/layout/Layout";
import type {
  AffiliateProgramStatus,
  AffiliateProgramPriority,
  AffiliateProgramIntegrationType,
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
  TrendingUp,
  Calendar,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

const STATUS_COLORS: Record<string, string> = {
  not_requested: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function AffiliateProgramsTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AffiliateProgram | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AffiliateProgram | null>(null);
  const [showInternalNotes, setShowInternalNotes] = useState(false);

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

  // Get unique categories
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
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo sincronizar el programa.";
      toast({
        title: "Error de sincronización",
        description: message,
        variant: "destructive",
      });
    }
  }, [syncProgram, toast]);

  const handleSyncAll = useCallback(async () => {
    try {
      const result = await syncAll.mutateAsync();
      toast({
        title: "Sincronización completada",
        description: `${result.success}/${result.total} programas sincronizados correctamente.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron sincronizar los programas.";
      toast({
        title: "Error de sincronización",
        description: message,
        variant: "destructive",
      });
    }
  }, [syncAll, toast]);

  const handleStatusChange = useCallback(async (program: AffiliateProgram, newStatus: string) => {
    try {
      await updateProgram.mutateAsync({
        id: program.id,
        status: newStatus as AffiliateProgramStatus,
        ...(newStatus === "approved" && !program.approvalDate ? { approvalDate: new Date() } : {}),
        ...(newStatus === "pending" && !program.requestDate ? { requestDate: new Date() } : {}),
      });
      toast({
        title: "Estado actualizado",
        description: `El programa ha sido marcado como ${newStatus}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [updateProgram, toast]);

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Programas de Afiliados</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona el estado y seguimiento de tus programas de afiliados
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSyncAll}
              disabled={syncAll.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncAll.isPending ? "animate-spin" : ""}`} />
              Sincronizar Todos
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Programa
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Programas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aprobados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {stats.byStatus.approved || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Solicitudes Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeekRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aprobaciones Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {stats.thisWeekApprovals}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Bars */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progreso de Solicitudes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Solicitados esta semana</span>
                  <span>{stats.thisWeekRequests}</span>
                </div>
                <Progress
                  value={stats.total > 0 ? (stats.byStatus.approved / stats.total) * 100 : 0}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Aprobados vs Totales</span>
                  <span>
                    {stats.byStatus.approved} / {stats.total}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Por Solicitar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.byStatus.not_requested || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Programas pendientes de solicitar
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="not_requested">No solicitado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {programs.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No hay programas de afiliados"
            description="Crea tu primer programa de afiliados para comenzar a gestionarlos."
            action={
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Programa
              </Button>
            }
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Fecha Aprobación</TableHead>
                  <TableHead>Última Sincronización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        {program.tags && program.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {program.tags.slice(0, 2).map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[program.status] || STATUS_COLORS.not_requested}>
                        {program.status === "not_requested" && "No solicitado"}
                        {program.status === "pending" && "Pendiente"}
                        {program.status === "approved" && "Aprobado"}
                        {program.status === "rejected" && "Rechazado"}
                        {program.status === "inactive" && "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PRIORITY_COLORS[program.priority || "medium"]}>
                        {program.priority === "high" && "Alta"}
                        {program.priority === "medium" && "Media"}
                        {program.priority === "low" && "Baja"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {program.requestDate
                        ? new Date(program.requestDate).toLocaleDateString("es-ES")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {program.approvalDate
                        ? new Date(program.approvalDate).toLocaleDateString("es-ES")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {program.lastSyncAt
                        ? new Date(program.lastSyncAt).toLocaleDateString("es-ES")
                        : "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(program)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {program.integrationType !== "manual" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSync(program.id)}
                            disabled={syncProgram.isPending}
                          >
                            <RefreshCw className={`h-4 w-4 ${syncProgram.isPending ? "animate-spin" : ""}`} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(program)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Form Dialog */}
        <ProgramFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          program={selectedProgram}
          onCreate={createProgram}
          onUpdate={updateProgram}
          toast={toast}
        />

        {/* Detail Dialog */}
        <ProgramDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          program={selectedProgram}
          onStatusChange={handleStatusChange}
          showInternalNotes={showInternalNotes}
          onToggleInternalNotes={() => setShowInternalNotes(!showInternalNotes)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Eliminar Programa"
          description={`¿Estás seguro de que quieres eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        />
      </div>
    </Layout>
  );
}

// Form Dialog Component
function ProgramFormDialog({
  open,
  onOpenChange,
  program,
  onCreate,
  onUpdate,
  toast,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: AffiliateProgram | null;
  onCreate: ReturnType<typeof useCreateAffiliateProgram>;
  onUpdate: ReturnType<typeof useUpdateAffiliateProgram>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [formData, setFormData] = useState<Partial<InsertAffiliateProgram>>({
    name: "",
    category: "",
    registrationUrl: "",
    dashboardUrl: "",
    status: "not_requested",
    priority: "medium",
    integrationType: "manual",
    notes: "",
    tags: [],
    integrationConfig: "",
    internalNotes: "",
  });

  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (program) {
        await onUpdate.mutateAsync({
          id: program.id,
          ...formData,
        });
        toast({
          title: "Programa actualizado",
          description: "El programa ha sido actualizado correctamente.",
        });
      } else {
        await onCreate.mutateAsync(formData as InsertAffiliateProgram);
        toast({
          title: "Programa creado",
          description: "El programa ha sido creado correctamente.",
        });
      }
      onOpenChange(false);
      setFormData({
        name: "",
        category: "",
        registrationUrl: "",
        dashboardUrl: "",
        status: "not_requested",
        priority: "medium",
        integrationType: "manual",
        notes: "",
        tags: [],
        integrationConfig: "",
        internalNotes: "",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Hubo un error al guardar el programa.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  // Reset form when program changes
  React.useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        category: program.category,
        registrationUrl: program.registrationUrl || "",
        dashboardUrl: program.dashboardUrl || "",
        status: program.status,
        priority: program.priority || "medium",
        integrationType: program.integrationType || "manual",
        notes: program.notes || "",
        tags: program.tags || [],
        integrationConfig: program.integrationConfig || "",
        internalNotes: program.internalNotes || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        registrationUrl: "",
        dashboardUrl: "",
        status: "not_requested",
        priority: "medium",
        integrationType: "manual",
        notes: "",
        tags: [],
        integrationConfig: "",
        internalNotes: "",
      });
    }
  }, [program, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {program ? "Editar Programa" : "Nuevo Programa de Afiliados"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Programa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="registrationUrl">URL de Registro</Label>
            <Input
              id="registrationUrl"
              type="url"
              value={formData.registrationUrl}
              onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="dashboardUrl">URL del Panel de Seguimiento</Label>
            <Input
              id="dashboardUrl"
              type="url"
              value={formData.dashboardUrl}
              onChange={(e) => setFormData({ ...formData, dashboardUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as AffiliateProgramStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_requested">No solicitado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as AffiliateProgramPriority,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="integrationType">Tipo de Integración</Label>
              <Select
                value={formData.integrationType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    integrationType: value as AffiliateProgramIntegrationType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="impact">Impact</SelectItem>
                  <SelectItem value="partnerstack">PartnerStack</SelectItem>
                  <SelectItem value="awin">Awin</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.integrationType !== "manual" && (
            <div>
              <Label htmlFor="integrationConfig">
                Configuración de Integración (JSON)
              </Label>
              <Textarea
                id="integrationConfig"
                value={formData.integrationConfig}
                onChange={(e) => setFormData({ ...formData, integrationConfig: e.target.value })}
                placeholder='{"apiKey": "...", "apiSecret": "..."}'
                className="font-mono text-xs"
              />
            </div>
          )}

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Añadir tag..."
              />
              <Button type="button" onClick={addTag} variant="outline">
                Añadir
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="internalNotes">Notas Internas (Sensible)</Label>
            <Textarea
              id="internalNotes"
              value={formData.internalNotes}
              onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
              rows={2}
              placeholder="Contraseñas, usuarios, etc."
              className="font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={onCreate.isPending || onUpdate.isPending}>
              {program ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Detail Dialog Component
function ProgramDetailDialog({
  open,
  onOpenChange,
  program,
  onStatusChange,
  showInternalNotes,
  onToggleInternalNotes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: AffiliateProgram | null;
  onStatusChange: (program: AffiliateProgram, status: string) => void;
  showInternalNotes: boolean;
  onToggleInternalNotes: () => void;
}) {
  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{program.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Categoría</Label>
              <div className="mt-1">
                <Badge variant="outline">{program.category}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Estado</Label>
              <div className="mt-1">
                <Badge className={STATUS_COLORS[program.status] || STATUS_COLORS.not_requested}>
                  {program.status === "not_requested" && "No solicitado"}
                  {program.status === "pending" && "Pendiente"}
                  {program.status === "approved" && "Aprobado"}
                  {program.status === "rejected" && "Rechazado"}
                  {program.status === "inactive" && "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>

          {program.registrationUrl && (
            <div>
              <Label className="text-muted-foreground">URL de Registro</Label>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={program.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {program.registrationUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {program.dashboardUrl && (
            <div>
              <Label className="text-muted-foreground">URL del Panel</Label>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={program.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {program.dashboardUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {program.notes && (
            <div>
              <Label className="text-muted-foreground">Notas</Label>
              <div className="mt-1 text-sm">{program.notes}</div>
            </div>
          )}

          {program.internalNotes && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-muted-foreground">Notas Internas</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleInternalNotes}
                >
                  {showInternalNotes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {showInternalNotes ? (
                <div className="mt-1 text-sm font-mono bg-muted p-2 rounded">
                  {program.internalNotes}
                </div>
              ) : (
                <div className="mt-1 text-sm text-muted-foreground">
                  ••••••••••••••••
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(program, "pending")}
              disabled={program.status === "pending"}
            >
              <Clock className="h-4 w-4 mr-2" />
              Marcar como Pendiente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(program, "approved")}
              disabled={program.status === "approved"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Aprobado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

