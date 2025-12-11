import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const rewriteStyles = [
  "Modernizar código legacy",
  "Optimizar rendimiento",
  "Mejorar legibilidad",
  "Aplicar principios SOLID",
  "Añadir manejo de errores",
  "Convertir a TypeScript",
  "Aplicar patrones de diseño",
  "Simplificar código complejo"
];

export default function CodeRewriter() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [style, setStyle] = useState(rewriteStyles[0]);
  const [output, setOutput] = useState("");

  const rewrite = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa código para reescribir.",
        variant: "destructive",
      });
      return;
    }

    // Generar prompt para IA
    const prompt = `Reescribe el siguiente código ${language} con el objetivo de: ${style}

Código original:
\`\`\`${language}
${code}
\`\`\`

Por favor, proporciona:
1. Código reescrito mejorado
2. Explicación de los cambios realizados
3. Beneficios de la reescritura

Código reescrito:`;

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
            <h1 className="text-3xl font-bold tracking-tight">Reescritor de Código</h1>
            <p className="text-muted-foreground mt-1">Genera prompts para reescribir código con IA.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={rewrite}>
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
            <h2 className="font-semibold mb-4">Código Original</h2>
            
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
              <Label htmlFor="style">Estilo de Reescritura</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rewriteStyles.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
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
                placeholder="Pega el código que quieres reescribir aquí..."
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Prompt para IA</h2>
            {output ? (
              <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                {output}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingresa código y genera el prompt de reescritura</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

