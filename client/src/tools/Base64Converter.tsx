import { Layout } from "@/layout/Layout";
import { useState, useRef } from "react";
import { Copy, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Base64Converter() {
  const { toast } = useToast();
  const [base64, setBase64] = useState("");
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo de imagen.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBase64(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El código Base64 ha sido copiado al portapapeles.",
    });
  };

  const copyAsCSS = () => {
    const css = `background-image: url(${base64});`;
    copyToClipboard(css);
  };

  const copyAsHTML = () => {
    const html = `<img src="${base64}" alt="${fileName}" />`;
    copyToClipboard(html);
  };

  const clearAll = () => {
    setBase64("");
    setPreview("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conversor de Imagen a Base64</h1>
            <p className="text-muted-foreground mt-1">Convierte imágenes a cadenas Base64 para incrustar en CSS o HTML.</p>
          </div>
          {base64 && (
            <div className="flex gap-2">
              <Button onClick={() => copyToClipboard(base64)} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Base64
              </Button>
              <Button onClick={copyAsCSS} variant="outline">
                Copiar CSS
              </Button>
              <Button onClick={copyAsHTML} variant="outline">
                Copiar HTML
              </Button>
              <Button onClick={clearAll} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Upload */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Subir Imagen</h2>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">
                  Haz clic para subir una imagen
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF hasta 5MB
                </p>
              </label>
            </div>

            {fileName && (
              <div className="bg-secondary/50 border border-border rounded-md p-3">
                <p className="text-sm font-medium">Archivo:</p>
                <p className="text-xs text-muted-foreground">{fileName}</p>
              </div>
            )}

            {preview && (
              <div className="space-y-2">
                <Label>Vista Previa</Label>
                <div className="border border-border rounded-md p-4 bg-secondary/30 flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Código Base64</h2>
            {base64 ? (
              <div className="space-y-4">
                <div>
                  <Label>Base64 Completo</Label>
                  <Textarea
                    value={base64}
                    readOnly
                    rows={8}
                    className="font-mono text-xs mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => copyToClipboard(base64)} variant="outline" size="sm">
                    <Copy className="h-3 w-3 mr-1" />
                    Base64
                  </Button>
                  <Button onClick={copyAsCSS} variant="outline" size="sm">
                    <Copy className="h-3 w-3 mr-1" />
                    CSS
                  </Button>
                  <Button onClick={copyAsHTML} variant="outline" size="sm">
                    <Copy className="h-3 w-3 mr-1" />
                    HTML
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sube una imagen para convertirla a Base64</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

