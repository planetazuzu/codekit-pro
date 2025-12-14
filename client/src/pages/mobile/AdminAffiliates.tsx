/**
 * Mobile-optimized AdminAffiliates Page
 * Simplified version with cards instead of tables
 */

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Copy,
  QrCode,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AffiliateEditorForm } from "@/components/affiliates/AffiliateEditorForm";
import { AffiliateStats } from "@/components/affiliates/AffiliateStats";
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
} from "@/hooks/use-affiliates";
import { useToast } from "@/hooks/use-toast";
import { getAffiliateShortlink, getAffiliateCategoryColor } from "@/lib/affiliate-utils";
import type { Affiliate, InsertAffiliate } from "@shared/schema";
import QRCode from "qrcode";
import { MobilePullToRefresh, MobileFloatingButton } from "@/components/mobile";

export default function MobileAdminAffiliates() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Affiliate | null>(null);
  const [qrAffiliate, setQrAffiliate] = useState<Affiliate | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: affiliates, isLoading } = useAffiliates();
  const createAffiliate = useCreateAffiliate();
  const updateAffiliate = useUpdateAffiliate();
  const deleteAffiliate = useDeleteAffiliate();
  const { toast } = useToast();

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
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Gestión de Afiliados</h1>
            <p className="text-sm text-muted-foreground">
              Administra tus enlaces de afiliados
            </p>
          </div>

          {/* Stats Overview - Simplified */}
          <AffiliateStats />

          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Buscar afiliados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-xs text-muted-foreground">
            {filteredAffiliates?.length || 0} afiliados
          </div>

          {/* Affiliates List - Cards instead of table */}
          {filteredAffiliates && filteredAffiliates.length > 0 ? (
            <div className="space-y-3">
              {filteredAffiliates.map((affiliate) => (
                <Card key={affiliate.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 line-clamp-1">
                          {affiliate.name}
                        </h3>
                        <Badge variant="outline" className={getAffiliateCategoryColor(affiliate.category)}>
                          {affiliate.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      {affiliate.commission && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Comisión:</span>
                          <span className="font-medium text-green-400">{affiliate.commission}</span>
                        </div>
                      )}
                      {affiliate.code && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Código:</span>
                          <code className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded text-xs">
                            {affiliate.code}
                          </code>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Shortlink:</span>
                        <code className="text-xs text-muted-foreground truncate max-w-[150px]">
                          /go/{affiliate.name.toLowerCase().replace(/\s+/g, "-")}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyShortlink(affiliate)}
                        className="h-8 flex-1"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copiar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateQR(affiliate)}
                        className="h-8 flex-1"
                      >
                        <QrCode className="h-3.5 w-3.5 mr-1.5" />
                        QR
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(affiliate.url, "_blank")}
                        className="h-8"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setIsFormOpen(true);
                        }}
                        className="h-8"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(affiliate)}
                        className="h-8 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No hay afiliados"
              description="Añade tu primer enlace de afiliado para empezar a monetizar."
              action={
                <Button onClick={() => setIsFormOpen(true)} size="sm">
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
                <p className="text-sm text-muted-foreground break-all">
                  {window.location.origin}{qrAffiliate && getAffiliateShortlink(qrAffiliate)}
                </p>
                <Button onClick={handleDownloadQR} size="sm">
                  Descargar QR
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </MobilePullToRefresh>

      {/* Floating Button */}
      <MobileFloatingButton
        icon={Plus}
        onClick={() => setIsFormOpen(true)}
        title="Nuevo Afiliado"
      />
    </Layout>
  );
}
