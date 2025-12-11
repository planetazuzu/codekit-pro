import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return '';
  }
}

function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT debe tener 3 partes separadas por puntos');
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    return {
      header,
      payload,
      signature,
      isValid: true,
    };
  } catch (error: any) {
    return {
      header: null,
      payload: null,
      signature: null,
      isValid: false,
      error: error.message,
    };
  }
}

export default function JWTDecoder() {
  const { toast } = useToast();
  const [jwtToken, setJwtToken] = useState("");
  const [decoded, setDecoded] = useState<any>(null);

  const decodeToken = () => {
    if (!jwtToken.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un token JWT.",
        variant: "destructive",
      });
      return;
    }

    const result = decodeJWT(jwtToken);
    setDecoded(result);

    if (result.isValid) {
      toast({
        title: "Token decodificado",
        description: "El JWT ha sido decodificado correctamente.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Token JWT inválido.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El contenido ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Decodificador de JWT</h1>
            <p className="text-muted-foreground mt-1">Decodifica y visualiza tokens JWT (JSON Web Tokens).</p>
          </div>
          <Button onClick={decodeToken}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Decodificar
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Input */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <Label htmlFor="jwt">Token JWT</Label>
            <Textarea
              id="jwt"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              rows={8}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              className="font-mono text-sm"
            />
            {decoded && (
              <div className="flex items-center gap-2">
                {decoded.isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">Token válido</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-500">{decoded.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Token Decodificado</h2>
            {decoded && decoded.isValid ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Header</Label>
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-xs text-blue-400 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(decoded.header, null, 2)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Payload</Label>
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Signature</Label>
                    <Button
                      onClick={() => copyToClipboard(decoded.signature)}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-xs text-yellow-400 break-all">
                    {decoded.signature}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>Ingresa un token JWT y haz clic en "Decodificar"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

