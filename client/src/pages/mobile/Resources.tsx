/**
 * Mobile-optimized Resources Page
 * Simplified tabs with single column layout
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
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { Layout } from "@/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AffiliateCard } from "@/components/affiliates/AffiliateCard";
import { BackButton } from "@/components/common/BackButton";
import { useAffiliates } from "@/hooks/use-affiliates";
import { useGuides } from "@/hooks/use-guides";
import { useLinks } from "@/hooks/use-links";
import { useQueryClient } from "@tanstack/react-query";
import { MobilePullToRefresh, MobileSwipeActions, MobileShareSheet } from "@/components/mobile";
import { useFavorites } from "@/hooks/use-favorites";
import { useTrackPageView } from "@/hooks/use-track-view";

export default function MobileResources() {
  useTrackPageView("page", "resources-mobile");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();
  const { toggleFavorite } = useFavorites();
  
  const { data: affiliates, isLoading: affiliatesLoading, refetch: refetchAffiliates } = useAffiliates();
  const { data: guides, isLoading: guidesLoading, refetch: refetchGuides } = useGuides();
  const { data: links, isLoading: linksLoading, refetch: refetchLinks } = useLinks();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchAffiliates();
      refetchGuides();
      refetchLinks();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchAffiliates, refetchGuides, refetchLinks]);

  const handleRefresh = async () => {
    queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
    queryClient.invalidateQueries({ queryKey: ["guides"] });
    queryClient.invalidateQueries({ queryKey: ["links"] });
    await Promise.all([
      refetchAffiliates(),
      refetchGuides(),
      refetchLinks(),
    ]);
  };

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
          content="Descubre las mejores herramientas, guías y recursos para desarrolladores."
        />
      </Helmet>

      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4 pb-20">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <BackButton />
            <MobileShareSheet
              title="Recursos para Desarrolladores"
              text="Descubre las mejores herramientas, guías y recursos para desarrolladores"
              url={window.location.href}
            />
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-3 py-4">
            <h1 className="text-2xl font-bold text-foreground">
              Recursos para Desarrolladores
            </h1>
            <p className="text-sm text-muted-foreground px-4">
              Encuentra las mejores herramientas, guías y recursos para potenciar tu desarrollo.{" "}
              {isLoading ? (
                <span className="text-muted-foreground/70">Cargando...</span>
              ) : totalResources > 0 ? (
                <span className="font-semibold text-foreground">
                  {totalResources} {totalResources === 1 ? 'recurso' : 'recursos'} curados
                </span>
              ) : null}
            </p>

            {/* Search */}
            <div className="px-4">
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
          <div className="grid grid-cols-2 gap-3 px-4">
            <Card className="text-center">
              <CardContent className="pt-4 pb-4">
                <TrendingUp className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold">
                  {affiliatesLoading ? "..." : affiliates?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Herramientas</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-4">
                <BookOpen className="h-6 w-6 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold">
                  {guidesLoading ? "..." : guides?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Guías</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-4">
                <LinkIcon className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold">
                  {linksLoading ? "..." : links?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Enlaces</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-4">
                <Star className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold">
                  {isLoading ? "..." : totalResources}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="flex-shrink-0"
            >
              Todo
            </Button>
            <Button
              variant={activeTab === "tools" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("tools")}
              className="flex-shrink-0"
            >
              Herramientas
            </Button>
            <Button
              variant={activeTab === "guides" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("guides")}
              className="flex-shrink-0"
            >
              Guías
            </Button>
            <Button
              variant={activeTab === "links" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("links")}
              className="flex-shrink-0"
            >
              Enlaces
            </Button>
          </div>

          {/* Content */}
          {activeTab === "all" && (
            <div className="space-y-4 px-4">
              {/* Featured Tools */}
              {filteredResources.affiliates.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    Herramientas Destacadas
                  </h2>
                  <div className="space-y-3">
                    {filteredResources.affiliates.slice(0, 3).map((affiliate) => (
                      <MobileSwipeActions
                        key={affiliate.id}
                        rightActions={[
                          {
                            label: "Favorito",
                            icon: <Star className="h-4 w-4" />,
                            bgColor: "bg-yellow-500",
                            onAction: () => toggleFavorite("affiliate", affiliate.id),
                          },
                        ]}
                      >
                        <AffiliateCard affiliate={affiliate} />
                      </MobileSwipeActions>
                    ))}
                  </div>
                </section>
              )}

              {/* Guides */}
              {filteredResources.guides.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-400" />
                    Guías Populares
                  </h2>
                  <div className="space-y-3">
                    {filteredResources.guides.slice(0, 3).map((guide) => (
                      <Card key={guide.id} className="hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{guide.title}</CardTitle>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {guide.description}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">{guide.type}</Badge>
                            <Link href={`/guides/${guide.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
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
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-3 px-4">
              {filteredResources.affiliates.map((affiliate) => (
                <MobileSwipeActions
                  key={affiliate.id}
                  rightActions={[
                    {
                      label: "Favorito",
                      icon: <Star className="h-4 w-4" />,
                      bgColor: "bg-yellow-500",
                      onAction: () => toggleFavorite("affiliate", affiliate.id),
                    },
                  ]}
                >
                  <AffiliateCard affiliate={affiliate} />
                </MobileSwipeActions>
              ))}
              {filteredResources.affiliates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No se encontraron herramientas
                </div>
              )}
            </div>
          )}

          {activeTab === "guides" && (
            <div className="space-y-3 px-4">
              {filteredResources.guides.map((guide) => (
                <Card key={guide.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{guide.title}</CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {guide.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">{guide.type}</Badge>
                        {guide.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link href={`/guides/${guide.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          Ver guía
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredResources.guides.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No se encontraron guías
                </div>
              )}
            </div>
          )}

          {activeTab === "links" && (
            <div className="space-y-3 px-4">
              {filteredResources.links.map((link) => (
                <MobileSwipeActions
                  key={link.id}
                  rightActions={[
                    {
                      label: "Favorito",
                      icon: <Star className="h-4 w-4" />,
                      bgColor: "bg-yellow-500",
                      onAction: () => toggleFavorite("link", link.id),
                    },
                  ]}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="h-full hover:border-primary/50 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground line-clamp-1">
                              {link.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
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
                </MobileSwipeActions>
              ))}
              {filteredResources.links.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No se encontraron enlaces
                </div>
              )}
            </div>
          )}
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
