import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Eye } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { PropertyWithImages } from "@shared/schema";

interface ViewCount {
  propertyId: string;
  viewCount: number;
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access the analytics dashboard.",
        variant: "destructive",
      });
      const timeoutId = setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: viewCounts, isLoading: viewsLoading } = useQuery<ViewCount[]>({
    queryKey: ["/api/analytics/views"],
    enabled: isAuthenticated,
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<PropertyWithImages[]>({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  const isLoading = authLoading || viewsLoading || propertiesLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  const propertiesMap = new Map(properties?.map(p => [p.id, p]) || []);
  const totalViews = viewCounts?.reduce((sum, vc) => sum + vc.viewCount, 0) || 0;

  const propertiesWithViews = viewCounts
    ?.map(vc => ({
      property: propertiesMap.get(vc.propertyId),
      viewCount: vc.viewCount,
    }))
    .filter(item => item.property)
    .sort((a, b) => b.viewCount - a.viewCount) || [];

  const propertiesWithoutViews = properties
    ?.filter(p => !viewCounts?.some(vc => vc.propertyId === p.id))
    .map(p => ({ property: p, viewCount: 0 })) || [];

  const allPropertyStats = [...propertiesWithViews, ...propertiesWithoutViews];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track property views and engagement
              </p>
            </div>
            <Button variant="outline" asChild data-testid="button-back-admin">
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-views">
                  {totalViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-properties">
                  {properties?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {propertiesWithViews.length} with views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-views">
                  {properties && properties.length > 0
                    ? (totalViews / properties.length).toFixed(1)
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per property
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Views</CardTitle>
              <CardDescription>
                View counts for each property, sorted by popularity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allPropertyStats.map(({ property, viewCount }, index) => {
                  if (!property) return null;
                  const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
                  const locationLabel = property.location === "atlanta" ? "Atlanta, GA" : "Dallas, TX";
                  const percentage = totalViews > 0 ? (viewCount / totalViews) * 100 : 0;

                  return (
                    <div
                      key={property.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover-elevate"
                      data-testid={`analytics-row-${property.id}`}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted">
                        {primaryImage && (
                          <img
                            src={primaryImage.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link href={`/property/${property.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary truncate">
                            {property.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {locationLabel}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-bold text-foreground" data-testid={`text-views-${property.id}`}>
                          {viewCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        data-testid={`button-edit-${property.id}`}
                      >
                        <Link href={`/admin/property/${property.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  );
                })}

                {allPropertyStats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No properties found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
