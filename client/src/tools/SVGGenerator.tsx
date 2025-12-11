import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, Download, RefreshCw, Code2 } from "lucide-react";
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

const shapes = {
  circle: {
    name: "Círculo",
    template: (size: number, color: string) =>
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="${color}" />`,
  },
  square: {
    name: "Cuadrado",
    template: (size: number, color: string) =>
      `<rect x="${size / 4}" y="${size / 4}" width="${size / 2}" height="${size / 2}" fill="${color}" />`,
  },
  triangle: {
    name: "Triángulo",
    template: (size: number, color: string) =>
      `<polygon points="${size / 2},${size / 4} ${size / 4},${size * 0.75} ${size * 0.75},${size * 0.75}" fill="${color}" />`,
  },
  star: {
    name: "Estrella",
    template: (size: number, color: string) => {
      const center = size / 2;
      const outerRadius = size / 3;
      const innerRadius = size / 6;
      const points = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = center + radius * Math.cos(angle - Math.PI / 2);
        const y = center + radius * Math.sin(angle - Math.PI / 2);
        points.push(`${x},${y}`);
      }
      return `<polygon points="${points.join(" ")}" fill="${color}" />`;
    },
  },
};

export default function SVGGenerator() {
  const { toast } = useToast();
  const [selectedShape, setSelectedShape] = useState<string>("circle");
  const [size, setSize] = useState(100);
  const [color, setColor] = useState("#3b82f6");
  const [customSVG, setCustomSVG] = useState("");
  const [svgOutput, setSvgOutput] = useState("");

  const generateSVG = () => {
    let svg = "";
    
    if (selectedShape === "custom") {
      svg = customSVG;
    } else {
      const shapeTemplate = shapes[selectedShape as keyof typeof shapes];
      svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  ${shapeTemplate.template(size, color)}
</svg>`;
    }

    setSvgOutput(svg);
    toast({
      title: "SVG generado",
      description: "El SVG ha sido generado correctamente.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(svgOutput);
    toast({
      title: "Copiado",
      description: "El código SVG ha sido copiado al portapapeles.",
    });
  };

  const downloadSVG = () => {
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `icon-${selectedShape}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Descargado",
      description: "El SVG ha sido descargado.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de Iconos SVG</h1>
            <p className="text-muted-foreground mt-1">Generador rápido de iconos SVG simples.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateSVG}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar
            </Button>
            {svgOutput && (
              <>
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar SVG
                </Button>
                <Button onClick={downloadSVG} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
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
              <Label htmlFor="shape">Forma</Label>
              <Select value={selectedShape} onValueChange={setSelectedShape}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(shapes).map(([key, shape]) => (
                    <SelectItem key={key} value={key}>
                      {shape.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedShape !== "custom" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Tamaño (px)</Label>
                    <Input
                      id="size"
                      type="number"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      min={10}
                      max={500}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Label>Vista Previa</Label>
                  <div className="mt-2 p-4 bg-secondary/30 border border-border rounded-md flex items-center justify-center">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: shapes[selectedShape as keyof typeof shapes].template(size, color),
                      }}
                      style={{ width: size, height: size }}
                    />
                  </div>
                </div>
              </>
            )}

            {selectedShape === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom">SVG Personalizado</Label>
                <Textarea
                  id="custom"
                  value={customSVG}
                  onChange={(e) => setCustomSVG(e.target.value)}
                  rows={15}
                  placeholder='<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">&#10;  <!-- Tu código SVG aquí -->&#10;</svg>'
                  className="font-mono text-sm"
                />
              </div>
            )}
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Código SVG</h2>
            {svgOutput ? (
              <div className="space-y-4">
                <div className="bg-secondary/30 border border-border rounded-md p-4 flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: svgOutput }} />
                </div>
                <Textarea
                  value={svgOutput}
                  readOnly
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona una forma y haz clic en "Generar"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

