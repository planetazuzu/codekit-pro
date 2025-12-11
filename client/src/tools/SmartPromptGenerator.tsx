import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
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

const promptTemplates = {
  code: {
    name: "Generación de Código",
    template: (context: string, language: string, requirements: string) =>
      `Actúa como un experto desarrollador ${language}. Genera código ${language} que cumpla con los siguientes requisitos:

Contexto: ${context}
Requisitos: ${requirements}

Por favor, proporciona:
1. Código completo y funcional
2. Comentarios explicativos donde sea necesario
3. Buenas prácticas de ${language}
4. Manejo de errores apropiado`
  },
  refactor: {
    name: "Refactorización",
    template: (code: string, language: string, goals: string) =>
      `Refactoriza el siguiente código ${language} siguiendo estos objetivos:

Código actual:
\`\`\`${language}
${code}
\`\`\`

Objetivos de refactorización: ${goals}

Por favor, proporciona:
1. Código refactorizado
2. Explicación de los cambios realizados
3. Mejoras en rendimiento, legibilidad o mantenibilidad`
  },
  test: {
    name: "Generación de Tests",
    template: (code: string, language: string, framework: string) =>
      `Genera una suite completa de tests para el siguiente código ${language} usando ${framework}:

Código a testear:
\`\`\`${language}
${code}
\`\`\`

Por favor, incluye:
1. Tests unitarios para cada función/método
2. Tests de casos límite
3. Tests de manejo de errores
4. Mocks y stubs donde sea necesario
5. Cobertura de casos de éxito y fallo`
  },
  explain: {
    name: "Explicación de Código",
    template: (code: string, language: string) =>
      `Explica detalladamente cómo funciona el siguiente código ${language}:

\`\`\`${language}
${code}
\`\`\`

Por favor, proporciona:
1. Explicación línea por línea o por bloques
2. Flujo de ejecución
3. Propósito de cada componente
4. Posibles mejoras o consideraciones`
  },
  error: {
    name: "Explicación de Errores",
    template: (error: string, code: string, language: string) =>
      `Analiza y explica el siguiente error en código ${language}:

Error:
${error}

Código relacionado:
\`\`\`${language}
${code}
\`\`\`

Por favor, proporciona:
1. Causa raíz del error
2. Explicación detallada del problema
3. Solución paso a paso
4. Código corregido
5. Prevención de errores similares`
  },
  documentation: {
    name: "Documentación",
    template: (code: string, language: string, format: string) =>
      `Genera documentación ${format} para el siguiente código ${language}:

\`\`\`${language}
${code}
\`\`\`

Por favor, incluye:
1. Descripción general del módulo/función
2. Parámetros y tipos
3. Valor de retorno
4. Ejemplos de uso
5. Notas y advertencias`
  },
  example: {
    name: "Ejemplos de Uso",
    template: (code: string, language: string, scenarios: string) =>
      `Genera ejemplos prácticos de uso para el siguiente código ${language}:

Código:
\`\`\`${language}
${code}
\`\`\`

Escenarios requeridos: ${scenarios}

Por favor, proporciona:
1. Ejemplos básicos
2. Ejemplos avanzados
3. Casos de uso comunes
4. Ejemplos de integración`
  }
};

export default function SmartPromptGenerator() {
  const { toast } = useToast();
  const [promptType, setPromptType] = useState("code");
  const [language, setLanguage] = useState("TypeScript");
  const [context, setContext] = useState("");
  const [requirements, setRequirements] = useState("");
  const [output, setOutput] = useState("");

  const generatePrompt = () => {
    try {
      const template = promptTemplates[promptType as keyof typeof promptTemplates];
      let generated = "";

      switch (promptType) {
        case "code":
          generated = template.template(context, language, requirements);
          break;
        case "refactor":
        case "test":
        case "explain":
        case "documentation":
        case "example":
          generated = template.template(context, language, requirements);
          break;
        case "error":
          generated = template.template(requirements, context, language);
          break;
      }

      setOutput(generated);
      toast({
        title: "Prompt generado",
        description: "El prompt inteligente ha sido generado.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Generador de Prompts Inteligentes</h1>
            <p className="text-muted-foreground mt-1">Genera prompts optimizados para IA de programación.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generatePrompt}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar
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
          {/* Configuración */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Configuración</h2>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Prompt</Label>
              <Select value={promptType} onValueChange={setPromptType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(promptTemplates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Lenguaje de Programación</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="TypeScript, Python, JavaScript..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">
                {promptType === "code" ? "Contexto" : 
                 promptType === "error" ? "Código con Error" :
                 "Código"}
              </Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={10}
                placeholder={promptType === "code" ? "Describe el contexto del código..." : "Pega el código aquí..."}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">
                {promptType === "code" ? "Requisitos" :
                 promptType === "refactor" ? "Objetivos de Refactorización" :
                 promptType === "test" ? "Framework de Testing" :
                 promptType === "error" ? "Mensaje de Error" :
                 promptType === "documentation" ? "Formato (Markdown, JSDoc, etc.)" :
                 promptType === "example" ? "Escenarios Requeridos" :
                 "Información Adicional"}
              </Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={6}
                placeholder="Describe los requisitos o información adicional..."
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
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configura y genera el prompt inteligente</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

