import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, TestTube } from "lucide-react";
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

const testFrameworks = [
  "Vitest",
  "Jest",
  "Mocha",
  "Jasmine",
  "Pytest (Python)",
  "RSpec (Ruby)",
  "JUnit (Java)"
];

export default function TestGenerator() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [framework, setFramework] = useState("Vitest");
  const [output, setOutput] = useState("");

  const generate = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa código para generar tests.",
        variant: "destructive",
      });
      return;
    }

    const prompt = `Genera una suite completa de tests para el siguiente código ${language} usando ${framework}:

Código a testear:
\`\`\`${language}
${code}
\`\`\`

Por favor, incluye:
1. Tests unitarios para cada función/método
2. Tests de casos límite (edge cases)
3. Tests de manejo de errores
4. Mocks y stubs donde sea necesario
5. Cobertura de casos de éxito y fallo
6. Setup y teardown si es necesario
7. Comentarios explicativos

Código de tests:`;

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
            <h1 className="text-3xl font-bold tracking-tight">Generador de Tests</h1>
            <p className="text-muted-foreground mt-1">Genera prompts para crear tests con IA.</p>
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
            <h2 className="font-semibold mb-4">Código a Testear</h2>
            
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
              <Label htmlFor="framework">Framework de Testing</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testFrameworks.map(f => (
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
                placeholder="Pega el código que quieres testear aquí..."
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
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingresa código y genera el prompt de tests</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

