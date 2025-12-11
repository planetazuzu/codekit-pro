import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, CheckCircle, XCircle, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function JSONFormatter() {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState("");
  const [formattedOutput, setFormattedOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedOutput(formatted);
      setIsValid(true);
      setError("");
      toast({
        title: "JSON formateado",
        description: "El JSON ha sido formateado correctamente.",
      });
    } catch (err: any) {
      setIsValid(false);
      setError(err.message);
      setFormattedOutput("");
      toast({
        title: "Error",
        description: "JSON inválido. Por favor, verifica el formato.",
        variant: "destructive",
      });
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setFormattedOutput(minified);
      setIsValid(true);
      setError("");
      toast({
        title: "JSON minificado",
        description: "El JSON ha sido minificado correctamente.",
      });
    } catch (err: any) {
      setIsValid(false);
      setError(err.message);
      toast({
        title: "Error",
        description: "JSON inválido.",
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
            <h1 className="text-3xl font-bold tracking-tight">Formateador de JSON</h1>
            <p className="text-muted-foreground mt-1">Formatea y valida JSON de forma rápida.</p>
          </div>
          <div className="flex gap-2">
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
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Input */}
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
                setError("");
              }}
              rows={20}
              placeholder='{"name": "John", "age": 30}'
              className="font-mono text-sm"
            />
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Output */}
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
      </div>
    </Layout>
  );
}

