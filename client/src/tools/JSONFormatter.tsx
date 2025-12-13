import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, CheckCircle, XCircle, Minimize2, GitCompare, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  path?: string;
}

export default function JSONFormatter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("format");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonInput2, setJsonInput2] = useState("");
  const [formattedOutput, setFormattedOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [diffResult, setDiffResult] = useState<string>("");
  const [schemaInput, setSchemaInput] = useState<string>("");
  const [schemaValidationResult, setSchemaValidationResult] = useState<string>("");

  const validateAgainstSchema = (json: string, schema: string): string => {
    try {
      const data = JSON.parse(json);
      const schemaObj = JSON.parse(schema);

      const errors: string[] = [];

      // Validación básica contra JSON Schema
      const validate = (data: any, schema: any, path = ""): void => {
        if (schema.type) {
          const actualType = Array.isArray(data) ? "array" : typeof data;
          if (actualType !== schema.type) {
            errors.push(`Tipo incorrecto en ${path || "raíz"}: esperado ${schema.type}, obtenido ${actualType}`);
          }
        }

        if (schema.required && Array.isArray(schema.required)) {
          schema.required.forEach((key: string) => {
            if (!(key in data)) {
              errors.push(`Campo requerido faltante: ${path ? `${path}.` : ""}${key}`);
            }
          });
        }

        if (schema.properties && typeof data === "object" && !Array.isArray(data) && data !== null) {
          Object.keys(schema.properties).forEach((key) => {
            if (key in data) {
              validate(data[key], schema.properties[key], path ? `${path}.${key}` : key);
            }
          });
        }

        if (schema.items && Array.isArray(data)) {
          data.forEach((item, index) => {
            validate(item, schema.items, `${path}[${index}]`);
          });
        }

        if (schema.enum && !schema.enum.includes(data)) {
          errors.push(`Valor no permitido en ${path || "raíz"}: ${data}. Valores permitidos: ${schema.enum.join(", ")}`);
        }

        if (schema.minimum !== undefined && typeof data === "number" && data < schema.minimum) {
          errors.push(`Valor menor al mínimo en ${path || "raíz"}: ${data} < ${schema.minimum}`);
        }

        if (schema.maximum !== undefined && typeof data === "number" && data > schema.maximum) {
          errors.push(`Valor mayor al máximo en ${path || "raíz"}: ${data} > ${schema.maximum}`);
        }

        if (schema.minLength !== undefined && typeof data === "string" && data.length < schema.minLength) {
          errors.push(`Longitud menor a la mínima en ${path || "raíz"}: ${data.length} < ${schema.minLength}`);
        }

        if (schema.maxLength !== undefined && typeof data === "string" && data.length > schema.maxLength) {
          errors.push(`Longitud mayor a la máxima en ${path || "raíz"}: ${data.length} > ${schema.maxLength}`);
        }
      };

      validate(data, schemaObj);

      if (errors.length === 0) {
        return "✅ JSON válido según el schema";
      } else {
        return `❌ Errores de validación:\n${errors.join("\n")}`;
      }
    } catch (error: any) {
      return `❌ Error al validar: ${error.message}`;
    }
  };

  const validateJSON = (json: string): { valid: boolean; error?: ValidationError; parsed?: any } => {
    if (!json.trim()) {
      return { valid: false, error: { message: "JSON vacío" } };
    }

    try {
      const parsed = JSON.parse(json);
      
      // Validaciones adicionales
      const errors: string[] = [];
      
      // Verificar si es un objeto o array válido
      if (typeof parsed !== "object" || parsed === null) {
        if (typeof parsed !== "string" && typeof parsed !== "number" && typeof parsed !== "boolean") {
          errors.push("El JSON debe ser un objeto, array, string, número o booleano");
        }
      }

      // Verificar profundidad (prevenir objetos anidados excesivamente)
      const checkDepth = (obj: any, depth = 0, path = ""): void => {
        if (depth > 20) {
          errors.push(`Profundidad excesiva en ${path || "raíz"}`);
          return;
        }
        if (typeof obj === "object" && obj !== null) {
          for (const key in obj) {
            checkDepth(obj[key], depth + 1, path ? `${path}.${key}` : key);
          }
        }
      };
      checkDepth(parsed);

      if (errors.length > 0) {
        return { valid: false, error: { message: errors.join("; ") } };
      }

      return { valid: true, parsed };
    } catch (err: any) {
      // Extraer información del error
      const match = err.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : 0;
      
      // Calcular línea y columna aproximadas
      const lines = json.substring(0, position).split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      return {
        valid: false,
        error: {
          message: err.message,
          line,
          column,
        },
      };
    }
  };

  const formatJSON = () => {
    const validation = validateJSON(jsonInput);
    
    if (!validation.valid) {
      setIsValid(false);
      setValidationError(validation.error || null);
      setFormattedOutput("");
      toast({
        title: "Error de validación",
        description: validation.error?.message || "JSON inválido",
        variant: "destructive",
      });
      return;
    }

    try {
      const formatted = JSON.stringify(validation.parsed, null, 2);
      setFormattedOutput(formatted);
      setIsValid(true);
      setValidationError(null);
      toast({
        title: "JSON formateado",
        description: "El JSON ha sido formateado correctamente.",
      });
    } catch (err: any) {
      setIsValid(false);
      setValidationError({ message: err.message });
      toast({
        title: "Error",
        description: "Error al formatear el JSON.",
        variant: "destructive",
      });
    }
  };

  const minifyJSON = () => {
    const validation = validateJSON(jsonInput);
    
    if (!validation.valid) {
      setIsValid(false);
      setValidationError(validation.error || null);
      toast({
        title: "Error de validación",
        description: validation.error?.message || "JSON inválido",
        variant: "destructive",
      });
      return;
    }

    try {
      const minified = JSON.stringify(validation.parsed);
      setFormattedOutput(minified);
      setIsValid(true);
      setValidationError(null);
      toast({
        title: "JSON minificado",
        description: "El JSON ha sido minificado correctamente.",
      });
    } catch (err: any) {
      setIsValid(false);
      setValidationError({ message: err.message });
      toast({
        title: "Error",
        description: "Error al minificar el JSON.",
        variant: "destructive",
      });
    }
  };

  const compareJSON = () => {
    const validation1 = validateJSON(jsonInput);
    const validation2 = validateJSON(jsonInput2);

    if (!validation1.valid || !validation2.valid) {
      toast({
        title: "Error",
        description: "Ambos JSON deben ser válidos para comparar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const obj1 = validation1.parsed;
      const obj2 = validation2.parsed;

      const differences: string[] = [];
      
      // Comparar objetos
      const compareObjects = (obj1: any, obj2: any, path = ""): void => {
        const keys1 = new Set(Object.keys(obj1 || {}));
        const keys2 = new Set(Object.keys(obj2 || {}));

        // Claves solo en obj1
        keys1.forEach(key => {
          if (!keys2.has(key)) {
            differences.push(`- ${path ? `${path}.` : ""}${key} (solo en JSON 1)`);
          }
        });

        // Claves solo en obj2
        keys2.forEach(key => {
          if (!keys1.has(key)) {
            differences.push(`+ ${path ? `${path}.` : ""}${key} (solo en JSON 2)`);
          }
        });

        // Comparar valores comunes
        keys1.forEach(key => {
          if (keys2.has(key)) {
            const val1 = obj1[key];
            const val2 = obj2[key];
            const currentPath = path ? `${path}.${key}` : key;

            if (typeof val1 === "object" && typeof val2 === "object" && val1 !== null && val2 !== null) {
              if (Array.isArray(val1) && Array.isArray(val2)) {
                if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                  differences.push(`~ ${currentPath} (arrays diferentes)`);
                }
              } else {
                compareObjects(val1, val2, currentPath);
              }
            } else if (val1 !== val2) {
              differences.push(`~ ${currentPath}: "${val1}" → "${val2}"`);
            }
          }
        });
      };

      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
          differences.push(`~ Arrays tienen diferentes longitudes: ${obj1.length} vs ${obj2.length}`);
        }
        obj1.forEach((item, index) => {
          if (index < obj2.length && JSON.stringify(item) !== JSON.stringify(obj2[index])) {
            differences.push(`~ [${index}]: valores diferentes`);
          }
        });
      } else if (typeof obj1 === "object" && typeof obj2 === "object" && obj1 !== null && obj2 !== null) {
        compareObjects(obj1, obj2);
      } else if (obj1 !== obj2) {
        differences.push(`~ Valores diferentes: "${obj1}" vs "${obj2}"`);
      }

      if (differences.length === 0) {
        setDiffResult("✅ Los JSONs son idénticos");
      } else {
        setDiffResult(differences.join("\n"));
      }

      toast({
        title: "Comparación completada",
        description: differences.length === 0 ? "Los JSONs son idénticos" : `Se encontraron ${differences.length} diferencias`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Error al comparar los JSONs.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedOutput);
    toast({
      title: "Copiado",
      description: "El JSON ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Formateador de JSON</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Formatea, valida y compara JSON de forma avanzada.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList>
            <TabsTrigger value="format">Formatear</TabsTrigger>
            <TabsTrigger value="validate">Validar</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="diff">Comparar</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={formatJSON}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Formatear
              </Button>
              <Button onClick={minifyJSON} variant="outline">
                <Minimize2 className="h-4 w-4 mr-2" />
                Minificar
              </Button>
              {formattedOutput && (
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="json">JSON de Entrada</Label>
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
                    setValidationError(null);
                  }}
                  rows={20}
                  placeholder='{"name": "John", "age": 30}'
                  className="font-mono text-sm"
                />
                {validationError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md space-y-1">
                    <div className="font-semibold">Error de validación:</div>
                    <div>{validationError.message}</div>
                    {validationError.line && (
                      <div className="text-xs opacity-80">
                        Línea {validationError.line}, Columna {validationError.column}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
                <Label>JSON Formateado</Label>
                {formattedOutput ? (
                  <div className="mt-4 bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                    {formattedOutput}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <p>Ingresa JSON y haz clic en "Formatear"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validate" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={formatJSON}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Validar
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
              <Label htmlFor="validate-json">JSON a Validar</Label>
              <Textarea
                id="validate-json"
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setIsValid(null);
                  setValidationError(null);
                }}
                rows={20}
                placeholder='{"name": "John", "age": 30}'
                className="font-mono text-sm"
              />
              
              {isValid !== null && (
                <div className={`p-4 rounded-md ${
                  isValid 
                    ? "bg-green-500/10 border border-green-500/20" 
                    : "bg-destructive/10 border border-destructive/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-green-500">JSON Válido</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-destructive" />
                        <span className="font-semibold text-destructive">JSON Inválido</span>
                      </>
                    )}
                  </div>
                  {validationError && (
                    <div className="text-sm space-y-1">
                      <div><strong>Error:</strong> {validationError.message}</div>
                      {validationError.line && (
                        <div className="text-xs opacity-80">
                          Ubicación: Línea {validationError.line}, Columna {validationError.column}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schema" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => {
                  if (!jsonInput || !schemaInput) {
                    toast({
                      title: "Error",
                      description: "Por favor, ingresa tanto el JSON como el Schema.",
                      variant: "destructive",
                    });
                    return;
                  }
                  const result = validateAgainstSchema(jsonInput, schemaInput);
                  setSchemaValidationResult(result);
                  toast({
                    title: result.startsWith("✅") ? "Validación exitosa" : "Errores encontrados",
                    description: result.startsWith("✅") ? "El JSON es válido según el schema" : "Revisa los errores",
                    variant: result.startsWith("✅") ? "default" : "destructive",
                  });
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Validar contra Schema
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
                <Label htmlFor="json-schema">JSON Schema</Label>
                <Textarea
                  id="json-schema"
                  value={schemaInput}
                  onChange={(e) => setSchemaInput(e.target.value)}
                  rows={15}
                  placeholder='{"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}'
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
                <Label htmlFor="json-to-validate">JSON a Validar</Label>
                <Textarea
                  id="json-to-validate"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={15}
                  placeholder='{"name": "John"}'
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {schemaValidationResult && (
              <div className="mt-4 bg-card border border-border rounded-xl p-6">
                <Label>Resultado de Validación</Label>
                <div className="mt-4 bg-[#1E1E1E] rounded-md p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {schemaValidationResult}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="diff" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={compareJSON}>
                <GitCompare className="h-4 w-4 mr-2" />
                Comparar
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
                <Label htmlFor="json1">JSON 1</Label>
                <Textarea
                  id="json1"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={15}
                  placeholder='{"name": "John", "age": 30}'
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
                <Label htmlFor="json2">JSON 2</Label>
                <Textarea
                  id="json2"
                  value={jsonInput2}
                  onChange={(e) => setJsonInput2(e.target.value)}
                  rows={15}
                  placeholder='{"name": "Jane", "age": 25}'
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {diffResult && (
              <div className="mt-4 bg-card border border-border rounded-xl p-6">
                <Label>Diferencias</Label>
                <div className="mt-4 bg-[#1E1E1E] rounded-md p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {diffResult}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
