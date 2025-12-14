/**
 * Mobile-optimized Admin Page
 * Simplified version without heavy charts
 */

import { Layout } from "@/layout/Layout";
import { useAnalyticsStats, type AnalyticsStats } from "@/hooks/use-analytics";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useGitHubSync } from "@/hooks/use-github-sync";
import { useEffect } from "react";
import { Loader2, TrendingUp, Eye, FileText, Code2, Lock, LogOut, AlertCircle, Settings, Github, ArrowDown, ArrowUp, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { MobilePullToRefresh } from "@/components/mobile";
import { Card, CardContent } from "@/components/ui/card";

function AdminLogin({ onLogin }: { onLogin: (password: string) => Promise<boolean> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await onLogin(password);
      if (!success) {
        setError('Contraseña incorrecta');
        setPassword('');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Acceso de Administración</h1>
            <p className="text-sm text-muted-foreground text-center">
              Ingresa la contraseña para acceder al panel de administración
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="w-full"
                autoFocus
                disabled={isLoading}
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Acceder
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MobileAdmin() {
  const { isAuthenticated, isChecking, login, logout } = useAdminAuth();
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<"analytics" | "github">("analytics");
  const { data: stats, isLoading } = useAnalyticsStats(days);
  const { status, isLoading: syncLoading, getStatus, syncFromGitHub, pushToGitHub, syncResource, pushResource } = useGitHubSync();

  useEffect(() => {
    if (isAuthenticated && activeTab === "github") {
      getStatus().catch(() => {});
    }
  }, [isAuthenticated, activeTab, getStatus]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const statsData = stats as AnalyticsStats | undefined;
  const totalViews = statsData?.byDate.reduce((sum: number, item: { date: string; count: number }) => sum + item.count, 0) || 0;
  const entityTypeData = statsData?.byEntityType || [];

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Panel Admin</h1>
              <p className="text-muted-foreground mt-1 text-sm">Estadísticas y sincronización</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "analytics" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("analytics")}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={activeTab === "github" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("github")}
              className="flex-1"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>

          {/* Period Selector */}
          {activeTab === "analytics" && (
            <div className="flex gap-2">
              <Button
                variant={days === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(7)}
                className="flex-1"
              >
                7 días
              </Button>
              <Button
                variant={days === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(30)}
                className="flex-1"
              >
                30 días
              </Button>
              <Button
                variant={days === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(90)}
                className="flex-1"
              >
                90 días
              </Button>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              {/* Quick Link */}
              <Link href="/admin/affiliates">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar Afiliados
                </Button>
              </Link>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="h-5 w-5 text-blue-400 opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Total Vistas</p>
                    <p className="text-xl font-bold">{totalViews.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-5 w-5 text-green-400 opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Páginas</p>
                    <p className="text-xl font-bold">{statsData?.byPage.length || 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-400 opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Promedio Diario</p>
                    <p className="text-xl font-bold">
                      {days > 0 ? Math.round(totalViews / days) : 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Code2 className="h-5 w-5 text-orange-400 opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Tipos</p>
                    <p className="text-xl font-bold">{entityTypeData.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Pages - Simplified */}
              {statsData?.topPages && statsData.topPages.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="text-sm font-semibold mb-3">Páginas Más Visitadas</h3>
                    <div className="space-y-2">
                      {statsData.topPages.slice(0, 5).map((page, index) => (
                        <div key={page.page} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
                            <span className="truncate">{page.page}</span>
                          </div>
                          <span className="font-medium">{page.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Entity Types - Simplified */}
              {entityTypeData.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="text-sm font-semibold mb-3">Vistas por Tipo</h3>
                    <div className="space-y-2">
                      {entityTypeData.map((item) => (
                        <div key={item.entityType} className="flex items-center justify-between text-sm">
                          <span>{item.entityType || "N/A"}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* GitHub Tab */}
          {activeTab === "github" && (
            <div className="space-y-4">
              {/* Status Card */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold">Estado de Sincronización</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getStatus}
                      disabled={syncLoading}
                    >
                      {syncLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Actualizar"
                      )}
                    </Button>
                  </div>
                  
                  {status ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {status.configured ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium text-sm">
                          {status.configured ? "Configurado" : "No configurado"}
                        </span>
                      </div>
                      
                      {status.repo && (
                        <div className="text-xs text-muted-foreground">
                          Repo: <code className="bg-secondary px-2 py-1 rounded">{status.repo}</code>
                        </div>
                      )}
                      
                      {!status.configured && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <p className="text-xs font-medium mb-2">Variables faltantes:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                            {status.missing.token && <li>GITHUB_TOKEN</li>}
                            {status.missing.owner && <li>GITHUB_REPO_OWNER</li>}
                            {status.missing.repo && <li>GITHUB_REPO_NAME</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Cargando estado...</p>
                  )}
                </CardContent>
              </Card>

              {/* Sync Actions */}
              {status?.configured && (
                <div className="space-y-4">
                  {/* Sync from GitHub */}
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-blue-500" />
                        Sincronizar desde GitHub
                      </h3>
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={syncFromGitHub}
                          disabled={syncLoading}
                          size="sm"
                        >
                          {syncLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sincronizando...
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-4 w-4 mr-2" />
                              Sincronizar Todo
                            </>
                          )}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          {(["prompts", "snippets", "links", "guides"] as const).map((type) => (
                            <Button
                              key={type}
                              variant="outline"
                              size="sm"
                              onClick={() => syncResource(type)}
                              disabled={syncLoading}
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Push to GitHub */}
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-green-500" />
                        Enviar a GitHub
                      </h3>
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={pushToGitHub}
                          disabled={syncLoading}
                          size="sm"
                        >
                          {syncLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <ArrowUp className="h-4 w-4 mr-2" />
                              Enviar Todo
                            </>
                          )}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          {(["prompts", "snippets", "links", "guides"] as const).map((type) => (
                            <Button
                              key={type}
                              variant="outline"
                              size="sm"
                              onClick={() => pushResource(type)}
                              disabled={syncLoading}
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
