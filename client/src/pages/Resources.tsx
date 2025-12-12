/**
 * Public Resources Page - SEO optimized
 * Lists all tools, guides, and affiliate links
 */

import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search,
  ExternalLink,
  BookOpen,
  Wrench,
  Link as LinkIcon,
  TrendingUp,
  Star,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { Layout } from "@/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffiliateCard } from "@/components/affiliates/AffiliateCard";
import { BackButton } from "@/components/common/BackButton";
import { useAffiliates } from "@/hooks/use-affiliates";
import { useGuides } from "@/hooks/use-guides";
import { useLinks } from "@/hooks/use-links";
import { useQueryClient } from "@tanstack/react-query";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();
  
  // Fetch resources with auto-refresh
  const { data: affiliates, isLoading: affiliatesLoading, refetch: refetchAffiliates } = useAffiliates();
  const { data: guides, isLoading: guidesLoading, refetch: refetchGuides } = useGuides();
  const { data: links, isLoading: linksLoading, refetch: refetchLinks } = useLinks();

  // Auto-refresh every 30 seconds to get new resources
  useEffect(() => {
    const interval = setInterval(() => {
      refetchAffiliates();
      refetchGuides();
      refetchLinks();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [refetchAffiliates, refetchGuides, refetchLinks]);

  // Manual refresh function
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
    queryClient.invalidateQueries({ queryKey: ["guides"] });
    queryClient.invalidateQueries({ queryKey: ["links"] });
    refetchAffiliates();
    refetchGuides();
    refetchLinks();
  };

  // Filter all resources by search
  const filteredResources = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    const filteredAffiliates = (affiliates || []).filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term)
    );
    
    const filteredGuides = (guides || []).filter(
      (g) =>
        g.title.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term)
    );
    
    const filteredLinks = (links || []).filter(
      (l) =>
        l.title.toLowerCase().includes(term) ||
        l.category.toLowerCase().includes(term)
    );

    return { affiliates: filteredAffiliates, guides: filteredGuides, links: filteredLinks };
  }, [affiliates, guides, links, searchTerm]);

  // Calculate total resources with loading state
  const totalResources = useMemo(() => {
    return (affiliates?.length || 0) + (guides?.length || 0) + (links?.length || 0);
  }, [affiliates, guides, links]);

  const isLoading = affiliatesLoading || guidesLoading || linksLoading;

  return (
    <Layout>
      <Helmet>
        <title>Recursos para Desarrolladores | CodeKit Pro</title>
        <meta
          name="description"
          content="Descubre las mejores herramientas, guías y recursos para desarrolladores. Hosting, IA, UI Kits, productividad y más."
        />
        <meta
          name="keywords"
          content="herramientas desarrollo, recursos programadores, hosting, vercel, tailwind, copilot, ia desarrollo"
        />
      </Helmet>

      <div className="space-y-8">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold text-foreground">
              Recursos para Desarrolladores
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8"
              title="Actualizar recursos"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra las mejores herramientas, guías y recursos para potenciar tu
            desarrollo.{" "}
            {isLoading ? (
              <span className="text-muted-foreground/70">Cargando recursos...</span>
            ) : totalResources > 0 ? (
              <span className="font-semibold text-foreground">
                {totalResources} {totalResources === 1 ? 'recurso' : 'recursos'} curados
              </span>
            ) : (
              <span>Recursos curados para desarrolladores.</span>
            )}
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {affiliatesLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  affiliates?.length || 0
                )}
              </p>
              <p className="text-sm text-muted-foreground">Herramientas</p>
            </CardContent>
          </Card>
          <Card className="text-center transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <BookOpen className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {guidesLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  guides?.length || 0
                )}
              </p>
              <p className="text-sm text-muted-foreground">Guías</p>
            </CardContent>
          </Card>
          <Card className="text-center transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <LinkIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {linksLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  links?.length || 0
                )}
              </p>
              <p className="text-sm text-muted-foreground">Enlaces</p>
            </CardContent>
          </Card>
          <Card className="text-center transition-all hover:border-primary/50">
            <CardContent className="pt-6">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  totalResources
                )}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todo</TabsTrigger>
            <TabsTrigger value="tools">Herramientas</TabsTrigger>
            <TabsTrigger value="guides">Guías</TabsTrigger>
            <TabsTrigger value="links">Enlaces</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8 mt-6">
            {/* Featured Tools */}
            {filteredResources.affiliates.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Herramientas Destacadas
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("tools")}>
                    Ver todas
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.affiliates.slice(0, 6).map((affiliate) => (
                    <AffiliateCard key={affiliate.id} affiliate={affiliate} />
                  ))}
                </div>
              </section>
            )}

            {/* Guides */}
            {filteredResources.guides.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-400" />
                    Guías Populares
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("guides")}>
                    Ver todas
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResources.guides.slice(0, 4).map((guide) => (
                    <Card key={guide.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {guide.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{guide.type}</Badge>
                          <Link href={`/guides/${guide.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver guía
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.affiliates.map((affiliate) => (
                <AffiliateCard key={affiliate.id} affiliate={affiliate} />
              ))}
            </div>
            {filteredResources.affiliates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron herramientas
              </div>
            )}
          </TabsContent>

          <TabsContent value="guides" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.guides.map((guide) => (
                <Card key={guide.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {guide.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{guide.type}</Badge>
                        {guide.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link href={`/guides/${guide.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver guía
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredResources.guides.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron guías
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {link.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {link.description}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {link.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
            {filteredResources.links.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron enlaces
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

