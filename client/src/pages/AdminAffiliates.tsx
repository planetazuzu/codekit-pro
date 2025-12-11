/**
 * Admin Panel for Affiliates Management
 */

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  BarChart3,
  TrendingUp,
  MousePointer,
  Copy,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { AffiliateEditorForm } from "@/components/affiliates/AffiliateEditorForm";
import { AffiliateStats, AffiliateClicksChart } from "@/components/affiliates/AffiliateStats";
import { Layout } from "@/layout/Layout";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { BackButton } from "@/components/common/BackButton";
import {
  useAffiliates,
  useCreateAffiliate,
  useUpdateAffiliate,
  useDeleteAffiliate,
  useAffiliateStats,
} from "@/hooks/use-affiliates";
import { useToast } from "@/hooks/use-toast";
import { getAffiliateShortlink, getAffiliateCategoryColor } from "@/lib/affiliate-utils";
import type { Affiliate, InsertAffiliate } from "@shared/schema";
import QRCode from "qrcode";

export default function AdminAffiliates() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Affiliate | null>(null);
  const [qrAffiliate, setQrAffiliate] = useState<Affiliate | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: affiliates, isLoading } = useAffiliates();
  const { data: globalStats } = useAffiliateStats();
  const createAffiliate = useCreateAffiliate();
  const updateAffiliate = useUpdateAffiliate();
  const deleteAffiliate = useDeleteAffiliate();
  const { toast } = useToast();

  // Filter affiliates
  const filteredAffiliates = affiliates?.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: InsertAffiliate) => {
    await createAffiliate.mutateAsync(data);
    toast({
      title: "Afiliado creado",
      description: `${data.name} ha sido añadido correctamente.`,
    });
  };

  const handleUpdate = async (data: InsertAffiliate) => {
    if (!selectedAffiliate) return;
    await updateAffiliate.mutateAsync({ ...data, id: selectedAffiliate.id });
    toast({
      title: "Afiliado actualizado",
      description: `${data.name} ha sido actualizado correctamente.`,
    });
    setSelectedAffiliate(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAffiliate.mutateAsync(deleteTarget.id);
    toast({
      title: "Afiliado eliminado",
      description: `${deleteTarget.name} ha sido eliminado.`,
    });
    setDeleteTarget(null);
  };

  const handleCopyShortlink = async (affiliate: Affiliate) => {
    const shortlink = `${window.location.origin}${getAffiliateShortlink(affiliate)}`;
    await navigator.clipboard.writeText(shortlink);
    toast({
      title: "Enlace copiado",
      description: shortlink,
    });
  };

  const handleGenerateQR = async (affiliate: Affiliate) => {
    const shortlink = `${window.location.origin}${getAffiliateShortlink(affiliate)}`;
    try {
      const dataUrl = await QRCode.toDataURL(shortlink, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
      setQrAffiliate(affiliate);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !qrAffiliate) return;
    const link = document.createElement("a");
    link.download = `${qrAffiliate.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestión de Afiliados
          </h1>
          <p className="text-muted-foreground">
            Administra tus enlaces de afiliados y métricas
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Afiliado
        </Button>
      </div>

      {/* Stats Overview */}
      <AffiliateStats />

      {/* Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AffiliateClicksChart />
        
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Mejores Afiliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates && affiliates.length > 0 ? (
              <div className="space-y-3">
                {affiliates.slice(0, 5).map((affiliate, index) => (
                  <div
                    key={affiliate.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{affiliate.name}</span>
                    </div>
                    <Badge variant="outline" className={getAffiliateCategoryColor(affiliate.category)}>
                      {affiliate.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay afiliados aún
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar afiliados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          {filteredAffiliates?.length || 0} afiliados
        </p>
      </div>

      {/* Affiliates Table */}
      {filteredAffiliates && filteredAffiliates.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Shortlink</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">{affiliate.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getAffiliateCategoryColor(affiliate.category)}>
                      {affiliate.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {affiliate.commission ? (
                      <span className="text-green-400">{affiliate.commission}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {affiliate.code ? (
                      <code className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded text-xs">
                        {affiliate.code}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground">
                      /go/{affiliate.name.toLowerCase().replace(/\s+/g, "-")}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyShortlink(affiliate)}
                        title="Copiar shortlink"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateQR(affiliate)}
                        title="Generar QR"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(affiliate.url, "_blank")}
                        title="Abrir enlace"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setIsFormOpen(true);
                        }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(affiliate)}
                        title="Eliminar"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No hay afiliados"
          description="Añade tu primer enlace de afiliado para empezar a monetizar."
          action={
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir afiliado
            </Button>
          }
        />
      )}

      {/* Editor Form */}
      <AffiliateEditorForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedAffiliate(null);
        }}
        affiliate={selectedAffiliate}
        onSubmit={selectedAffiliate ? handleUpdate : handleCreate}
        isSubmitting={createAffiliate.isPending || updateAffiliate.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar afiliado"
        description={`¿Estás seguro de que quieres eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        confirmText="Eliminar"
        variant="destructive"
      />

      {/* QR Dialog */}
      <Dialog open={!!qrAffiliate} onOpenChange={(open) => !open && setQrAffiliate(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Código QR - {qrAffiliate?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrDataUrl && (
              <img src={qrDataUrl} alt={`QR ${qrAffiliate?.name}`} className="rounded-lg" />
            )}
            <p className="text-sm text-muted-foreground">
              {window.location.origin}{qrAffiliate && getAffiliateShortlink(qrAffiliate)}
            </p>
            <Button onClick={handleDownloadQR}>
              Descargar QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}

