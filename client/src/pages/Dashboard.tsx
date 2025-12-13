import { Layout } from "@/layout/Layout";
import { ArrowRight, Sparkles, Wrench, Code2, FileCode, Download, Upload, MessageSquare, Link2, BookOpen, Plus } from "lucide-react";
import { Link } from "wouter";
import { useTrackPageView } from "@/hooks/use-track-view";
import { useExportImport } from "@/hooks/use-export-import";
import { useStats } from "@/hooks/use-stats";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { MobilePullToRefresh, MobileFloatingButton, MobileOnly, DesktopOnly } from "@/components/mobile";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  // Hooks que no deben bloquear el render
  useTrackPageView("page", "dashboard");
  const { exportData, importData } = useExportImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  // Obtener solo contadores (mucho más rápido que cargar todos los datos)
  // Si falla, usar valores por defecto para no bloquear el render
  const { data: stats, refetch: refetchStats } = useStats();
  const promptsCount = stats?.prompts ?? 0;
  const snippetsCount = stats?.snippets ?? 0;
  const linksCount = stats?.links ?? 0;
  const guidesCount = stats?.guides ?? 0;

  const handleRefresh = async () => {
    await refetchStats();
    queryClient.invalidateQueries();
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
    // Reset input para permitir importar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Hero Section */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-4 md:p-8 lg:p-12 shadow-sm">
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 md:px-3 py-1 text-[10px] md:text-xs font-medium text-primary mb-3 md:mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              v2.0 Alpha Release
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 leading-tight">
              Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">CodeKit Pro</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base lg:text-lg mb-4 md:mb-6 leading-relaxed">
              Tu suite de herramientas esencial para el desarrollo asistido por IA. 
              Gestiona prompts, genera assets y optimiza tu flujo de trabajo en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 md:gap-3">
              <Link 
                href="/prompts"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap"
              >
                Explorar Prompts
                <ArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              </Link>
              <Link 
                href="/tools"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap"
              >
                Ver Herramientas
              </Link>
              <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
                <Button
                  onClick={exportData}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial text-xs md:text-sm whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
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
                  className="flex-1 sm:flex-initial text-xs md:text-sm whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                  Importar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 overflow-visible">
          <StatCard
            title="Prompts"
            value={promptsCount}
            icon={MessageSquare}
            href="/prompts"
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            title="Snippets"
            value={snippetsCount}
            icon={Code2}
            href="/snippets"
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
          <StatCard
            title="Enlaces"
            value={linksCount}
            icon={Link2}
            href="/links"
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            title="Guías"
            value={guidesCount}
            icon={BookOpen}
            href="/guides"
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </div>

        {/* Quick Access Grid */}
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card 
            title="Generador de Readme" 
            description="Crea documentación profesional para tus proyectos en segundos."
            icon={FileCode}
            href="/tools/readme"
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <Card 
            title="Biblioteca de Snippets" 
            description="Accede a tu colección personal de código reutilizable."
            icon={Code2}
            href="/snippets"
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
          <Card 
            title="Utilidades CSS" 
            description="Herramientas para colores, sombras y estructuras."
            icon={Wrench}
            href="/tools"
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </div>
        
        {/* Quick Links */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Accesos Rápidos</h3>
          <div className="grid gap-2.5 md:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/prompts"
              className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all group overflow-visible"
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium group-hover:text-primary transition-colors truncate">Biblioteca de Prompts</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
            <Link 
              href="/snippets"
              className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-emerald-500/50 transition-all group overflow-visible"
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
                  <Code2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                </div>
                <span className="text-xs md:text-sm font-medium group-hover:text-emerald-500 transition-colors truncate">Snippets de Código</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
            <Link 
              href="/tools"
              className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-purple-500/50 transition-all group overflow-visible"
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                  <Wrench className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                </div>
                <span className="text-xs md:text-sm font-medium group-hover:text-purple-500 transition-colors truncate">Caja de Herramientas</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
            <Link 
              href="/links"
              className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-blue-500/50 transition-all group overflow-visible"
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                  <Link2 className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                </div>
                <span className="text-xs md:text-sm font-medium group-hover:text-blue-500 transition-colors truncate">Enlaces Rápidos</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
            <Link 
              href="/guides"
              className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-purple-500/50 transition-all group overflow-visible"
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                </div>
                <span className="text-xs md:text-sm font-medium group-hover:text-purple-500 transition-colors truncate">Guías Visuales</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Floating Button */}
      <MobileFloatingButton
        icon={Plus}
        onClick={handleRefresh}
        title="Actualizar"
      />
    </Layout>
  );
}

interface CardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
}

function Card({ title, description, icon: Icon, href, color, bgColor }: CardProps) {
  return (
    <Link 
      href={href}
      className="group rounded-xl border border-border bg-card p-4 md:p-6 transition-all hover:shadow-md hover:shadow-primary/5 hover:border-primary/50 hover:-translate-y-0.5 block cursor-pointer"
    >
      <div className={`mb-3 md:mb-4 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg ${bgColor} ${color} transition-transform group-hover:scale-110`}>
        <Icon className="h-5 w-5 md:h-6 md:w-6" />
      </div>
      <h3 className="mb-1.5 md:mb-2 text-base md:text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Link>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon: Icon, href, color, bgColor }: StatCardProps) {
  return (
    <Link 
      href={href}
      className="group flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-6 rounded-xl bg-card border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 min-h-[100px] md:min-h-[140px] w-full overflow-visible"
    >
      <div className={`p-2 md:p-3 rounded-lg ${bgColor} transition-transform group-hover:scale-110`}>
        <Icon className={`w-6 h-6 md:w-8 md:h-8 ${color}`} />
      </div>
      <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">{title}</span>
      <span className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</span>
    </Link>
  );
}
