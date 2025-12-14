/**
 * Mobile-optimized Tools Page
 * Single column layout for better mobile UX
 */

import { Layout } from "@/layout/Layout";
import { Link } from "wouter";
import { BackButton } from "@/components/common/BackButton";
import { MobilePullToRefresh } from "@/components/mobile";
import { useState, useMemo } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrackPageView } from "@/hooks/use-track-view";
import { 
  Image, 
  FileJson, 
  FolderTree, 
  Type, 
  Palette, 
  FileText, 
  Maximize, 
  Hash,
  Code2,
  FileX,
  Copy,
  Terminal,
  Key,
  Shield,
  ArrowLeftRight,
  Send,
  Database,
  Sparkles,
  Wand2,
  AlertCircle,
  TestTube,
  BookOpen,
  Scissors,
  Package,
  CheckCircle2,
  BarChart3,
  Eye,
  Zap,
  FileCheck,
  Bug,
  Activity,
} from "lucide-react";

const tools = [
  {
    id: 'readme',
    title: 'Readme Generator',
    description: 'Genera archivos README.md profesionales para tus proyectos.',
    icon: FileText,
    href: '/tools/readme',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10'
  },
  {
    id: 'meta',
    title: 'Meta Tag Generator',
    description: 'Crea meta tags SEO para redes sociales y buscadores.',
    icon: Hash,
    href: '/tools/meta',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    id: 'folders',
    title: 'Folder Structures',
    description: 'Genera estructuras de carpetas estándar para diferentes frameworks.',
    icon: FolderTree,
    href: '/tools/folders',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10'
  },
  {
    id: 'json',
    title: 'JSON Schema',
    description: 'Genera y valida esquemas JSON para tus datos.',
    icon: FileJson,
    href: '/tools/json',
    color: 'text-green-400',
    bg: 'bg-green-400/10'
  },
  {
    id: 'base64',
    title: 'Image to Base64',
    description: 'Convierte imágenes a cadenas Base64 para incrustar.',
    icon: Image,
    href: '/tools/base64',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    id: 'colors',
    title: 'Palette Generator',
    description: 'Crea y exporta paletas de colores en formato Tailwind.',
    icon: Palette,
    href: '/tools/colors',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10'
  },
  {
    id: 'svg',
    title: 'SVG Icons',
    description: 'Generador rápido de iconos SVG simples.',
    icon: Code2,
    href: '/tools/svg',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10'
  },
  {
    id: 'mockup',
    title: 'Mockup Screenshots',
    description: 'Embellece tus capturas de pantalla con marcos y fondos.',
    icon: Maximize,
    href: '/tools/mockup',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10'
  },
  {
    id: 'favicon',
    title: 'Favicon Creator',
    description: 'Genera favicons en múltiples formatos desde texto o imagen.',
    icon: Type,
    href: '/tools/favicon',
    color: 'text-red-400',
    bg: 'bg-red-400/10'
  },
  {
    id: 'license',
    title: 'License Generator',
    description: 'Genera archivos LICENSE (MIT, Apache, GPL, etc.) para tus proyectos.',
    icon: FileText,
    href: '/tools/license',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    id: 'gitignore',
    title: '.gitignore Builder',
    description: 'Genera archivos .gitignore según el tipo de proyecto.',
    icon: FileX,
    href: '/tools/gitignore',
    color: 'text-gray-400',
    bg: 'bg-gray-400/10'
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Formatea y valida JSON de forma rápida.',
    icon: FileJson,
    href: '/tools/json-formatter',
    color: 'text-green-400',
    bg: 'bg-green-400/10'
  },
  {
    id: 'yaml-formatter',
    title: 'YAML Formatter',
    description: 'Formatea y valida YAML de forma rápida.',
    icon: FileText,
    href: '/tools/yaml-formatter',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    description: 'Prueba y valida expresiones regulares en tiempo real.',
    icon: Terminal,
    href: '/tools/regex',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    id: 'uuid',
    title: 'UUID Generator',
    description: 'Genera UUIDs (Identificadores Únicos Universales).',
    icon: Key,
    href: '/tools/uuid',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10'
  },
  {
    id: 'jwt',
    title: 'JWT Decoder',
    description: 'Decodifica y visualiza tokens JWT (JSON Web Tokens).',
    icon: Shield,
    href: '/tools/jwt',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10'
  },
  {
    id: 'json-to-ts',
    title: 'JSON ⇄ TypeScript',
    description: 'Convierte entre JSON e interfaces TypeScript.',
    icon: ArrowLeftRight,
    href: '/tools/json-to-ts',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    id: 'api-tester',
    title: 'API Tester',
    description: 'Prueba endpoints REST como un mini-Postman.',
    icon: Send,
    href: '/tools/api-tester',
    color: 'text-green-400',
    bg: 'bg-green-400/10'
  },
  {
    id: 'db-models',
    title: 'Database Models',
    description: 'Genera modelos para diferentes bases de datos.',
    icon: Database,
    href: '/tools/db-models',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10'
  },
  {
    id: 'smart-prompts',
    title: 'Smart Prompts',
    description: 'Genera prompts optimizados para IA de programación.',
    icon: Sparkles,
    href: '/tools/smart-prompts',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    id: 'code-rewriter',
    title: 'Code Rewriter',
    description: 'Genera prompts para reescribir código con IA.',
    icon: Wand2,
    href: '/tools/code-rewriter',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10'
  },
  {
    id: 'function-generator',
    title: 'Function Generator',
    description: 'Genera prompts para crear funciones con IA.',
    icon: Code2,
    href: '/tools/function-generator',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10'
  },
  {
    id: 'error-explainer',
    title: 'Error Explainer',
    description: 'Genera prompts para explicar errores con IA.',
    icon: AlertCircle,
    href: '/tools/error-explainer',
    color: 'text-red-400',
    bg: 'bg-red-400/10'
  },
  {
    id: 'test-generator',
    title: 'Test Generator',
    description: 'Genera prompts para crear tests con IA.',
    icon: TestTube,
    href: '/tools/test-generator',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10'
  },
  {
    id: 'auto-docs',
    title: 'Auto Documentation',
    description: 'Genera prompts para documentar código con IA.',
    icon: FileText,
    href: '/tools/auto-docs',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    id: 'usage-examples',
    title: 'Usage Examples',
    description: 'Genera prompts para crear ejemplos de uso con IA.',
    icon: BookOpen,
    href: '/tools/usage-examples',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10'
  }
];

export default function MobileTools() {
  useTrackPageView("page", "tools-mobile");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchTerm) return tools;
    const search = searchTerm.toLowerCase();
    return tools.filter(tool => 
      tool.title.toLowerCase().includes(search) ||
      tool.description.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Herramientas</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Utilidades para agilizar tu desarrollo.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Buscar herramientas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Results Count */}
          {searchTerm && (
            <div className="text-xs text-muted-foreground">
              {filteredTools.length} herramienta{filteredTools.length !== 1 ? 's' : ''} encontrada{filteredTools.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Tools List - Single column for mobile */}
          <div className="space-y-3">
            {filteredTools.map((tool) => (
              <Link key={tool.id} href={tool.href}>
                <a className="block group relative overflow-hidden rounded-xl border border-border bg-card p-4 active:scale-[0.98] transition-transform">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${tool.bg} ${tool.color} flex items-center justify-center`}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-semibold mb-2">No se encontraron herramientas</h3>
              <p className="text-muted-foreground text-sm">
                Intenta con otros términos de búsqueda.
              </p>
            </div>
          )}
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
