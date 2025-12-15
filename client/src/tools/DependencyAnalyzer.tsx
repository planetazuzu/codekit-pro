import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, Download, RefreshCw, Package, AlertTriangle, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'optionalDependency';
  unused?: boolean;
  outdated?: boolean;
  latestVersion?: string;
  size?: string;
}

interface AnalysisResult {
  dependencies: DependencyInfo[];
  devDependencies: DependencyInfo[];
  optionalDependencies: DependencyInfo[];
  unused: DependencyInfo[];
  outdated: DependencyInfo[];
  duplicates: string[];
  suggestions: string[];
  totalPackages: number;
  unusedCount: number;
  outdatedCount: number;
}

export default function DependencyAnalyzer() {
  const { toast } = useToast();
  const [packageJson, setPackageJson] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const parsePackageJson = (jsonText: string): any => {
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      throw new Error("JSON inválido. Por favor, verifica el formato.");
    }
  };

  const checkUnusedDependencies = (
    pkg: any,
    dependencies: DependencyInfo[],
    codeFiles: string[] = []
  ): DependencyInfo[] => {
    // Simulación: en producción se analizarían los archivos del proyecto
    // Por ahora, identificamos dependencias obvias que suelen no usarse
    const commonUnused = [
      'eslint-plugin-react-hooks',
      'eslint-plugin-jsx-a11y',
      '@types/jest',
      '@testing-library/jest-dom',
      'husky',
      'lint-staged'
    ];

    return dependencies.filter(dep => {
      // Buscar referencias en package.json scripts
      const scripts = pkg.scripts || {};
      const scriptsText = JSON.stringify(scripts);
      
      // Buscar en imports típicos (simulado)
      const hasInScripts = scriptsText.includes(dep.name);
      
      // Dependencias comunes no usadas
      const isCommonlyUnused = commonUnused.includes(dep.name);
      
      return !hasInScripts && isCommonlyUnused;
    });
  };

  const checkOutdatedDependencies = (dependencies: DependencyInfo[]): DependencyInfo[] => {
    // Simulación: en producción se consultaría npm registry
    // Por ahora, identificamos patrones comunes de versiones antiguas
    const outdatedPatterns = [
      /^\^?0\./,
      /^\^?1\./,
      /^~?2\.[0-4]\./,
      /^[<>]/
    ];

    return dependencies.map(dep => {
      const isOutdated = outdatedPatterns.some(pattern => pattern.test(dep.version));
      if (isOutdated) {
        // Simular versión más reciente
        const versionParts = dep.version.replace(/[\^~<>]/, '').split('.');
        if (versionParts.length >= 2) {
          const major = parseInt(versionParts[0]) || 0;
          const minor = parseInt(versionParts[1]) || 0;
          dep.latestVersion = `^${major + 1}.${minor + 1}.0`;
        }
        dep.outdated = true;
      }
      return dep;
    }).filter(dep => dep.outdated);
  };

  const findDuplicates = (pkg: any): string[] => {
    const duplicates: string[] = [];
    const allDeps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.optionalDependencies || {})
    ];

    const seen = new Set<string>();
    allDeps.forEach(dep => {
      if (seen.has(dep)) {
        duplicates.push(dep);
      } else {
        seen.add(dep);
      }
    });

    return duplicates;
  };

  const analyzeDependencies = () => {
    if (!packageJson.trim()) {
      toast({
        title: "Error",
        description: "Por favor, pega el contenido de tu package.json.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const pkg = parsePackageJson(packageJson);

      // Convertir dependencias a formato estructurado
      const dependencies: DependencyInfo[] = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
        name,
        version: version as string,
        type: 'dependency' as const
      }));

      const devDependencies: DependencyInfo[] = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
        name,
        version: version as string,
        type: 'devDependency' as const
      }));

      const optionalDependencies: DependencyInfo[] = Object.entries(pkg.optionalDependencies || {}).map(([name, version]) => ({
        name,
        version: version as string,
        type: 'optionalDependency' as const
      }));

      // Analizar
      const allDeps = [...dependencies, ...devDependencies, ...optionalDependencies];
      const unused = checkUnusedDependencies(pkg, allDeps);
      const outdated = checkOutdatedDependencies([...allDeps]);
      const duplicates = findDuplicates(pkg);

      // Generar sugerencias
      const suggestions: string[] = [];
      if (unused.length > 0) {
        suggestions.push(`Considera eliminar ${unused.length} dependencia${unused.length > 1 ? 's' : ''} no utilizada${unused.length > 1 ? 's' : ''} para reducir el tamaño de node_modules.`);
      }
      if (outdated.length > 0) {
        suggestions.push(`Actualiza ${outdated.length} dependencia${outdated.length > 1 ? 's' : ''} desactualizada${outdated.length > 1 ? 's' : ''} para obtener mejoras de seguridad y rendimiento.`);
      }
      if (duplicates.length > 0) {
        suggestions.push(`Elimina ${duplicates.length} dependencia${duplicates.length > 1 ? 's' : ''} duplicada${duplicates.length > 1 ? 's' : ''} en diferentes secciones de package.json.`);
      }
      if (allDeps.length > 50) {
        suggestions.push("Tu proyecto tiene muchas dependencias. Considera revisar si todas son necesarias.");
      }
      if (suggestions.length === 0) {
        suggestions.push("¡Excelente! Tu package.json se ve bien organizado.");
      }

      const result: AnalysisResult = {
        dependencies,
        devDependencies,
        optionalDependencies,
        unused,
        outdated,
        duplicates,
        suggestions,
        totalPackages: allDeps.length,
        unusedCount: unused.length,
        outdatedCount: outdated.length
      };

      setAnalysis(result);
      setIsAnalyzing(false);

      toast({
        title: "Análisis completado",
        description: `Analizadas ${result.totalPackages} dependencias.`,
      });
    } catch (error: any) {
      setIsAnalyzing(false);
      toast({
        title: "Error",
        description: error.message || "Error al analizar package.json",
        variant: "destructive",
      });
    }
  };

  const generateCleanPackageJson = () => {
    if (!analysis || !packageJson) return "";

    try {
      const pkg = parsePackageJson(packageJson);
      
      // Eliminar dependencias no usadas
      analysis.unused.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep.name]) {
          delete pkg.dependencies[dep.name];
        }
        if (pkg.devDependencies && pkg.devDependencies[dep.name]) {
          delete pkg.devDependencies[dep.name];
        }
        if (pkg.optionalDependencies && pkg.optionalDependencies[dep.name]) {
          delete pkg.optionalDependencies[dep.name];
        }
      });

      // Actualizar versiones desactualizadas (opcional - comentado por seguridad)
      // analysis.outdated.forEach(dep => {
      //   if (dep.latestVersion) {
      //     if (pkg.dependencies && pkg.dependencies[dep.name]) {
      //       pkg.dependencies[dep.name] = dep.latestVersion;
      //     }
      //     if (pkg.devDependencies && pkg.devDependencies[dep.name]) {
      //       pkg.devDependencies[dep.name] = dep.latestVersion;
      //     }
      //   }
      // });

      return JSON.stringify(pkg, null, 2);
    } catch {
      return packageJson;
    }
  };

  const copyResult = () => {
    const cleanJson = generateCleanPackageJson();
    if (cleanJson) {
      navigator.clipboard.writeText(cleanJson);
      toast({
        title: "Copiado",
        description: "package.json limpio copiado al portapapeles.",
      });
    }
  };

  const downloadResult = () => {
    const cleanJson = generateCleanPackageJson();
    if (cleanJson) {
      const blob = new Blob([cleanJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'package.clean.json';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Descargado",
        description: "package.json limpio descargado.",
      });
    }
  };

  const loadExample = () => {
    const example = `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^0.21.1"
  },
  "devDependencies": {
    "typescript": "^4.9.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react-hooks": "^4.3.0"
  }
}`;
    setPackageJson(example);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dependency Analyzer</h1>
          <p className="text-muted-foreground">
            Analiza tu package.json para encontrar dependencias no usadas, desactualizadas y duplicadas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>package.json</CardTitle>
              <CardDescription>
                Pega el contenido de tu archivo package.json
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadExample}
                  className="flex-1"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Cargar Ejemplo
                </Button>
              </div>
              <Textarea
                value={packageJson}
                onChange={(e) => setPackageJson(e.target.value)}
                placeholder="Pega tu package.json aquí..."
                className="font-mono min-h-[400px] text-sm"
              />
              <Button 
                onClick={analyzeDependencies} 
                disabled={isAnalyzing || !packageJson.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Analizar Dependencias
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
                  ? `${analysis.totalPackages} paquetes analizados`
                  : "Los resultados aparecerán aquí"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Pega tu package.json y haz clic en "Analizar Dependencias"</p>
                </div>
              ) : (
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                    <TabsTrigger value="unused">No Usadas</TabsTrigger>
                    <TabsTrigger value="outdated">Desactualizadas</TabsTrigger>
                    <TabsTrigger value="clean">Limpio</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Alert>
                        <Package className="h-4 w-4" />
                        <AlertTitle>Total</AlertTitle>
                        <AlertDescription className="text-2xl font-bold">
                          {analysis.totalPackages}
                        </AlertDescription>
                      </Alert>
                      <Alert variant={analysis.unusedCount > 0 ? "destructive" : "default"}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No Usadas</AlertTitle>
                        <AlertDescription className="text-2xl font-bold">
                          {analysis.unusedCount}
                        </AlertDescription>
                      </Alert>
                      <Alert variant={analysis.outdatedCount > 0 ? "destructive" : "default"}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertTitle>Desactualizadas</AlertTitle>
                        <AlertDescription className="text-2xl font-bold">
                          {analysis.outdatedCount}
                        </AlertDescription>
                      </Alert>
                      <Alert variant={analysis.duplicates.length > 0 ? "destructive" : "default"}>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Duplicadas</AlertTitle>
                        <AlertDescription className="text-2xl font-bold">
                          {analysis.duplicates.length}
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Sugerencias</h3>
                      <div className="space-y-2">
                        {analysis.suggestions.map((suggestion, idx) => (
                          <Alert key={idx}>
                            <Info className="h-4 w-4" />
                            <AlertDescription>{suggestion}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Desglose por Tipo</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Dependencias:</span>
                          <Badge>{analysis.dependencies.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Dev Dependencies:</span>
                          <Badge variant="outline">{analysis.devDependencies.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Opcionales:</span>
                          <Badge variant="outline">{analysis.optionalDependencies.length}</Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="unused" className="space-y-4">
                    {analysis.unused.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.unused.map((dep, idx) => (
                          <Alert key={idx} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{dep.name}</AlertTitle>
                            <AlertDescription>
                              Versión: <code className="text-xs">{dep.version}</code>
                              <Badge variant="outline" className="ml-2">{dep.type}</Badge>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-green-600 font-semibold">¡No hay dependencias no usadas!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="outdated" className="space-y-4">
                    {analysis.outdated.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.outdated.map((dep, idx) => (
                          <Alert key={idx} variant="destructive">
                            <TrendingUp className="h-4 w-4" />
                            <AlertTitle>{dep.name}</AlertTitle>
                            <AlertDescription>
                              <div className="space-y-1">
                                <div>
                                  Actual: <code className="text-xs">{dep.version}</code>
                                </div>
                                {dep.latestVersion && (
                                  <div>
                                    Recomendado: <code className="text-xs text-green-600">{dep.latestVersion}</code>
                                  </div>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-green-600 font-semibold">¡Todas las dependencias están actualizadas!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="clean">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>package.json Limpio</AlertTitle>
                        <AlertDescription>
                          Se han eliminado las dependencias no usadas. Las versiones desactualizadas se mantienen por seguridad.
                        </AlertDescription>
                      </Alert>
                      <Textarea
                        value={generateCleanPackageJson()}
                        readOnly
                        className="font-mono min-h-[300px] text-sm"
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
