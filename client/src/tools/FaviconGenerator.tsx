import { Layout } from "@/layout/Layout";
import { useState, useRef } from "react";
import { Copy, Download, Upload, Type, Image as ImageIcon } from "lucide-react";
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

const sizes = [
  { size: 16, name: "16x16" },
  { size: 32, name: "32x32" },
  { size: 48, name: "48x48" },
  { size: 64, name: "64x64" },
  { size: 128, name: "128x128" },
  { size: 256, name: "256x256" },
];

function generateFaviconHTML(faviconUrl: string, sizes: string[]) {
  return sizes
    .map((size) => `<link rel="icon" type="image/png" sizes="${size}x${size}" href="${faviconUrl}" />`)
    .join("\n");
}

export default function FaviconGenerator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("CK");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedSize, setSelectedSize] = useState("32");
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [faviconDataUrl, setFaviconDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateFavicon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = parseInt(selectedSize);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (mode === "text") {
      // Fondo
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Texto
      ctx.fillStyle = textColor;
      ctx.font = `bold ${size * 0.6}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text.substring(0, 2).toUpperCase(), size / 2, size / 2);
    } else if (mode === "image" && uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        setFaviconDataUrl(canvas.toDataURL("image/png"));
      };
      img.src = uploadedImage;
      return;
    }

    setFaviconDataUrl(canvas.toDataURL("image/png"));
    toast({
      title: "Favicon generado",
      description: "El favicon ha sido generado correctamente.",
    });
  };

  const downloadFavicon = () => {
    if (!faviconDataUrl) return;

    const link = document.createElement("a");
    link.download = `favicon-${selectedSize}x${selectedSize}.png`;
    link.href = faviconDataUrl;
    link.click();

    toast({
      title: "Descargado",
      description: "El favicon ha sido descargado.",
    });
  };

  const copyHTML = () => {
    const html = generateFaviconHTML(faviconDataUrl, [selectedSize]);
    navigator.clipboard.writeText(html);
    toast({
      title: "Copiado",
      description: "El código HTML ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de Favicons</h1>
            <p className="text-muted-foreground mt-1">Genera favicons en múltiples formatos desde texto o imagen.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateFavicon}>
              Generar Favicon
            </Button>
            {faviconDataUrl && (
              <>
                <Button onClick={downloadFavicon} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button onClick={copyHTML} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar HTML
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
              <Label>Modo</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "text" | "image")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Desde Texto</SelectItem>
                  <SelectItem value="image">Desde Imagen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "text" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="text">Texto (máx 2 caracteres)</Label>
                  <Input
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value.substring(0, 2))}
                    maxLength={2}
                    placeholder="CK"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bgColor">Color de Fondo</Label>
                    <Input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Color de Texto</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "image" && (
              <div className="space-y-2">
                <Label>Subir Imagen</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">Haz clic para subir</p>
                </label>
                {uploadedImage && (
                  <div className="mt-2">
                    <img src={uploadedImage} alt="Preview" className="max-w-full h-32 object-contain rounded-md border border-border" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="size">Tamaño</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => (
                    <SelectItem key={s.size} value={s.size.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview y Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Vista Previa</h2>
            
            <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 border border-border rounded-md">
              <canvas ref={canvasRef} className="hidden" />
              {faviconDataUrl ? (
                <>
                  <img src={faviconDataUrl} alt="Favicon" className="mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Tamaño: {selectedSize}x{selectedSize}px
                  </p>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configura y genera el favicon</p>
                </div>
              )}
            </div>

            {faviconDataUrl && (
              <div className="space-y-2">
                <Label>HTML para usar</Label>
                <Textarea
                  value={generateFaviconHTML(faviconDataUrl, [selectedSize])}
                  readOnly
                  rows={3}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

