/**
 * Mobile-optimized Dashboard Page
 * Simplified version for better mobile performance
 */

import { Layout } from "@/layout/Layout";
import { ArrowRight, Sparkles, Wrench, Code2, FileCode, Download, Upload, MessageSquare, Link2, BookOpen, Plus } from "lucide-react";
import { Link } from "wouter";
import { useTrackPageView } from "@/hooks/use-track-view";
import { useExportImport } from "@/hooks/use-export-import";
import { useStats } from "@/hooks/use-stats";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { MobilePullToRefresh, MobileFloatingButton } from "@/components/mobile";
import { useQueryClient } from "@tanstack/react-query";

export default function MobileDashboard() {
  useTrackPageView("page", "dashboard-mobile");
  const { exportData, importData } = useExportImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  // Stats con valores por defecto para evitar bloqueos
  const { data: stats = { prompts: 0, snippets: 0, links: 0, guides: 0 }, refetch: refetchStats } = useStats();
  const promptsCount = stats.prompts;
  const snippetsCount = stats.snippets;
  const linksCount = stats.links;
  const guidesCount = stats.guides;

  const handleRefresh = async () => {
    try {
      await refetchStats();
      queryClient.invalidateQueries();
    } catch (error) {
      console.warn("Error refreshing dashboard:", error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importData(file, { skipDuplicates: true });
      } catch (error) {
        // Error already handled in hook
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <Layout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4 pb-20">
          {/* Hero Section - Simplified for mobile */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-sm">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary mb-3">
              <Sparkles className="mr-1 h-3 w-3" />
              v2.0 Alpha
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3 leading-tight">
              Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">CodeKit Pro</span>
            </h1>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Herramientas esenciales para desarrollo asistido por IA.
            </p>
            <div className="flex flex-col gap-2">
              <Link 
                href="/prompts"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90"
              >
                Explorar Prompts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/tools"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-accent"
              >
                Ver Herramientas
              </Link>
              <div className="flex gap-2">
                <Button
                  onClick={exportData}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Exportar
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Importar
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards - 2x2 grid for mobile */}
          <div className="grid grid-cols-2 gap-3">
            <MobileStatCard
              title="Prompts"
              value={promptsCount}
              icon={MessageSquare}
              href="/prompts"
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <MobileStatCard
              title="Snippets"
              value={snippetsCount}
              icon={Code2}
              href="/snippets"
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <MobileStatCard
              title="Enlaces"
              value={linksCount}
              icon={Link2}
              href="/links"
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <MobileStatCard
              title="Guías"
              value={guidesCount}
              icon={BookOpen}
              href="/guides"
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
          </div>

          {/* Quick Access - Single column for mobile */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold px-1">Accesos Rápidos</h3>
            <MobileQuickLink 
              href="/prompts"
              icon={MessageSquare}
              label="Biblioteca de Prompts"
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <MobileQuickLink 
              href="/snippets"
              icon={Code2}
              label="Snippets de Código"
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <MobileQuickLink 
              href="/tools"
              icon={Wrench}
              label="Caja de Herramientas"
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
            <MobileQuickLink 
              href="/links"
              icon={Link2}
              label="Enlaces Rápidos"
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <MobileQuickLink 
              href="/guides"
              icon={BookOpen}
              label="Guías Visuales"
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
          </div>
        </div>
      </MobilePullToRefresh>

      {/* Mobile Floating Button */}
      <MobileFloatingButton
        icon={Plus}
        onClick={handleRefresh}
        title="Actualizar"
      />
    </Layout>
  );
}

interface MobileStatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
}

function MobileStatCard({ title, value, icon: Icon, href, color, bgColor }: MobileStatCardProps) {
  return (
    <Link 
      href={href}
      className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border shadow-sm transition-all active:scale-95 active:shadow-md"
    >
      <div className={`p-2 rounded-lg ${bgColor} transition-transform group-active:scale-110`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center">{title}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </Link>
  );
}

interface MobileQuickLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
}

function MobileQuickLink({ href, icon: Icon, label, color, bgColor }: MobileQuickLinkProps) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 active:bg-secondary/50 border border-border/50 active:border-primary/50 transition-all"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`p-2 rounded-lg ${bgColor} flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
    </Link>
  );
}
