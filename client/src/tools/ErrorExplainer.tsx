import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ErrorExplainer() {
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [output, setOutput] = useState("");

  const explain = () => {
    if (!errorMessage) {
      toast({
        title: "Error",
        description: "Por favor, ingresa el mensaje de error.",
        variant: "destructive",
      });
      return;
    }

    const prompt = `Analiza y explica el siguiente error en código ${language}:

Mensaje de Error:
${errorMessage}

${code ? `Código relacionado:
\`\`\`${language}
${code}
\`\`\`` : ""}

Por favor, proporciona:
1. Causa raíz del error
2. Explicación detallada del problema
3. Solución paso a paso
4. Código corregido (si aplica)
5. Prevención de errores similares
6. Buenas prácticas relacionadas

Análisis:`;

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
            <h1 className="text-3xl font-bold tracking-tight">Explicador de Errores</h1>
            <p className="text-muted-foreground mt-1">Genera prompts para explicar errores con IA.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={explain}>
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
            <h2 className="font-semibold mb-4">Información del Error</h2>
            
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
              <Label htmlFor="error">Mensaje de Error</Label>
              <Textarea
                id="error"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                rows={6}
                placeholder="Pega el mensaje de error completo aquí..."
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código Relacionado (Opcional)</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                placeholder="Pega el código donde ocurre el error..."
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
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingresa el error y genera el prompt de explicación</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

