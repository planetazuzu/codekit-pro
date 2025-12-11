import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  CommandShortcut
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { 
  MessageSquare, 
  Code, 
  Link2, 
  BookOpen, 
  Wrench, 
  LayoutDashboard,
  FileText,
  Hash,
  FolderTree,
  FileJson,
  Image,
  Palette,
  Code2,
  Maximize,
  Type,
  FileX,
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
  BarChart3,
  Settings
} from "lucide-react";

const typeIcons: Record<string, any> = {
  prompt: MessageSquare,
  snippet: Code,
  link: Link2,
  guide: BookOpen,
  tool: Wrench,
  page: LayoutDashboard,
};

const toolIcons: Record<string, any> = {
  readme: FileText,
  meta: Hash,
  folders: FolderTree,
  json: FileJson,
  base64: Image,
  colors: Palette,
  svg: Code2,
  mockup: Maximize,
  favicon: Type,
  license: FileText,
  gitignore: FileX,
  "json-formatter": FileJson,
  "yaml-formatter": FileText,
  regex: Terminal,
  uuid: Key,
  jwt: Shield,
  "json-to-ts": ArrowLeftRight,
  "api-tester": Send,
  "db-models": Database,
  "smart-prompts": Sparkles,
  "code-rewriter": Wand2,
  "function-generator": Code2,
  "error-explainer": AlertCircle,
  "test-generator": TestTube,
  "auto-docs": FileText,
  "usage-examples": BookOpen,
};

const pageIcons: Record<string, any> = {
  dashboard: LayoutDashboard,
  prompts: MessageSquare,
  snippets: Code,
  links: Link2,
  guides: BookOpen,
  tools: Wrench,
  admin: BarChart3,
  "api-guides": Settings,
};

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const results = useSearch(query);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof results> = {
      pages: [],
      tools: [],
      prompts: [],
      snippets: [],
      links: [],
      guides: [],
    };

    results.forEach((result) => {
      if (groups[result.type + "s"]) {
        groups[result.type + "s"].push(result);
      }
    });

    return groups;
  }, [results]);

  const handleSelect = (href: string) => {
    setLocation(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Buscar prompts, snippets, herramientas..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          
          {groupedResults.pages.length > 0 && (
            <CommandGroup heading="Páginas">
              {groupedResults.pages.map((result) => {
                const Icon = pageIcons[result.id] || LayoutDashboard;
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.href)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{result.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {groupedResults.tools.length > 0 && (
            <CommandGroup heading="Herramientas">
              {groupedResults.tools.map((result) => {
                const Icon = toolIcons[result.id] || Wrench;
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.href)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{result.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {groupedResults.prompts.length > 0 && (
            <CommandGroup heading="Prompts">
              {groupedResults.prompts.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result.href)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.category && (
                      <span className="text-xs text-muted-foreground">{result.category}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedResults.snippets.length > 0 && (
            <CommandGroup heading="Snippets">
              {groupedResults.snippets.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result.href)}
                >
                  <Code className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.description && (
                      <span className="text-xs text-muted-foreground">{result.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedResults.links.length > 0 && (
            <CommandGroup heading="Enlaces">
              {groupedResults.links.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    if (result.href.startsWith("http")) {
                      window.open(result.href, "_blank");
                    } else {
                      handleSelect(result.href);
                    }
                    setOpen(false);
                  }}
                >
                  <Link2 className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.description && (
                      <span className="text-xs text-muted-foreground">{result.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedResults.guides.length > 0 && (
            <CommandGroup heading="Guías">
              {groupedResults.guides.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result.href)}
                >
                  <BookOpen className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.description && (
                      <span className="text-xs text-muted-foreground">{result.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

