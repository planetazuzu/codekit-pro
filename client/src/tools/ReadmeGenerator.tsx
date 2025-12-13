import { Layout } from "@/layout/Layout";
import { useState, useEffect } from "react";
import { Copy, RefreshCw, Plus, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const templates = {
  basic: {
    name: "Básico",
    description: "Plantilla simple y minimalista",
  },
  advanced: {
    name: "Avanzado",
    description: "Plantilla completa con todas las secciones",
  },
  library: {
    name: "Librería",
    description: "Para proyectos de librerías y paquetes",
  },
  api: {
    name: "API",
    description: "Para proyectos de API y servicios",
  },
  cli: {
    name: "CLI",
    description: "Para herramientas de línea de comandos",
  },
};

const badgeGenerators = {
  npm: (packageName: string) => `![npm](https://img.shields.io/npm/v/${packageName}?style=flat-square)`,
  github: (repo: string) => `![GitHub](https://img.shields.io/github/license/${repo}?style=flat-square)`,
  license: (license: string) => `![License](https://img.shields.io/badge/license-${license}-blue?style=flat-square)`,
  version: (version: string) => `![Version](https://img.shields.io/badge/version-${version}-blue?style=flat-square)`,
  build: (status: string) => `![Build](https://img.shields.io/badge/build-${status}-green?style=flat-square)`,
  coverage: (coverage: string) => `![Coverage](https://img.shields.io/badge/coverage-${coverage}%25-green?style=flat-square)`,
  downloads: (packageName: string) => `![Downloads](https://img.shields.io/npm/dm/${packageName}?style=flat-square)`,
  stars: (repo: string) => `![Stars](https://img.shields.io/github/stars/${repo}?style=flat-square)`,
  forks: (repo: string) => `![Forks](https://img.shields.io/github/forks/${repo}?style=flat-square)`,
  issues: (repo: string) => `![Issues](https://img.shields.io/github/issues/${repo}?style=flat-square)`,
  custom: (url: string, alt: string) => `![${alt}](${url})`,
};

export default function ReadmeGenerator() {
  const { toast } = useToast();
  const [template, setTemplate] = useState<string>("basic");
  const [formData, setFormData] = useState({
    title: "My Awesome Project",
    description: "A brief description of what this project does and why it's useful.",
    features: "- Feature 1\n- Feature 2\n- Feature 3",
    installation: "npm install my-project",
    usage: "npm start",
    techStack: "- React\n- TailwindCSS\n- Vite",
    author: "Your Name",
    license: "MIT",
    repository: "username/repo",
    npmPackage: "",
    version: "1.0.0",
    badges: [] as { type: string; value: string; customUrl?: string; customAlt?: string }[],
    contributing: "",
    changelog: "",
    roadmap: "",
    apiDocs: "",
    examples: "",
    tests: "",
    deployment: "",
    environment: "",
    commands: "",
  });
  const [badgeType, setBadgeType] = useState("npm");
  const [badgeValue, setBadgeValue] = useState("");
  const [customBadgeUrl, setCustomBadgeUrl] = useState("");
  const [customBadgeAlt, setCustomBadgeAlt] = useState("");

  const generateBadges = () => {
    if (formData.badges.length === 0) return "";
    
    const badgeLines = formData.badges.map(badge => {
      if (badge.type === "custom" && badge.customUrl && badge.customAlt) {
        return badgeGenerators.custom(badge.customUrl, badge.customAlt);
      }
      const generator = badgeGenerators[badge.type as keyof typeof badgeGenerators];
      if (generator) {
        return generator(badge.value);
      }
      return "";
    }).filter(Boolean);
    
    return badgeLines.join(" ") + "\n\n";
  };

  const generateMarkdown = () => {
    const badges = generateBadges();
    let markdown = `# ${formData.title}\n\n${badges}${formData.description}\n\n`;

    if (template !== "basic") {
      markdown += `## 🚀 Features\n\n${formData.features}\n\n`;
    }

    markdown += `## 🛠️ Tech Stack\n\n${formData.techStack}\n\n`;

    if (template === "library" || template === "cli" || template === "advanced") {
      markdown += `## 📦 Installation\n\n\`\`\`bash\n${formData.installation}\n\`\`\`\n\n`;
    }

    if (template === "api" || template === "advanced") {
      markdown += `## 🔧 Configuration\n\n${formData.environment || "Add your configuration here"}\n\n`;
    }

    markdown += `## 💻 Usage\n\n\`\`\`bash\n${formData.usage}\n\`\`\`\n\n`;

    if (formData.examples && (template === "library" || template === "advanced")) {
      markdown += `## 📝 Examples\n\n${formData.examples}\n\n`;
    }

    if (formData.apiDocs && template === "api") {
      markdown += `## 📚 API Documentation\n\n${formData.apiDocs}\n\n`;
    }

    if (formData.commands && template === "cli") {
      markdown += `## ⌨️ Commands\n\n${formData.commands}\n\n`;
    }

    if (formData.tests && template === "advanced") {
      markdown += `## 🧪 Testing\n\n${formData.tests}\n\n`;
    }

    if (formData.deployment && (template === "api" || template === "advanced")) {
      markdown += `## 🚀 Deployment\n\n${formData.deployment}\n\n`;
    }

    if (formData.contributing && template === "advanced") {
      markdown += `## 🤝 Contributing\n\n${formData.contributing}\n\n`;
    }

    if (formData.changelog && template === "advanced") {
      markdown += `## 📋 Changelog\n\n${formData.changelog}\n\n`;
    }

    if (formData.roadmap && template === "advanced") {
      markdown += `## 🗺️ Roadmap\n\n${formData.roadmap}\n\n`;
    }

    markdown += `## 👤 Author\n\n**${formData.author}**\n\n`;

    if (formData.license) {
      markdown += `## 📄 License\n\nThis project is licensed under the ${formData.license} License.\n\n`;
    }

    return markdown;
  };

  const [preview, setPreview] = useState(generateMarkdown());

  useEffect(() => {
    setPreview(generateMarkdown());
  }, [formData, template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addBadge = () => {
    if (badgeType === "custom") {
      if (!customBadgeUrl || !customBadgeAlt) {
        toast({
          title: "Error",
          description: "Por favor, completa URL y texto alternativo para el badge personalizado.",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({
        ...prev,
        badges: [...prev.badges, { type: "custom", value: "", customUrl: customBadgeUrl, customAlt: customBadgeAlt }],
      }));
      setCustomBadgeUrl("");
      setCustomBadgeAlt("");
    } else {
      if (!badgeValue) {
        toast({
          title: "Error",
          description: "Por favor, ingresa un valor para el badge.",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({
        ...prev,
        badges: [...prev.badges, { type: badgeType, value: badgeValue }],
      }));
      setBadgeValue("");
    }
  };

  const removeBadge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index),
    }));
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Generador de README</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Crea documentación profesional para tus repositorios.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar Markdown
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Editor */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto custom-scrollbar space-y-4">
            <Tabs defaultValue="basic" value={template} onValueChange={setTemplate}>
              <TabsList className="grid w-full grid-cols-5">
                {Object.entries(templates).map(([key, tpl]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {tpl.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Proyecto</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción Corta</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <Label>Badges</Label>
                <div className="flex gap-2">
                  <Select value={badgeType} onValueChange={setBadgeType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(badgeGenerators).map(([key]) => (
                        <SelectItem key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {badgeType === "custom" ? (
                    <>
                      <Input
                        placeholder="URL del badge"
                        value={customBadgeUrl}
                        onChange={(e) => setCustomBadgeUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Texto alternativo"
                        value={customBadgeAlt}
                        onChange={(e) => setCustomBadgeAlt(e.target.value)}
                        className="flex-1"
                      />
                    </>
                  ) : (
                    <Input
                      placeholder={badgeType === "npm" ? "nombre-paquete" : badgeType === "github" ? "user/repo" : "valor"}
                      value={badgeValue}
                      onChange={(e) => setBadgeValue(e.target.value)}
                      className="flex-1"
                    />
                  )}
                  <Button onClick={addBadge} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded text-xs"
                      >
                        <span>{badge.type}</span>
                        <button
                          onClick={() => removeBadge(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tech Stack (Markdown list)</Label>
                <Textarea
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleInputChange}
                  rows={4}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Features (Markdown list)</Label>
                <Textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  rows={4}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instalación</Label>
                  <Input
                    name="installation"
                    value={formData.installation}
                    onChange={handleInputChange}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Uso</Label>
                  <Input
                    name="usage"
                    value={formData.usage}
                    onChange={handleInputChange}
                    className="font-mono"
                  />
                </div>
              </div>

              {(template === "library" || template === "advanced") && (
                <div className="space-y-2">
                  <Label>Ejemplos</Label>
                  <Textarea
                    name="examples"
                    value={formData.examples}
                    onChange={handleInputChange}
                    rows={4}
                    className="font-mono"
                  />
                </div>
              )}

              {template === "api" && (
                <div className="space-y-2">
                  <Label>Documentación API</Label>
                  <Textarea
                    name="apiDocs"
                    value={formData.apiDocs}
                    onChange={handleInputChange}
                    rows={4}
                    className="font-mono"
                  />
                </div>
              )}

              {template === "cli" && (
                <div className="space-y-2">
                  <Label>Comandos</Label>
                  <Textarea
                    name="commands"
                    value={formData.commands}
                    onChange={handleInputChange}
                    rows={4}
                    className="font-mono"
                  />
                </div>
              )}

              {template === "advanced" && (
                <>
                  <div className="space-y-2">
                    <Label>Testing</Label>
                    <Textarea
                      name="tests"
                      value={formData.tests}
                      onChange={handleInputChange}
                      rows={3}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contributing</Label>
                    <Textarea
                      name="contributing"
                      value={formData.contributing}
                      onChange={handleInputChange}
                      rows={3}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Changelog</Label>
                    <Textarea
                      name="changelog"
                      value={formData.changelog}
                      onChange={handleInputChange}
                      rows={3}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Roadmap</Label>
                    <Textarea
                      name="roadmap"
                      value={formData.roadmap}
                      onChange={handleInputChange}
                      rows={3}
                      className="font-mono"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Autor</Label>
                  <Input
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Licencia</Label>
                  <Input
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
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
