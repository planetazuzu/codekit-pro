import { Sidebar } from "./Sidebar";
import { Search, Bell, User, Menu, Home, MessageSquare, Wrench, BookOpen, Link2, Code, Settings, TrendingUp, Gift } from "lucide-react";
import { SearchCommand } from "@/components/SearchCommand";
import { lazy, Suspense } from "react";
import { useState } from "react";

// Lazy load banners para mejorar rendimiento en móvil
const CookieBanner = lazy(() => import("@/components/common/CookieBanner").then(m => ({ default: m.CookieBanner })));
const AffiliateDisclaimer = lazy(() => import("@/components/common/AffiliateDisclaimer").then(m => ({ default: m.AffiliateDisclaimer })));
const SalesBanner = lazy(() => import("@/components/common/SalesBanner").then(m => ({ default: m.SalesBanner })));
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout Component
 * 
 * ⚠️ ANTI-REGRESSION WARNING ⚠️
 * ==============================
 * 
 * This layout uses CSS (Tailwind) for responsive design, NOT conditional rendering.
 * 
 * ✅ CORRECT PATTERN (used here):
 *   - className="hidden md:block" for desktop
 *   - className="block md:hidden" for mobile
 *   - Same React tree structure always
 * 
 * ❌ FORBIDDEN PATTERN (causes removeChild errors):
 *   - isMobile ? <MobileLayout /> : <DesktopLayout />
 *   - Conditional component rendering based on viewport
 * 
 * Keep this pattern consistent across the entire app.
 */
export function Layout({ children }: LayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true); // Abierto por defecto en desktop

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex">
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        desktopOpen={desktopMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onDesktopToggle={() => setDesktopMenuOpen(!desktopMenuOpen)}
      />
      <SearchCommand />
      
      <main className={cn(
        "flex-1 min-h-screen flex flex-col transition-all duration-300",
        desktopMenuOpen ? "md:ml-64" : "md:ml-0"
      )}>
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3 md:px-8 gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 flex-shrink-0"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
              aria-label="Toggle menú"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile Logo/Title */}
            <div className="md:hidden flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                <Code className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm truncate">CodeKit Pro</span>
            </div>

            {/* Search Bar - Hidden on mobile, visible on desktop */}
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar prompts, herramientas..." 
                onClick={() => {
                  const event = new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                    bubbles: true,
                  });
                  document.dispatchEvent(event);
                }}
                className="w-full bg-secondary/50 border border-border rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/70 cursor-pointer"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop Notifications */}
            <button className="relative p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors hidden md:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background"></span>
            </button>

            {/* User Avatar */}
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[1px] flex-shrink-0">
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <User className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 md:p-8 pb-20 md:pb-24 animate-in fade-in duration-500 overflow-visible">
          <div className="max-w-7xl mx-auto overflow-visible w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50">
        <div className="grid grid-cols-5 h-16">
          <MobileNavItem href="/" icon={Home} label="Inicio" />
          <MobileNavItem href="/prompts" icon={MessageSquare} label="Prompts" />
          <MobileNavItem href="/tools" icon={Wrench} label="Tools" />
          <MobileNavItem href="/snippets" icon={Code} label="Code" />
          <MobileNavItem href="/links" icon={Link2} label="Links" />
        </div>
      </nav>
      
      {/* Banners - Lazy loaded para mejor rendimiento */}
      <Suspense fallback={null}>
        <AffiliateDisclaimer />
        <SalesBanner />
        <CookieBanner />
      </Suspense>
    </div>
  );
}

// Componente para items de navegación móvil
function MobileNavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
      <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>{label}</span>
    </Link>
  );
}
