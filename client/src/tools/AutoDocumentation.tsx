import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const docFormats = [
  "JSDoc",
  "TSDoc",
  "Markdown",
  "README",
  "API Documentation",
  "Inline Comments"
];

export default function AutoDocumentation() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [format, setFormat] = useState("JSDoc");
  const [output, setOutput] = useState("");

  const generate = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa código para documentar.",
        variant: "destructive",
      });
      return;
    }

    const prompt = `Genera documentación ${format} para el siguiente código ${language}:

\`\`\`${language}
${code}
\`\`\`

Por favor, incluye:
1. Descripción general del módulo/función/clase
2. Parámetros y tipos detallados
3. Valor de retorno y tipo
4. Ejemplos de uso prácticos
5. Notas y advertencias importantes
6. Casos de uso comunes
7. Errores posibles y cómo manejarlos

Documentación:`;

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
            <h1 className="text-3xl font-bold tracking-tight">Auto-documentación de Archivos</h1>
            <p className="text-muted-foreground mt-1">Genera prompts para documentar código con IA.</p>
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
            <h2 className="font-semibold mb-4">Código a Documentar</h2>
            
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
              <Label htmlFor="format">Formato de Documentación</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {docFormats.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={20}
                placeholder="Pega el código que quieres documentar aquí..."
                className="font-mono text-sm"
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
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingresa código y genera el prompt de documentación</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

