import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, Check, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReadmeGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "My Awesome Project",
    description: "A brief description of what this project does and why it's useful.",
    features: "- Feature 1\n- Feature 2\n- Feature 3",
    installation: "npm install my-project",
    usage: "npm start",
    techStack: "- React\n- TailwindCSS\n- Vite",
    author: "Your Name"
  });

  const generateMarkdown = () => {
    return `# ${formData.title}

${formData.description}

## 🚀 Features

${formData.features}

## 🛠️ Tech Stack

${formData.techStack}

## 📦 Installation

\`\`\`bash
${formData.installation}
\`\`\`

## 💻 Usage

\`\`\`bash
${formData.usage}
\`\`\`

## 👤 Author

**${formData.author}**
`;
  };

  const [preview, setPreview] = useState(generateMarkdown());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      return newData;
    });
  };

  // Update preview when data changes
  const updatePreview = () => {
    setPreview(generateMarkdown());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(preview);
    toast({
      title: "Copiado",
      description: "El Markdown ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de README</h1>
            <p className="text-muted-foreground mt-1">Crea documentación profesional para tus repositorios.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={updatePreview}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copiar Markdown
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Editor */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto custom-scrollbar space-y-4">
            <h2 className="font-semibold mb-4">Configuración</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Proyecto</label>
              <input 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción Corta</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tech Stack (Markdown list)</label>
              <textarea 
                name="techStack"
                value={formData.techStack}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Features (Markdown list)</label>
              <textarea 
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instalación (Comando)</label>
                <input 
                  name="installation"
                  value={formData.installation}
                  onChange={handleInputChange}
                  className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Uso (Comando)</label>
                <input 
                  name="usage"
                  value={formData.usage}
                  onChange={handleInputChange}
                  className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Autor</label>
              <input 
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border bg-secondary/30 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">PREVIEW (README.md)</span>
            </div>
            <div className="flex-1 bg-[#0d1117] p-6 overflow-y-auto custom-scrollbar font-mono text-sm text-gray-300 whitespace-pre-wrap">
              {preview}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
