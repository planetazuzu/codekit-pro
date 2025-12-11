import { Layout } from "@/layout/Layout";
import { useState, useEffect } from "react";
import { Copy, RefreshCw, Globe, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MetaGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "My App - The Best App",
    description: "An amazing application that does wonderful things for its users.",
    url: "https://myapp.com",
    image: "https://myapp.com/og-image.png",
    author: "@handle",
    keywords: "react, app, best, amazing"
  });

  const [code, setCode] = useState("");

  useEffect(() => {
    const generated = `<!-- Primary Meta Tags -->
<title>${formData.title}</title>
<meta name="title" content="${formData.title}" />
<meta name="description" content="${formData.description}" />
<meta name="keywords" content="${formData.keywords}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${formData.url}" />
<meta property="og:title" content="${formData.title}" />
<meta property="og:description" content="${formData.description}" />
<meta property="og:image" content="${formData.image}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${formData.url}" />
<meta property="twitter:title" content="${formData.title}" />
<meta property="twitter:description" content="${formData.description}" />
<meta property="twitter:image" content="${formData.image}" />
<meta name="twitter:site" content="${formData.author}" />`;
    setCode(generated);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copiado",
      description: "Los meta tags han sido copiados al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de Meta Tags</h1>
            <p className="text-muted-foreground mt-1">Optimiza tu SEO y presencia en redes sociales.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copiar HTML
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto custom-scrollbar space-y-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Información del Sitio
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Título de la Página</label>
              <input 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground text-right">{formData.title.length}/60 caracteres</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{formData.description.length}/160 caracteres</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL del Sitio</label>
              <input 
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

             <div className="space-y-2">
              <label className="text-sm font-medium">URL de Imagen (OG Image)</label>
              <input 
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Twitter Handle</label>
                <input 
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords (separadas por coma)</label>
                <input 
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-6 overflow-hidden">
             {/* Google Preview */}
            <div className="bg-card border border-border rounded-xl p-6">
               <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                 <Search className="h-3 w-3" />
                 Google Search Preview
               </h3>
               <div className="bg-white p-4 rounded-md border border-gray-200">
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                        Icon
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-800">{new URL(formData.url).hostname}</span>
                        <span className="text-[10px] text-gray-500">{formData.url}</span>
                      </div>
                   </div>
                   <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-normal">
                     {formData.title}
                   </h3>
                   <p className="text-sm text-[#4d5156] line-clamp-2">
                     {formData.description}
                   </p>
                 </div>
               </div>
            </div>

            {/* Code Preview */}
            <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="p-3 border-b border-border bg-secondary/30 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">GENERATED HTML</span>
              </div>
              <div className="flex-1 bg-[#0d1117] p-6 overflow-y-auto custom-scrollbar font-mono text-sm text-blue-300 whitespace-pre-wrap">
                {code}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
