/**
 * Documentation Sidebar Component
 * Navigation sidebar for documentation section
 */

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  FileText, 
  Code2, 
  GitCompare, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DocItem[];
}

interface DocItem {
  id: string;
  title: string;
  path: string;
}

const docSections: DocSection[] = [
  {
    id: "intro",
    title: "Introducción",
    icon: BookOpen,
    items: [
      { id: "intro-readme", title: "Inicio", path: "/docs" },
      { id: "intro-what", title: "¿Qué es CodeKit Pro?", path: "/docs/introduccion" },
      { id: "intro-quick", title: "Inicio Rápido", path: "/docs/introduccion/inicio-rapido" },
    ],
  },
  {
    id: "guias",
    title: "Guías",
    icon: FileText,
    items: [
      { id: "guias-readme", title: "Guías", path: "/docs/guias" },
      { id: "guias-prompts", title: "Guía de Prompts", path: "/docs/guias/prompts" },
    ],
  },
  {
    id: "comparativas",
    title: "Comparativas",
    icon: GitCompare,
    items: [
      { id: "comparativas-readme", title: "Comparativas", path: "/docs/comparativas" },
      { id: "comparativas-ia", title: "IA de Programación", path: "/docs/comparativas/ia-programacion" },
    ],
  },
  {
    id: "arquitectura",
    title: "Arquitectura",
    icon: Layers,
    items: [
      { id: "arquitectura-readme", title: "Arquitectura", path: "/docs/arquitectura" },
      { id: "arquitectura-general", title: "Arquitectura General", path: "/docs/arquitectura/arquitectura-general" },
    ],
  },
  {
    id: "practicas",
    title: "Buenas Prácticas",
    icon: CheckCircle2,
    items: [
      { id: "practicas-readme", title: "Buenas Prácticas", path: "/docs/buenas-practicas" },
    ],
  },
  {
    id: "conceptos",
    title: "Conceptos",
    icon: Code2,
    items: [
      { id: "conceptos-readme", title: "Conceptos", path: "/docs/conceptos" },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    icon: HelpCircle,
    items: [
      { id: "faq-readme", title: "Preguntas Frecuentes", path: "/docs/faq" },
    ],
  },
];

export function DocsSidebar() {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(docSections.map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <nav className="w-64 border-r border-border bg-card h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Documentación</h2>
        </div>

        <div className="space-y-1">
          {docSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm font-medium text-foreground/80"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </button>
                
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {section.items.map((item) => {
                      const isActive = location === item.path;
                      return (
                        <Link key={item.id} href={item.path}>
                          <a
                            className={cn(
                              "block px-3 py-1.5 rounded-md text-sm transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground/70 hover:bg-accent hover:text-foreground"
                            )}
                          >
                            {item.title}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

