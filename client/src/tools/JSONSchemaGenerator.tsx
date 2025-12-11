import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function generateSchema(obj: any, path: string = ""): any {
  if (obj === null) {
    return { type: "null" };
  }

  const type = Array.isArray(obj) ? "array" : typeof obj;

  switch (type) {
    case "string":
      return { type: "string" };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "array":
      if (obj.length === 0) {
        return { type: "array", items: {} };
      }
      return {
        type: "array",
        items: generateSchema(obj[0], `${path}[]`),
      };
    case "object":
      const properties: Record<string, any> = {};
      const required: string[] = [];

      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (value !== null && value !== undefined && value !== "") {
          properties[key] = generateSchema(value, `${path}.${key}`);
          required.push(key);
        }
      });

      return {
        type: "object",
        properties,
        required,
      };
    default:
      return { type: "string" };
  }
}

export default function JSONSchemaGenerator() {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState("");
  const [schema, setSchema] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const generateSchemaFromJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const generatedSchema = generateSchema(parsed);
      const formattedSchema = JSON.stringify(generatedSchema, null, 2);
      setSchema(formattedSchema);
      setIsValid(true);
      setError("");
      toast({
        title: "Esquema generado",
        description: "El esquema JSON Schema ha sido generado correctamente.",
      });
    } catch (err: any) {
      setIsValid(false);
      setError(err.message);
      setSchema("");
      toast({
        title: "Error",
        description: "JSON inválido. Por favor, verifica el formato.",
        variant: "destructive",
      });
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(jsonInput);
      setIsValid(true);
      setError("");
      toast({
        title: "JSON válido",
        description: "El JSON es válido.",
      });
    } catch (err: any) {
      setIsValid(false);
      setError(err.message);
      toast({
        title: "JSON inválido",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schema);
    toast({
      title: "Copiado",
      description: "El esquema ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de JSON Schema</h1>
            <p className="text-muted-foreground mt-1">Genera esquemas JSON Schema desde datos de ejemplo.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={validateJSON} variant="outline">
              Validar JSON
            </Button>
            <Button onClick={generateSchemaFromJSON}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar Schema
            </Button>
            {schema && (
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Schema
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Input */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="json">JSON de Ejemplo</Label>
              {isValid !== null && (
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500">Válido</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-500">Inválido</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <Textarea
              id="json"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setIsValid(null);
                setError("");
              }}
              rows={20}
              placeholder='{"name": "John", "age": 30, "email": "john@example.com"}'
              className="font-mono text-sm"
            />
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Ejemplo:</p>
              <pre className="bg-secondary/50 p-2 rounded text-xs overflow-x-auto">
{`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "active": true,
  "tags": ["developer", "designer"]
}`}
              </pre>
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <Label>JSON Schema Generado</Label>
            {schema ? (
              <div className="mt-4 bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                {schema}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>Ingresa un JSON de ejemplo y haz clic en "Generar Schema"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

