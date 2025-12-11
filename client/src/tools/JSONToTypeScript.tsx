import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function jsonToTypeScript(json: string, interfaceName: string = "Root"): string {
  try {
    const obj = JSON.parse(json);
    return generateTypeScript(obj, interfaceName);
  } catch (error: any) {
    throw new Error(`JSON inválido: ${error.message}`);
  }
}

function generateTypeScript(obj: any, name: string, depth: number = 0): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);
  
  if (obj === null) {
    return "null";
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return "any[]";
    }
    const itemType = generateTypeScript(obj[0], "", depth + 1);
    return `${itemType}[]`;
  }
  
  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return "Record<string, any>";
    }
    
    const properties = keys.map(key => {
      const value = obj[key];
      const type = generateTypeScript(value, key, depth + 1);
      const optional = value === null || value === undefined ? "?" : "";
      return `${nextIndent}${key}${optional}: ${type};`;
    }).join("\n");
    
    return `{\n${properties}\n${indent}}`;
  }
  
  return typeof obj === "string" ? "string" :
         typeof obj === "number" ? "number" :
         typeof obj === "boolean" ? "boolean" :
         "any";
}

function typeScriptToJSON(typeScript: string): string {
  // Esta es una conversión básica - en producción usarías un parser real
  try {
    // Extraer propiedades del interface
    const properties: Record<string, any> = {};
    const propMatches = typeScript.matchAll(/(\w+)(\?)?:\s*([^;]+);/g);
    
    for (const match of propMatches) {
      const [, key, optional, type] = match;
      let value: any;
      
      if (type.includes("[]")) {
        value = [];
      } else if (type === "string") {
        value = optional ? null : "";
      } else if (type === "number") {
        value = optional ? null : 0;
      } else if (type === "boolean") {
        value = optional ? null : false;
      } else if (type.includes("{")) {
        value = {};
      } else {
        value = null;
      }
      
      if (!optional) {
        properties[key] = value;
      }
    }
    
    return JSON.stringify(properties, null, 2);
  } catch (error: any) {
    throw new Error(`TypeScript inválido: ${error.message}`);
  }
}

export default function JSONToTypeScript() {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState("");
  const [typeScriptOutput, setTypeScriptOutput] = useState("");
  const [interfaceName, setInterfaceName] = useState("Root");
  const [mode, setMode] = useState<"json-to-ts" | "ts-to-json">("json-to-ts");

  const convert = () => {
    try {
      if (mode === "json-to-ts") {
        const ts = `interface ${interfaceName} ${jsonToTypeScript(jsonInput, interfaceName)}`;
        setTypeScriptOutput(ts);
        toast({
          title: "Convertido",
          description: "JSON convertido a TypeScript exitosamente.",
        });
      } else {
        const json = typeScriptToJSON(jsonInput);
        setTypeScriptOutput(json);
        toast({
          title: "Convertido",
          description: "TypeScript convertido a JSON exitosamente.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(typeScriptOutput);
    toast({
      title: "Copiado",
      description: "El código ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conversor JSON ⇄ TypeScript</h1>
            <p className="text-muted-foreground mt-1">Convierte entre JSON y interfaces TypeScript.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={convert}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Convertir
            </Button>
            {typeScriptOutput && (
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            )}
          </div>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="flex-1 flex flex-col min-h-0">
          <TabsList>
            <TabsTrigger value="json-to-ts">JSON → TypeScript</TabsTrigger>
            <TabsTrigger value="ts-to-json">TypeScript → JSON</TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0 mt-6">
            <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
              {mode === "json-to-ts" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="interface">Nombre del Interface</Label>
                    <input
                      id="interface"
                      type="text"
                      value={interfaceName}
                      onChange={(e) => setInterfaceName(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Root"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="json">JSON de Entrada</Label>
                    <Textarea
                      id="json"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      rows={20}
                      placeholder='{"name": "John", "age": 30, "active": true}'
                      className="font-mono text-sm"
                    />
                  </div>
                </>
              )}
              {mode === "ts-to-json" && (
                <div className="space-y-2">
                  <Label htmlFor="ts">TypeScript de Entrada</Label>
                  <Textarea
                    id="ts"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={20}
                    placeholder='interface User {\n  name: string;\n  age: number;\n  active?: boolean;\n}'
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
              <Label>Resultado</Label>
              {typeScriptOutput ? (
                <div className="mt-4 bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                  {typeScriptOutput}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ingresa {mode === "json-to-ts" ? "JSON" : "TypeScript"} y haz clic en "Convertir"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}

