import { Layout } from "@/layout/Layout";
import { useState, useRef } from "react";
import { Download, Upload, Maximize, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const deviceFrames = {
  macbook: {
    name: "MacBook",
    width: 1440,
    height: 900,
    frameColor: "#1e1e1e",
  },
  iphone: {
    name: "iPhone",
    width: 390,
    height: 844,
    frameColor: "#000000",
  },
  ipad: {
    name: "iPad",
    width: 768,
    height: 1024,
    frameColor: "#1e1e1e",
  },
  desktop: {
    name: "Desktop",
    width: 1920,
    height: 1080,
    frameColor: "#2d2d2d",
  },
};

const backgrounds = [
  { value: "transparent", label: "Transparente" },
  { value: "#ffffff", label: "Blanco" },
  { value: "#000000", label: "Negro" },
  { value: "#f5f5f5", label: "Gris Claro" },
  { value: "gradient", label: "Gradiente" },
];

export default function MockupGenerator() {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState("macbook");
  const [selectedBackground, setSelectedBackground] = useState("transparent");
  const [padding, setPadding] = useState(20);
  const [shadow, setShadow] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo de imagen.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateMockup = () => {
    if (!uploadedImage) {
      toast({
        title: "Error",
        description: "Por favor, sube una imagen primero.",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const device = deviceFrames[selectedDevice as keyof typeof deviceFrames];
    const img = new Image();
    
    img.onload = () => {
      // Calcular dimensiones
      const scale = Math.min(
        (device.width - padding * 2) / img.width,
        (device.height - padding * 2) / img.height
      );
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (device.width - scaledWidth) / 2;
      const y = (device.height - scaledHeight) / 2;

      canvas.width = device.width;
      canvas.height = device.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fondo
      if (selectedBackground === "gradient") {
        const gradient = ctx.createLinearGradient(0, 0, device.width, device.height);
        gradient.addColorStop(0, "#667eea");
        gradient.addColorStop(1, "#764ba2");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = selectedBackground;
      }
      ctx.fillRect(0, 0, device.width, device.height);

      // Sombra del dispositivo
      if (shadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
      }

      // Frame del dispositivo
      ctx.fillStyle = device.frameColor;
      ctx.fillRect(0, 0, device.width, device.height);

      // Imagen
      ctx.shadowBlur = 0;
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      toast({
        title: "Mockup generado",
        description: "El mockup ha sido generado correctamente.",
      });
    };

    img.src = uploadedImage;
  };

  const downloadMockup = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `mockup-${selectedDevice}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    toast({
      title: "Descargado",
      description: "El mockup ha sido descargado.",
    });
  };

  const clearImage = () => {
    setUploadedImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de Mockups</h1>
            <p className="text-muted-foreground mt-1">Embellece tus capturas de pantalla con marcos y fondos.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateMockup} disabled={!uploadedImage}>
              Generar Mockup
            </Button>
            {uploadedImage && (
              <>
                <Button onClick={downloadMockup} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button onClick={clearImage} variant="outline">
                  <X className="h-4 w-4 mr-2" />
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
              <Label>Subir Captura</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors block"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">Haz clic para subir captura</p>
              </label>
              {uploadedImage && (
                <div className="mt-2 relative">
                  <img src={uploadedImage} alt="Screenshot" className="max-w-full h-32 object-contain rounded-md border border-border" />
                  <Button
                    onClick={clearImage}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="device">Dispositivo</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(deviceFrames).map(([key, device]) => (
                    <SelectItem key={key} value={key}>
                      {device.name} ({device.width}x{device.height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Fondo</Label>
              <Select value={selectedBackground} onValueChange={setSelectedBackground}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backgrounds.map((bg) => (
                    <SelectItem key={bg.value} value={bg.value}>
                      {bg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="padding">Padding: {padding}px</Label>
              <Input
                id="padding"
                type="range"
                min="0"
                max="100"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shadow"
                checked={shadow}
                onChange={(e) => setShadow(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="shadow">Sombra</Label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Vista Previa</h2>
            {uploadedImage ? (
              <div className="space-y-4">
                <div className="border border-border rounded-md p-4 bg-secondary/30 flex items-center justify-center">
                  <canvas ref={canvasRef} className="max-w-full h-auto rounded-md" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Maximize className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sube una captura para generar el mockup</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

