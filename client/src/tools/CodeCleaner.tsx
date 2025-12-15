import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, Download, RefreshCw, FileX, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UnusedImport {
  file: string;
  imports: string[];
  line: number;
}

interface DeadCode {
  file: string;
  functions: string[];
  variables: string[];
  classes: string[];
}

interface AnalysisResult {
  unusedImports: UnusedImport[];
  deadCode: DeadCode[];
  duplicateCode: string[];
  suggestions: string[];
}

export default function CodeCleaner() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const detectUnusedImports = (codeText: string): UnusedImport[] => {
    const lines = codeText.split('\n');
    const imports: UnusedImport[] = [];
    const importedItems = new Set<string>();
    const usedItems = new Set<string>();

    // Detectar imports
    lines.forEach((line, index) => {
      const importMatch = line.match(/import\s+(?:(?:\*\s+as\s+(\w+))|(?:\{([^}]+)\})|(\w+))\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const namespace = importMatch[1];
        const namedImports = importMatch[2];
        const defaultImport = importMatch[3];

        if (namespace) {
          importedItems.add(namespace);
        }
        if (namedImports) {
          namedImports.split(',').forEach(imp => {
            const clean = imp.trim().split(' as ')[0].trim();
            if (clean) importedItems.add(clean);
          });
        }
        if (defaultImport) {
          importedItems.add(defaultImport);
        }
      }

      // Detectar uso de items
      if (!line.trim().startsWith('import') && !line.trim().startsWith('//')) {
        importedItems.forEach(item => {
          const regex = new RegExp(`\\b${item}\\b`, 'g');
          if (regex.test(line)) {
            usedItems.add(item);
          }
        });
      }
    });

    // Encontrar imports no usados
    const unused = Array.from(importedItems).filter(item => !usedItems.has(item));
    
    if (unused.length > 0) {
      imports.push({
        file: "current-file.ts",
        imports: unused,
        line: 1
      });
    }

    return imports;
  };

  const detectDeadCode = (codeText: string): DeadCode[] => {
    const functions: string[] = [];
    const variables: string[] = [];
    const classes: string[] = [];

    // Detectar funciones
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = functionRegex.exec(codeText)) !== null) {
      const funcName = match[1];
      const funcUsage = new RegExp(`\\b${funcName}\\b`, 'g');
      const matches = codeText.match(funcUsage);
      if (matches && matches.length <= 1) {
        functions.push(funcName);
      }
    }

    // Detectar variables exportadas que no se usan
    const constRegex = /export\s+const\s+(\w+)\s*=/g;
    while ((match = constRegex.exec(codeText)) !== null) {
      const varName = match[1];
      const varUsage = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = codeText.match(varUsage);
      if (matches && matches.length <= 1) {
        variables.push(varName);
      }
    }

    // Detectar clases
    const classRegex = /export\s+class\s+(\w+)/g;
    while ((match = classRegex.exec(codeText)) !== null) {
      const className = match[1];
      const classUsage = new RegExp(`\\b${className}\\b`, 'g');
      const matches = codeText.match(classUsage);
      if (matches && matches.length <= 1) {
        classes.push(className);
      }
    }

    if (functions.length > 0 || variables.length > 0 || classes.length > 0) {
      return [{
        file: "current-file.ts",
        functions,
        variables,
        classes
      }];
    }

    return [];
  };

  const detectDuplicateCode = (codeText: string): string[] => {
    const duplicates: string[] = [];
    const lines = codeText.split('\n');
    const blockSize = 5;
    
    for (let i = 0; i < lines.length - blockSize; i++) {
      const block = lines.slice(i, i + blockSize).join('\n');
      const occurrences = codeText.split(block).length - 1;
      
      if (occurrences > 1 && block.trim().length > 50) {
        duplicates.push(`Líneas ${i + 1}-${i + blockSize}: Código duplicado (${occurrences} veces)`);
      }
    }

    return [...new Set(duplicates)];
  };

  const generateSuggestions = (result: AnalysisResult): string[] => {
    const suggestions: string[] = [];

    if (result.unusedImports.length > 0) {
      suggestions.push(`Elimina ${result.unusedImports.reduce((acc, imp) => acc + imp.imports.length, 0)} imports no utilizados para reducir el tamaño del bundle.`);
    }

    if (result.deadCode.length > 0) {
      const totalDead = result.deadCode.reduce((acc, dc) => 
        acc + dc.functions.length + dc.variables.length + dc.classes.length, 0);
      if (totalDead > 0) {
        suggestions.push(`Considera eliminar ${totalDead} elementos de código muerto para mejorar la mantenibilidad.`);
      }
    }

    if (result.duplicateCode.length > 0) {
      suggestions.push(`Refactoriza ${result.duplicateCode.length} bloques de código duplicado en funciones reutilizables.`);
    }

    if (suggestions.length === 0) {
      suggestions.push("¡Excelente! No se encontraron problemas significativos en tu código.");
    }

    return suggestions;
  };

  const analyzeCode = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa código para analizar.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simular análisis asíncrono
    setTimeout(() => {
      const unusedImports = detectUnusedImports(code);
      const deadCode = detectDeadCode(code);
      const duplicateCode = detectDuplicateCode(code);

      const result: AnalysisResult = {
        unusedImports,
        deadCode,
        duplicateCode,
        suggestions: []
      };

      result.suggestions = generateSuggestions(result);
      setAnalysis(result);
      setIsAnalyzing(false);

      toast({
        title: "Análisis completado",
        description: "Revisa los resultados y sugerencias.",
      });
    }, 500);
  };

  const generateCleanCode = () => {
    if (!analysis || !code) return "";

    let cleanCode = code;

    // Eliminar imports no usados
    analysis.unusedImports.forEach(({ imports }) => {
      imports.forEach(imp => {
        const importRegex = new RegExp(`import\\s+.*\\b${imp}\\b.*from\\s+['"][^'"]+['"];?\\n?`, 'g');
        cleanCode = cleanCode.replace(importRegex, '');
      });
    });

    return cleanCode;
  };

  const copyResult = () => {
    const cleanCode = generateCleanCode();
    if (cleanCode) {
      navigator.clipboard.writeText(cleanCode);
      toast({
        title: "Copiado",
        description: "Código limpio copiado al portapapeles.",
      });
    }
  };

  const downloadResult = () => {
    const cleanCode = generateCleanCode();
    if (cleanCode) {
      const blob = new Blob([cleanCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned-code.ts';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Descargado",
        description: "Código limpio descargado.",
      });
    }
  };

  const totalIssues = analysis 
    ? analysis.unusedImports.reduce((acc, imp) => acc + imp.imports.length, 0) +
      analysis.deadCode.reduce((acc, dc) => acc + dc.functions.length + dc.variables.length + dc.classes.length, 0) +
      analysis.duplicateCode.length
    : 0;

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Code Cleaner</h1>
          <p className="text-muted-foreground">
            Analiza tu código para encontrar imports no usados, código muerto y duplicaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Código a Analizar</CardTitle>
              <CardDescription>
                Pega tu código TypeScript/JavaScript aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Pega tu código aquí...&#10;&#10;Ejemplo:&#10;import { useState, useEffect } from 'react';&#10;import { unused } from './utils';&#10;&#10;export function MyComponent() {&#10;  const [count, setCount] = useState(0);&#10;  return &lt;div&gt;{count}&lt;/div&gt;;&#10;}"
                className="font-mono min-h-[400px]"
              />
              <Button 
                onClick={analyzeCode} 
                disabled={isAnalyzing || !code.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analizar Código
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultados del Análisis</CardTitle>
              <CardDescription>
                {analysis 
                  ? `${totalIssues} problema${totalIssues !== 1 ? 's' : ''} encontrado${totalIssues !== 1 ? 's' : ''}`
                  : "Los resultados aparecerán aquí"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="text-center text-muted-foreground py-8">
                  <FileX className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Ingresa código y haz clic en "Analizar Código"</p>
                </div>
              ) : (
                <Tabs defaultValue="issues" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="issues">Problemas</TabsTrigger>
                    <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
                    <TabsTrigger value="clean">Código Limpio</TabsTrigger>
                  </TabsList>

                  <TabsContent value="issues" className="space-y-4">
                    {analysis.unusedImports.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Imports No Usados
                        </h3>
                        {analysis.unusedImports.map((imp, idx) => (
                          <div key={idx} className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 mb-2">
                            <p className="text-sm font-mono mb-1">{imp.file}</p>
                            <div className="flex flex-wrap gap-1">
                              {imp.imports.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-yellow-600">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {analysis.deadCode.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Código Muerto
                        </h3>
                        {analysis.deadCode.map((dc, idx) => (
                          <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-2">
                            <p className="text-sm font-mono mb-2">{dc.file}</p>
                            {dc.functions.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs text-muted-foreground">Funciones:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {dc.functions.map((func, i) => (
                                    <Badge key={i} variant="outline" className="text-red-600">
                                      {func}()
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {dc.variables.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs text-muted-foreground">Variables:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {dc.variables.map((var_, i) => (
                                    <Badge key={i} variant="outline" className="text-red-600">
                                      {var_}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {dc.classes.length > 0 && (
                              <div>
                                <span className="text-xs text-muted-foreground">Clases:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {dc.classes.map((cls, i) => (
                                    <Badge key={i} variant="outline" className="text-red-600">
                                      {cls}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {analysis.duplicateCode.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Código Duplicado
                        </h3>
                        {analysis.duplicateCode.map((dup, idx) => (
                          <div key={idx} className="bg-orange-500/10 border border-orange-500/20 rounded p-3 mb-2">
                            <p className="text-sm">{dup}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {totalIssues === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-green-600 font-semibold">¡No se encontraron problemas!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="suggestions">
                    <div className="space-y-2">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="clean">
                    <div className="space-y-4">
                      <Textarea
                        value={generateCleanCode()}
                        readOnly
                        className="font-mono min-h-[300px]"
                      />
                      <div className="flex gap-2">
                        <Button onClick={copyResult} variant="outline" className="flex-1">
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar
                        </Button>
                        <Button onClick={downloadResult} variant="outline" className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
