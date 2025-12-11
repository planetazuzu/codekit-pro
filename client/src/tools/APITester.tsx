import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Send, Copy, Trash2, Save, Loader2 } from "lucide-react";
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
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

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

  const addHeader = () => {
    if (headerKey && headerValue) {
      setHeaders({ ...headers, [headerKey]: headerValue });
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

  const sendRequest = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (method !== "GET" && method !== "HEAD" && body) {
        requestOptions.body = body;
      }

      const startTime = Date.now();
      const res = await fetch(url, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
        time: responseTime,
      });

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
    const newRequest: Request = { method, url, headers, body };
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

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    toast({
      title: "Copiado",
      description: "La respuesta ha sido copiada.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tester de APIs</h1>
            <p className="text-muted-foreground mt-1">Prueba endpoints REST como un mini-Postman.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveRequest} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
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
                Copiar Respuesta
              </Button>
            )}
          </div>
        </div>

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
                placeholder="https://api.example.com/endpoint"
                className="flex-1"
              />
            </div>

            <div>
              <Label>Headers</Label>
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
                  placeholder="Value"
                  className="flex-1"
                />
                <Button onClick={addHeader} size="sm">Añadir</Button>
              </div>
              <div className="mt-2 space-y-1">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm">
                    <span className="font-mono">{key}: {value}</span>
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
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  placeholder='{"key": "value"}'
                  className="font-mono text-sm mt-2"
                />
              </div>
            )}

            {savedRequests.length > 0 && (
              <div>
                <Label>Requests Guardados</Label>
                <div className="mt-2 space-y-1">
                  {savedRequests.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm cursor-pointer hover:bg-secondary"
                      onClick={() => loadRequest(req)}
                    >
                      <span className="font-mono">{req.method} {req.url}</span>
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
                <div>
                  <Label>Headers</Label>
                  <div className="mt-1 bg-[#1E1E1E] rounded-md p-4 font-mono text-xs text-blue-400 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(response.headers, null, 2)}
                  </div>
                </div>
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
      </div>
    </Layout>
  );
}

