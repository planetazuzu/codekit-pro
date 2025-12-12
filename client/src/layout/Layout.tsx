import { Sidebar } from "./Sidebar";
import { Search, Bell, User, Menu } from "lucide-react";
import { SearchCommand } from "@/components/SearchCommand";
import { CookieBanner } from "@/components/common/CookieBanner";
import { AffiliateDisclaimer } from "@/components/common/AffiliateDisclaimer";
import { SalesBanner } from "@/components/common/SalesBanner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

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
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors hidden md:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[1px]">
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <User className="h-4 w-4 text-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 animate-in fade-in duration-500 overflow-visible">
          <div className="max-w-7xl mx-auto overflow-visible">
            {children}
          </div>
        </div>
      </main>
      
      {/* Affiliate Disclaimer */}
      <AffiliateDisclaimer />
      
      {/* Sales Banner */}
      <SalesBanner />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}
