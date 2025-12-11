import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function generateTailwindConfig(colors: string[]) {
  const colorMap: Record<string, string> = {};
  colors.forEach((color, index) => {
    colorMap[`color-${index + 1}`] = color;
  });

  return `module.exports = {
  theme: {
    extend: {
      colors: {
${colors
  .map(
    (color, index) =>
      `        'custom-${index + 1}': '${color}',`
  )
  .join("\n")}
      },
    },
  },
}`;
}

function generateCSSVariables(colors: string[]) {
  return `:root {
${colors
  .map((color, index) => `  --color-${index + 1}: ${color};`)
  .join("\n")}
}`;
}

export default function ColorGenerator() {
  const { toast } = useToast();
  const [colors, setColors] = useState<string[]>(["#3b82f6", "#8b5cf6", "#ec4899"]);
  const [tailwindConfig, setTailwindConfig] = useState("");
  const [cssVariables, setCssVariables] = useState("");

  const addColor = () => {
    setColors([...colors, "#000000"]);
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const generatePalette = () => {
    const tailwind = generateTailwindConfig(colors);
    const css = generateCSSVariables(colors);
    setTailwindConfig(tailwind);
    setCssVariables(css);
    toast({
      title: "Paleta generada",
      description: "La configuración ha sido generada correctamente.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
            <h1 className="text-3xl font-bold tracking-tight">Generador de Paletas de Colores</h1>
            <p className="text-muted-foreground mt-1">Crea y exporta paletas de colores en formato Tailwind CSS.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generatePalette}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar
            </Button>
            {tailwindConfig && (
              <>
                <Button onClick={() => copyToClipboard(tailwindConfig)} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Tailwind
                </Button>
                <Button onClick={() => copyToClipboard(cssVariables)} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar CSS
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Color Picker */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Colores</h2>
            
            <div className="space-y-3">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-md border border-border"
                    style={{ backgroundColor: color }}
                  />
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-24 h-10"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  {colors.length > 1 && (
                    <Button
                      onClick={() => removeColor(index)}
                      variant="outline"
                      size="sm"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={addColor} variant="outline" className="w-full">
              + Añadir Color
            </Button>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3">Vista Previa</h3>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 min-w-[100px] h-20 rounded-md border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Código Generado</h2>
            
            {tailwindConfig ? (
              <>
                <div>
                  <Label>Tailwind Config</Label>
                  <Textarea
                    value={tailwindConfig}
                    readOnly
                    rows={12}
                    className="font-mono text-xs mt-2"
                  />
                </div>
                <div>
                  <Label>CSS Variables</Label>
                  <Textarea
                    value={cssVariables}
                    readOnly
                    rows={6}
                    className="font-mono text-xs mt-2"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona colores y haz clic en "Generar"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

