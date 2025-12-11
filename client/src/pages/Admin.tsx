import { Layout } from "@/layout/Layout";
import { useAnalyticsStats, type AnalyticsStats } from "@/hooks/use-analytics";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useGitHubSync } from "@/hooks/use-github-sync";
import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, Eye, FileText, Link as LinkIcon, Code2, BookOpen, Lock, LogOut, AlertCircle, Settings, Github, ArrowDownUp, ArrowDown, ArrowUp, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

export default function Admin() {
  const { isAuthenticated, isChecking, login, logout } = useAdminAuth();
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<"analytics" | "github">("analytics");
  const { data: stats, isLoading } = useAnalyticsStats(days);
  const { status, isLoading: syncLoading, getStatus, syncFromGitHub, pushToGitHub, syncResource, pushResource } = useGitHubSync();

  useEffect(() => {
    if (isAuthenticated && activeTab === "github") {
      getStatus().catch(() => {
        // Error already handled in hook
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

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
  const topPagesData = statsData?.topPages.slice(0, 5) || [];
  const entityTypeData = statsData?.byEntityType || [];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
            <p className="text-muted-foreground mt-1">Estadísticas de vistas y uso de la aplicación</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/affiliates">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Gestionar Afiliados
              </Button>
            </Link>
            <div className="flex gap-2 border-r pr-2 mr-2">
              <Button
                variant={activeTab === "analytics" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("analytics")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "github" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("github")}
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub Sync
              </Button>
            </div>
          <div className="flex gap-2">
            <Button
              variant={days === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(7)}
            >
              7 días
            </Button>
            <Button
              variant={days === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(30)}
            >
              30 días
            </Button>
            <Button
              variant={days === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(90)}
            >
              90 días
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="ml-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {activeTab === "github" && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Estado de Sincronización</h2>
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
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {status.configured ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {status.configured ? "Configurado" : "No configurado"}
                    </span>
                  </div>
                  
                  {status.repo && (
                    <div className="text-sm text-muted-foreground">
                      Repositorio: <code className="bg-secondary px-2 py-1 rounded">{status.repo}</code>
                    </div>
                  )}
                  
                  {!status.configured && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Variables de entorno faltantes:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
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
            </div>

            {/* Sync Actions */}
            {status?.configured && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Sync from GitHub */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ArrowDown className="h-5 w-5 text-blue-500" />
                    Sincronizar desde GitHub
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Descarga y actualiza el contenido desde el repositorio GitHub
                  </p>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={syncFromGitHub}
                      disabled={syncLoading}
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
                </div>

                {/* Push to GitHub */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ArrowUp className="h-5 w-5 text-green-500" />
                    Enviar a GitHub
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sube el contenido actual al repositorio GitHub
                  </p>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={pushToGitHub}
                      disabled={syncLoading}
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
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Vistas</p>
                <p className="text-3xl font-bold mt-2">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Páginas Únicas</p>
                <p className="text-3xl font-bold mt-2">{statsData?.byPage.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio Diario</p>
                <p className="text-3xl font-bold mt-2">
                  {days > 0 ? Math.round(totalViews / days) : 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tipos de Entidades</p>
                <p className="text-3xl font-bold mt-2">{entityTypeData.length}</p>
              </div>
              <Code2 className="h-8 w-8 text-orange-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Views Over Time */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Vistas por Fecha</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData?.byDate || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Vistas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Pages */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Páginas Más Visitadas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPagesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="page" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" name="Vistas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Entity Types */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Vistas por Tipo de Entidad</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={entityTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ entityType, percent }) => `${entityType}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="entityType"
                >
                  {entityTypeData.map((entry: { entityType: string; count: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* All Pages */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Todas las Páginas</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {statsData?.byPage.map((item: { page: string; count: number }, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
                >
                  <span className="text-sm font-mono">{item.page}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </Layout>
  );
}

