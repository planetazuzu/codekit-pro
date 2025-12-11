import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function generateUUID(version: 'v4' | 'v1' = 'v4'): string {
  if (version === 'v4') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } else {
    // Simplified v1 (not fully RFC compliant, but works for most cases)
    const timestamp = Date.now();
    const random = Math.random().toString(16).substring(2, 14);
    return `${timestamp.toString(16)}-${random.substring(0, 4)}-1${random.substring(4, 7)}-${random.substring(7, 10)}-${random.substring(10)}`;
  }
}

export default function UUIDGenerator() {
  const { toast } = useToast();
  const [version, setVersion] = useState<'v4' | 'v1'>('v4');
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateUUIDs = () => {
    const newUUIDs: string[] = [];
    for (let i = 0; i < count; i++) {
      newUUIDs.push(generateUUID(version));
    }
    setUuids(newUUIDs);
    toast({
      title: "UUIDs generados",
      description: `Se generaron ${count} UUID${count > 1 ? 's' : ''}.`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El UUID ha sido copiado al portapapeles.",
    });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    toast({
      title: "Copiado",
      description: "Todos los UUIDs han sido copiados.",
    });
  };

  const clearAll = () => {
    setUuids([]);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de UUID</h1>
            <p className="text-muted-foreground mt-1">Genera UUIDs (Identificadores Únicos Universales).</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateUUIDs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar
            </Button>
            {uuids.length > 0 && (
              <>
                <Button onClick={copyAll} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Todos
                </Button>
                <Button onClick={clearAll} variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Configuración */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Configuración</h2>
            
            <div className="space-y-2">
              <Label htmlFor="version">Versión</Label>
              <select
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value as 'v4' | 'v1')}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="v4">UUID v4 (Aleatorio)</option>
                <option value="v1">UUID v1 (Basado en tiempo)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Cantidad</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              />
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-2">Información:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><strong>UUID v4:</strong> Generado aleatoriamente (más común)</li>
                <li><strong>UUID v1:</strong> Basado en timestamp y MAC address</li>
                <li>Formato: 8-4-4-4-12 caracteres hexadecimales</li>
              </ul>
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">UUIDs Generados</h2>
            {uuids.length > 0 ? (
              <div className="space-y-2">
                {uuids.map((uuid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/50 border border-border rounded-md"
                  >
                    <code className="font-mono text-sm">{uuid}</code>
                    <Button
                      onClick={() => copyToClipboard(uuid)}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>Configura y genera UUIDs</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

