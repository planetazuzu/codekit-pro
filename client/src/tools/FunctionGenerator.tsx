import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FunctionGenerator() {
  const { toast } = useToast();
  const [functionName, setFunctionName] = useState("");
  const [description, setDescription] = useState("");
  const [parameters, setParameters] = useState("");
  const [returnType, setReturnType] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [output, setOutput] = useState("");

  const generate = () => {
    if (!functionName || !description) {
      toast({
        title: "Error",
        description: "Por favor, completa nombre y descripción.",
        variant: "destructive",
      });
      return;
    }

    const prompt = `Genera una función ${language} con las siguientes especificaciones:

Nombre: ${functionName}
Descripción: ${description}
Parámetros: ${parameters || "Ninguno"}
Tipo de retorno: ${returnType || "void"}

Por favor, proporciona:
1. Función completa con tipos
2. Comentarios JSDoc
3. Manejo de errores
4. Ejemplo de uso
5. Casos de prueba básicos

Código:`;

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
            <h1 className="text-3xl font-bold tracking-tight">Generador de Funciones</h1>
            <p className="text-muted-foreground mt-1">Genera prompts para crear funciones con IA.</p>
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
            <h2 className="font-semibold mb-4">Especificaciones</h2>
            
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
              <Label htmlFor="name">Nombre de la Función</Label>
              <Input
                id="name"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="calculateTotal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe qué debe hacer la función..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parameters">Parámetros (uno por línea)</Label>
              <Textarea
                id="parameters"
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                rows={6}
                placeholder="price: number&#10;quantity: number&#10;discount?: number"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="return">Tipo de Retorno</Label>
              <Input
                id="return"
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
                placeholder="number"
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
                  <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Completa las especificaciones y genera el prompt</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

