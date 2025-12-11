import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const commonPatterns = [
  { name: "Email", pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$" },
  { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)" },
  { name: "Phone", pattern: "^\\+?[1-9]\\d{1,14}$" },
  { name: "IPv4", pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" },
  { name: "Hex Color", pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
  { name: "Date (YYYY-MM-DD)", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
];

export default function RegexTester() {
  const { toast } = useToast();
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState("g");
  const [matches, setMatches] = useState<RegExpMatchArray | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, flags);
      const result = testString.match(regex);
      setMatches(result);
      setIsValid(true);
      toast({
        title: "Regex probado",
        description: result ? `${result.length} coincidencias encontradas` : "No se encontraron coincidencias",
      });
    } catch (err: any) {
      setIsValid(false);
      setMatches(null);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const usePattern = (selectedPattern: string) => {
    setPattern(selectedPattern);
    toast({
      title: "Patrón aplicado",
      description: "El patrón ha sido aplicado.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Probador de Regex</h1>
            <p className="text-muted-foreground mt-1">Prueba y valida expresiones regulares en tiempo real.</p>
          </div>
          <Button onClick={testRegex}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Probar Regex
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Configuración */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Configuración</h2>
            
            <div className="space-y-2">
              <Label htmlFor="pattern">Patrón Regex</Label>
              <Input
                id="pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="^[a-zA-Z0-9]+$"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flags">Flags (g, i, m, s, u, y)</Label>
              <Input
                id="flags"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="g"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Patrones Comunes</Label>
              <div className="grid grid-cols-2 gap-2">
                {commonPatterns.map((p) => (
                  <Button
                    key={p.name}
                    onClick={() => usePattern(p.pattern)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test">Texto de Prueba</Label>
              <Textarea
                id="test"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                rows={10}
                placeholder="Ingresa el texto a probar aquí..."
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Resultado */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Resultados</h2>
            {isValid !== null && (
              <div className="mb-4 flex items-center gap-2">
                {isValid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-500">Regex válido</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-500">Regex inválido</span>
                  </>
                )}
              </div>
            )}
            {matches ? (
              <div className="space-y-4">
                <div>
                  <Label>Coincidencias encontradas: {matches.length}</Label>
                  <div className="mt-2 bg-[#1E1E1E] rounded-md p-4 font-mono text-sm space-y-1">
                    {matches.map((match, index) => (
                      <div key={index} className="text-green-400">
                        [{index}]: {match}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>Ingresa un patrón y texto de prueba</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

