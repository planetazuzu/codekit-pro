import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function UsageExamplesGenerator() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [scenarios, setScenarios] = useState("");
  const [output, setOutput] = useState("");

  const generate = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa código para generar ejemplos.",
        variant: "destructive",
      });
      return;
    }

    const prompt = `Genera ejemplos prácticos de uso para el siguiente código ${language}:

Código:
\`\`\`${language}
${code}
\`\`\`

${scenarios ? `Escenarios requeridos: ${scenarios}` : ""}

Por favor, proporciona:
1. Ejemplos básicos de uso
2. Ejemplos avanzados con casos complejos
3. Casos de uso comunes en proyectos reales
4. Ejemplos de integración con otras librerías/frameworks
5. Ejemplos de manejo de errores
6. Ejemplos de optimización y mejores prácticas

Ejemplos:`;

    setOutput(prompt);
    toast({
      title: "Prompt generado",
      description: "Copia este prompt y úsalo con tu IA preferida.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copiado",
      description: "El prompt ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de Ejemplos de Uso</h1>
            <p className="text-muted-foreground mt-1">Genera prompts para crear ejemplos de uso con IA.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar Prompt
            </Button>
            {output && (
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Input */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Código</h2>
            
            <div className="space-y-2">
              <Label htmlFor="language">Lenguaje</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="TypeScript"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={15}
                placeholder="Pega el código aquí..."
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenarios">Escenarios Requeridos (Opcional)</Label>
              <Textarea
                id="scenarios"
                value={scenarios}
                onChange={(e) => setScenarios(e.target.value)}
                rows={6}
                placeholder="Describe los escenarios específicos que quieres ver..."
              />
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Prompt Generado</h2>
            {output ? (
              <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                {output}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingresa código y genera el prompt de ejemplos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

