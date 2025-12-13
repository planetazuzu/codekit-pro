import { Layout } from "@/layout/Layout";
import { useState, useEffect } from "react";
import { Send, Copy, Trash2, Save, Loader2, History, Settings, Plus, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Request {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  name?: string;
}

interface HistoryEntry extends Request {
  response?: {
    status: number;
    statusText: string;
    time: number;
  };
}

const STORAGE_KEY_REQUESTS = "api-tester-saved-requests";
const STORAGE_KEY_HISTORY = "api-tester-history";
const STORAGE_KEY_ENV = "api-tester-env-vars";

export default function APITester() {
  const { toast } = useToast();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedRequests, setSavedRequests] = useState<Request[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [envKey, setEnvKey] = useState("");
  const [envValue, setEnvValue] = useState("");

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (saved) {
      try {
        setSavedRequests(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved requests:", e);
      }
    }

    const hist = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (hist) {
      try {
        const parsed = JSON.parse(hist);
        // Mantener solo los últimos 50
        setHistory(parsed.slice(0, 50));
      } catch (e) {
        console.error("Error loading history:", e);
      }
    }

    const env = localStorage.getItem(STORAGE_KEY_ENV);
    if (env) {
      try {
        setEnvVars(JSON.parse(env));
      } catch (e) {
        console.error("Error loading env vars:", e);
      }
    }
  }, []);

  // Guardar requests
  useEffect(() => {
    if (savedRequests.length > 0) {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(savedRequests));
    }
  }, [savedRequests]);

  // Guardar historial
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)));
    }
  }, [history]);

  // Guardar variables de entorno
  useEffect(() => {
    if (Object.keys(envVars).length > 0) {
      localStorage.setItem(STORAGE_KEY_ENV, JSON.stringify(envVars));
    }
  }, [envVars]);

  const replaceEnvVars = (text: string): string => {
    let result = text;
    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, value);
    });
    return result;
  };

  const addHeader = () => {
    if (headerKey && headerValue) {
      const processedValue = replaceEnvVars(headerValue);
      setHeaders({ ...headers, [headerKey]: processedValue });
      setHeaderKey("");
      setHeaderValue("");
      toast({
        title: "Header añadido",
        description: `${headerKey} añadido correctamente.`,
      });
    }
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    setHeaders(newHeaders);
  };

  const addEnvVar = () => {
    if (envKey && envValue) {
      setEnvVars({ ...envVars, [envKey]: envValue });
      setEnvKey("");
      setEnvValue("");
      toast({
        title: "Variable añadida",
        description: `${envKey} añadida correctamente.`,
      });
    }
  };

  const removeEnvVar = (key: string) => {
    const newEnvVars = { ...envVars };
    delete newEnvVars[key];
    setEnvVars(newEnvVars);
  };

  const sendRequest = async () => {
    const processedUrl = replaceEnvVars(url);
    
    if (!processedUrl) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      const processedHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(([key, value]) => {
        processedHeaders[key] = replaceEnvVars(value);
      });

      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...processedHeaders,
        },
      };

      if (method !== "GET" && method !== "HEAD" && body) {
        requestOptions.body = replaceEnvVars(body);
      }

      const res = await fetch(processedUrl, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
        time: responseTime,
      };

      setResponse(responseObj);

      // Guardar en historial
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        method,
        url: processedUrl,
        headers: processedHeaders,
        body: replaceEnvVars(body),
        timestamp: Date.now(),
        response: {
          status: res.status,
          statusText: res.statusText,
          time: responseTime,
        },
      };
      setHistory([historyEntry, ...history].slice(0, 50));

      toast({
        title: "Request enviado",
        description: `Status: ${res.status} ${res.statusText}`,
      });
    } catch (error: any) {
      setResponse({
        error: error.message,
      });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRequest = () => {
    const name = prompt("Nombre del request (opcional):");
    const newRequest: Request = {
      id: Date.now().toString(),
      method,
      url,
      headers,
      body,
      timestamp: Date.now(),
      name: name || undefined,
    };
    setSavedRequests([...savedRequests, newRequest]);
    toast({
      title: "Request guardado",
      description: "El request ha sido guardado.",
    });
  };

  const loadRequest = (request: Request) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
    setBody(request.body);
    toast({
      title: "Request cargado",
      description: "El request ha sido cargado.",
    });
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setMethod(entry.method);
    setUrl(entry.url);
    setHeaders(entry.headers);
    setBody(entry.body);
    if (entry.response) {
      setResponse({
        status: entry.response.status,
        statusText: entry.response.statusText,
        time: entry.response.time,
      });
    }
    toast({
      title: "Cargado del historial",
      description: "El request ha sido cargado del historial.",
    });
  };

  const deleteRequest = (id: string) => {
    setSavedRequests(savedRequests.filter(req => req.id !== id));
    toast({
      title: "Request eliminado",
      description: "El request ha sido eliminado.",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    toast({
      title: "Historial limpiado",
      description: "El historial ha sido eliminado.",
    });
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    toast({
      title: "Copiado",
      description: "La respuesta ha sido copiada.",
    });
  };

  const exportCollection = () => {
    const collection = {
      info: {
        name: "CodeKit Pro API Collection",
        description: "Colección exportada desde CodeKit Pro API Tester",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: savedRequests.map((req) => ({
        name: req.name || `${req.method} ${req.url}`,
        request: {
          method: req.method,
          header: Object.entries(req.headers).map(([key, value]) => ({
            key,
            value,
            type: "text",
          })),
          body: req.body
            ? {
                mode: "raw",
                raw: req.body,
                options: {
                  raw: {
                    language: "json",
                  },
                },
              }
            : undefined,
          url: {
            raw: req.url,
            host: [new URL(req.url).hostname],
            path: [new URL(req.url).pathname],
          },
        },
      })),
      variable: Object.entries(envVars).map(([key, value]) => ({
        key,
        value,
        type: "string",
      })),
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codekit-pro-collection-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Colección exportada",
      description: "La colección ha sido descargada en formato Postman.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tester de APIs</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Prueba endpoints REST con historial y variables de entorno.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveRequest} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            {savedRequests.length > 0 && (
              <Button onClick={exportCollection} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
            <Button onClick={sendRequest} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar
            </Button>
            {response && (
              <Button onClick={copyResponse} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="request" className="flex-1 flex flex-col min-h-0">
          <TabsList>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="history">Historial ({history.length})</TabsTrigger>
            <TabsTrigger value="env">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
              {/* Request */}
              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
                <h2 className="font-semibold mb-4">Request</h2>
                
                <div className="flex gap-2">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint o {{BASE_URL}}/users"
                    className="flex-1"
                  />
                </div>

                <div>
                  <Label>Headers (usa {{VAR}} para variables)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={headerKey}
                      onChange={(e) => setHeaderKey(e.target.value)}
                      placeholder="Key"
                      className="flex-1"
                    />
                    <Input
                      value={headerValue}
                      onChange={(e) => setHeaderValue(e.target.value)}
                      placeholder="Value o {{API_KEY}}"
                      className="flex-1"
                    />
                    <Button onClick={addHeader} size="sm">Añadir</Button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {Object.entries(headers).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm">
                        <span className="font-mono text-xs">{key}: {value}</span>
                        <Button
                          onClick={() => removeHeader(key)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {(method === "POST" || method === "PUT" || method === "PATCH") && (
                  <div>
                    <Label htmlFor="body">Body (usa {{VAR}} para variables)</Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={10}
                      placeholder='{"key": "{{VALUE}}"}'
                      className="font-mono text-sm mt-2"
                    />
                  </div>
                )}

                {savedRequests.length > 0 && (
                  <div>
                    <Label>Requests Guardados</Label>
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {savedRequests.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm cursor-pointer hover:bg-secondary group"
                        >
                          <div
                            className="flex-1"
                            onClick={() => loadRequest(req)}
                          >
                            <div className="font-semibold">{req.name || "Sin nombre"}</div>
                            <div className="font-mono text-xs text-muted-foreground">{req.method} {req.url}</div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRequest(req.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Response */}
              <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
                <h2 className="font-semibold mb-4">Response</h2>
                {response ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <div className={`mt-1 p-2 rounded ${
                        response.status >= 200 && response.status < 300
                          ? "bg-green-500/20 text-green-400"
                          : response.status >= 400
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {response.status} {response.statusText}
                      </div>
                    </div>
                    {response.time && (
                      <div>
                        <Label>Tiempo de respuesta</Label>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {response.time}ms
                        </div>
                      </div>
                    )}
                    {response.headers && (
                      <div>
                        <Label>Headers</Label>
                        <div className="mt-1 bg-[#1E1E1E] rounded-md p-4 font-mono text-xs text-blue-400 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(response.headers, null, 2)}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label>Body</Label>
                      <div className="mt-1 bg-[#1E1E1E] rounded-md p-4 font-mono text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">
                        {typeof response.data === "string"
                          ? response.data
                          : JSON.stringify(response.data, null, 2)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <p>Envía un request para ver la respuesta</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex items-center justify-between mb-4">
              <Label>Historial de Requests ({history.length})</Label>
              {history.length > 0 && (
                <Button onClick={clearHistory} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
            <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay historial aún</p>
                </div>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => loadFromHistory(entry)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-mono ${
                          entry.method === "GET" ? "bg-blue-500/20 text-blue-400" :
                          entry.method === "POST" ? "bg-green-500/20 text-green-400" :
                          entry.method === "PUT" ? "bg-yellow-500/20 text-yellow-400" :
                          entry.method === "DELETE" ? "bg-red-500/20 text-red-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {entry.method}
                        </span>
                        <span className="font-mono text-sm truncate flex-1">{entry.url}</span>
                      </div>
                      {entry.response && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          entry.response.status >= 200 && entry.response.status < 300
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {entry.response.status} ({entry.response.time}ms)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="env" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
              <div>
                <Label>Variables de Entorno</Label>
                <p className="text-xs text-muted-foreground mb-4">
                  Usa {"{{VARIABLE}}"} en URLs, headers o body para reemplazar con estos valores
                </p>
                <div className="flex gap-2">
                  <Input
                    value={envKey}
                    onChange={(e) => setEnvKey(e.target.value)}
                    placeholder="Nombre (ej: BASE_URL)"
                    className="flex-1"
                  />
                  <Input
                    value={envValue}
                    onChange={(e) => setEnvValue(e.target.value)}
                    placeholder="Valor (ej: https://api.example.com)"
                    className="flex-1"
                  />
                  <Button onClick={addEnvVar} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {Object.keys(envVars).length > 0 && (
                <div className="space-y-2">
                  <Label>Variables definidas</Label>
                  {Object.entries(envVars).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm">
                      <div>
                        <span className="font-mono font-semibold">{key}</span>
                        <span className="text-muted-foreground ml-2">= {value}</span>
                      </div>
                      <Button
                        onClick={() => removeEnvVar(key)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
