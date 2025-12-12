import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Wrench, 
  BookOpen, 
  Link2, 
  Code, 
  Settings,
  Terminal,
  BarChart3,
  Gift,
  TrendingUp,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: MessageSquare, label: "Prompts", href: "/prompts" },
  { icon: Wrench, label: "Herramientas", href: "/tools" },
  { icon: BookOpen, label: "Guías Visuales", href: "/guides" },
  { icon: FileText, label: "Documentación", href: "/docs" },
  { icon: Link2, label: "Enlaces Rápidos", href: "/links" },
  { icon: Code, label: "Snippets", href: "/snippets" },
  { icon: Settings, label: "APIs y Tokens", href: "/api-guides" },
  { icon: TrendingUp, label: "Recursos", href: "/resources" },
  { icon: Gift, label: "Ofertas", href: "/deals" },
  // Admin oculto - acceso directo por URL /admin con contraseña
];

interface SidebarContentProps {
  onLinkClick?: () => void;
}

function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const [location] = useLocation();

  return (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Terminal className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none tracking-tight">CodeKit Pro</h1>
          <p className="text-xs text-muted-foreground mt-1">Dev Assistant</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-3">
        <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
          <p className="text-xs font-medium text-accent mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>
        </div>
        
        {/* Legal Links */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Link 
            href="/legal"
            onClick={onLinkClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Aviso Legal
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link 
            href="/privacy"
            onClick={onLinkClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacidad
          </Link>
        </div>
      </div>
    </>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  desktopOpen?: boolean;
  onMobileClose?: () => void;
  onDesktopToggle?: () => void;
}

export function Sidebar({ mobileOpen, desktopOpen, onMobileClose, onDesktopToggle }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar - Colapsable */}
      <aside className={cn(
        "hidden md:flex border-r border-border bg-card/50 backdrop-blur-xl h-screen fixed left-0 top-0 flex-col z-50 transition-all duration-300",
        desktopOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="w-64 h-full flex flex-col">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar - Sheet/Drawer */}
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-64 p-0 bg-card/50 backdrop-blur-xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de Navegación</SheetTitle>
          </SheetHeader>
          <div className="h-full flex flex-col">
            <SidebarContent onLinkClick={onMobileClose} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
