import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PropertyWithImages } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: properties, isLoading } = useQuery<PropertyWithImages[]>({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      await apiRequest("DELETE", `/api/properties/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    },
  });

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

  const handleDelete = (propertyId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(propertyId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Property Management
              </h1>
              <p className="text-muted-foreground">
                Manage your property portfolio
              </p>
            </div>
            <Button asChild size="lg" data-testid="button-add-property">
              <Link href="/admin/property/new">
                <a className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Property
                </a>
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !properties || properties.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  No properties yet. Start by adding your first property.
                </p>
                <Button asChild>
                  <Link href="/admin/property/new">
                    <a>Add Your First Property</a>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {properties.map((property) => {
                const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
                const locationLabel = property.location === "atlanta" ? "Atlanta, GA" : "Dallas, TX";
                const typeLabel = property.propertyType === "multifamily" ? "Multifamily" : "Single Family";

                return (
                  <Card key={property.id} className="hover-elevate" data-testid={`admin-card-${property.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {primaryImage && (
                          <div className="w-full md:w-48 h-32 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={primaryImage.imageUrl}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">
                              {property.title}
                            </h3>
                            <div className="flex gap-2">
                              {property.featured && (
                                <Badge variant="default">Featured</Badge>
                              )}
                              <Badge variant="secondary">{typeLabel}</Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{locationLabel}</span>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {property.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              data-testid={`button-edit-${property.id}`}
                            >
                              <Link href={`/admin/property/${property.id}`}>
                                <a className="flex items-center gap-2">
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </a>
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(property.id, property.title)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${property.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
