import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, Download, RefreshCw, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const templates = {
  react: {
    name: "React App",
    structure: `src/
  components/
    ui/
  pages/
  hooks/
  lib/
  assets/
  styles/
public/
  favicon.ico
  index.html
package.json
tsconfig.json
vite.config.ts
README.md`,
  },
  nextjs: {
    name: "Next.js App",
    structure: `app/
  layout.tsx
  page.tsx
  globals.css
components/
  ui/
lib/
  utils.ts
public/
  images/
next.config.js
package.json
tsconfig.json
README.md`,
  },
  angular: {
    name: "Angular App",
    structure: `src/
  app/
    components/
    services/
    models/
    guards/
    interceptors/
  assets/
  environments/
  styles/
angular.json
package.json
tsconfig.json
README.md`,
  },
  svelte: {
    name: "Svelte App",
    structure: `src/
  lib/
    components/
    stores/
    utils/
  routes/
  app.html
static/
  favicon.ico
vite.config.js
package.json
README.md`,
  },
  express: {
    name: "Express API",
    structure: `src/
  routes/
  controllers/
  models/
  middleware/
  utils/
  config/
public/
  uploads/
tests/
  unit/
  integration/
.env
package.json
tsconfig.json
README.md`,
  },
  nestjs: {
    name: "NestJS API",
    structure: `src/
  modules/
    users/
      users.controller.ts
      users.service.ts
      users.module.ts
      dto/
  common/
    filters/
    guards/
    interceptors/
  config/
test/
  unit/
  e2e/
nest-cli.json
package.json
tsconfig.json
README.md`,
  },
  django: {
    name: "Django Project",
    structure: `project_name/
  settings/
    __init__.py
    base.py
    development.py
    production.py
  urls.py
  wsgi.py
apps/
  app1/
    models.py
    views.py
    urls.py
    admin.py
static/
templates/
manage.py
requirements.txt
README.md`,
  },
  flask: {
    name: "Flask App",
    structure: `app/
  __init__.py
  models/
  views/
  templates/
  static/
    css/
    js/
    images/
  config.py
migrations/
tests/
  unit/
  integration/
run.py
requirements.txt
README.md`,
  },
  laravel: {
    name: "Laravel App",
    structure: `app/
  Http/
    Controllers/
    Middleware/
  Models/
  Services/
database/
  migrations/
  seeders/
resources/
  views/
  js/
  css/
routes/
  web.php
  api.php
public/
.env
composer.json
README.md`,
  },
  springboot: {
    name: "Spring Boot",
    structure: `src/
  main/
    java/
      com/
        example/
          controller/
          service/
          repository/
          model/
          config/
    resources/
      application.yml
      static/
      templates/
  test/
    java/
pom.xml
README.md`,
  },
  go: {
    name: "Go Project",
    structure: `cmd/
  app/
    main.go
internal/
  handler/
  service/
  repository/
  model/
pkg/
  utils/
  middleware/
config/
  config.yaml
go.mod
go.sum
README.md`,
  },
  python: {
    name: "Python Package",
    structure: `package_name/
  __init__.py
  core/
  utils/
  tests/
    __init__.py
    test_core.py
docs/
  conf.py
  index.rst
setup.py
requirements.txt
README.md
LICENSE`,
  },
  typescript: {
    name: "TypeScript Library",
    structure: `src/
  index.ts
  lib/
  types/
  utils/
tests/
  unit/
  integration/
dist/
tsconfig.json
package.json
README.md
LICENSE`,
  },
  monorepo: {
    name: "Monorepo",
    structure: `packages/
  web/
    src/
    package.json
  api/
    src/
    package.json
  shared/
    src/
    package.json
apps/
  admin/
  client/
package.json
pnpm-workspace.yaml
README.md`,
  },
  remix: {
    name: "Remix App",
    structure: `app/
  routes/
    _index.tsx
    about.tsx
  components/
  lib/
  styles/
public/
  favicon.ico
remix.config.js
package.json
tsconfig.json
README.md`,
  },
  sveltekit: {
    name: "SvelteKit App",
    structure: `src/
  routes/
    +page.svelte
    +layout.svelte
  lib/
    components/
    utils/
  app.html
static/
  favicon.ico
vite.config.js
package.json
README.md`,
  },
  astro: {
    name: "Astro App",
    structure: `src/
  pages/
    index.astro
    about.astro
  components/
  layouts/
  styles/
public/
  favicon.ico
astro.config.mjs
package.json
tsconfig.json
README.md`,
  },
  vue: {
    name: "Vue App",
    structure: `src/
  components/
  views/
  router/
  store/
  assets/
  styles/
public/
  index.html
vite.config.js
package.json
README.md`,
  },
  custom: {
    name: "Personalizado",
    structure: "",
  },
};

export default function FolderGenerator() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("react");
  const [customStructure, setCustomStructure] = useState("");
  const [output, setOutput] = useState("");

  const generateStructure = () => {
    let structure = "";
    
    if (selectedTemplate === "custom") {
      structure = customStructure;
    } else {
      structure = templates[selectedTemplate as keyof typeof templates].structure;
    }

    // Convertir a formato árbol
    const lines = structure.split("\n");
    const treeLines: string[] = [];
    
    lines.forEach((line, index) => {
      const depth = (line.match(/^(\s*)/)?.[1]?.length || 0) / 2;
      const name = line.trim();
      
      if (!name) return;
      
      const isLast = index === lines.length - 1 || 
        (lines[index + 1] && (lines[index + 1].match(/^(\s*)/)?.[1]?.length || 0) <= depth * 2);
      
      const prefix = depth > 0 ? "│  ".repeat(depth - 1) + (isLast ? "└── " : "├── ") : "";
      treeLines.push(prefix + name);
    });

    setOutput(treeLines.join("\n"));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copiado",
      description: "La estructura de carpetas ha sido copiada al portapapeles.",
    });
  };

  const downloadAsText = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "folder-structure.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Descargado",
      description: "La estructura ha sido descargada.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de Estructuras de Carpetas</h1>
            <p className="text-muted-foreground mt-1">Genera estructuras de carpetas estándar para diferentes frameworks.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateStructure} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar
            </Button>
            {output && (
              <>
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button onClick={downloadAsText} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Configuración */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Configuración</h2>
            
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom">Estructura Personalizada</Label>
                <Textarea
                  id="custom"
                  value={customStructure}
                  onChange={(e) => setCustomStructure(e.target.value)}
                  rows={15}
                  placeholder="Escribe tu estructura aquí...&#10;Ejemplo:&#10;src/&#10;  components/&#10;  pages/"
                  className="font-mono text-sm"
                />
              </div>
            )}

            {selectedTemplate !== "custom" && (
              <div className="space-y-2">
                <Label>Vista Previa de la Plantilla</Label>
                <div className="bg-secondary/50 border border-border rounded-md p-4 font-mono text-xs whitespace-pre-wrap">
                  {templates[selectedTemplate as keyof typeof templates].structure}
                </div>
              </div>
            )}
          </div>

          {/* Resultado */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Estructura Generada</h2>
            {output ? (
              <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                {output}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona una plantilla y haz clic en "Generar"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

