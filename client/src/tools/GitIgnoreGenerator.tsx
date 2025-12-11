import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, Download, RefreshCw, FileX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const gitignoreTemplates: Record<string, string[]> = {
  node: [
    'node_modules/',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    'package-lock.json',
    'yarn.lock',
    '.pnp',
    '.pnp.js'
  ],
  python: [
    '__pycache__/',
    '*.py[cod]',
    '*$py.class',
    '*.so',
    '.Python',
    'env/',
    'venv/',
    'ENV/',
    '.venv'
  ],
  java: [
    '*.class',
    '*.log',
    '*.jar',
    '*.war',
    '*.ear',
    '.gradle/',
    'build/',
    'target/'
  ],
  react: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local'
  ],
  vue: [
    'node_modules/',
    'dist/',
    'dist-ssr/',
    '*.local',
    '.env.local',
    '.env.*.local'
  ],
  nextjs: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    '.env*.local',
    '.vercel'
  ],
  docker: [
    '*.log',
    '.dockerignore'
  ],
  ide: [
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
    '*~',
    '.DS_Store',
    'Thumbs.db'
  ],
  os: [
    '.DS_Store',
    '.DS_Store?',
    '._*',
    '.Spotlight-V100',
    '.Trashes',
    'Thumbs.db',
    'ehthumbs.db'
  ],
  logs: [
    '*.log',
    'logs/',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*'
  ],
  env: [
    '.env',
    '.env.local',
    '.env.*.local',
    '.env.development',
    '.env.production'
  ]
};

export default function GitIgnoreGenerator() {
  const { toast } = useToast();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(["node", "ide", "os"]);
  const [customRules, setCustomRules] = useState("");
  const [output, setOutput] = useState("");

  const toggleTemplate = (template: string) => {
    setSelectedTemplates(prev =>
      prev.includes(template)
        ? prev.filter(t => t !== template)
        : [...prev, template]
    );
  };

  const generateGitignore = () => {
    const rules = new Set<string>();
    
    selectedTemplates.forEach(template => {
      gitignoreTemplates[template]?.forEach(rule => rules.add(rule));
    });

    if (customRules.trim()) {
      customRules.split('\n').forEach(rule => {
        const trimmed = rule.trim();
        if (trimmed) rules.add(trimmed);
      });
    }

    const sortedRules = Array.from(rules).sort();
    const outputText = sortedRules.join('\n');
    setOutput(outputText);
    toast({
      title: ".gitignore generado",
      description: "El archivo .gitignore ha sido generado correctamente.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copiado",
      description: "El .gitignore ha sido copiado al portapapeles.",
    });
  };

  const downloadGitignore = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Descargado",
      description: "El .gitignore ha sido descargado.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de .gitignore</h1>
            <p className="text-muted-foreground mt-1">Genera archivos .gitignore según el tipo de proyecto.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateGitignore}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar
            </Button>
            {output && (
              <>
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button onClick={downloadGitignore} variant="outline">
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
            <h2 className="font-semibold mb-4">Plantillas</h2>
            
            <div className="space-y-3">
              {Object.entries(gitignoreTemplates).map(([key, rules]) => (
                <div key={key} className="flex items-start gap-3">
                  <Checkbox
                    id={key}
                    checked={selectedTemplates.includes(key)}
                    onCheckedChange={() => toggleTemplate(key)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={key} className="font-medium cursor-pointer">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rules.length} reglas
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Label htmlFor="custom">Reglas Personalizadas (una por línea)</Label>
              <Textarea
                id="custom"
                value={customRules}
                onChange={(e) => setCustomRules(e.target.value)}
                rows={6}
                placeholder="ejemplo/&#10;*.tmp&#10;secret.txt"
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">.gitignore Generado</h2>
            {output ? (
              <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                {output}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona plantillas y genera el .gitignore</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

