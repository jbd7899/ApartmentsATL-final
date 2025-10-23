import { useComparison } from "@/contexts/ComparisonContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Maximize, Home as HomeIcon } from "lucide-react";
import { Link } from "wouter";

export default function PropertyComparison() {
  const { comparedProperties, clearComparison } = useComparison();

  if (comparedProperties.length < 2) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">No Properties to Compare</h1>
            <p className="text-muted-foreground">
              Add at least 2 properties to compare their features side-by-side.
            </p>
            <Button asChild>
              <Link href="/">Browse Properties</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allFeatures = [
    { key: "location", label: "Location", icon: MapPin },
    { key: "propertyType", label: "Type", icon: HomeIcon },
    { key: "bedrooms", label: "Bedrooms", icon: Bed },
    { key: "bathrooms", label: "Bathrooms", icon: Bath },
    { key: "squareFeet", label: "Square Feet", icon: Maximize },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Property Comparison
              </h1>
              <p className="text-muted-foreground">
                Compare {comparedProperties.length} properties side-by-side
              </p>
            </div>
            <Button variant="outline" onClick={clearComparison} data-testid="button-clear-all">
              Clear All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${comparedProperties.length}, minmax(300px, 1fr))` }}>
              {comparedProperties.map((property) => {
                const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
                const locationLabel = property.location === "atlanta" ? "Intown Atlanta, GA" : "East Dallas, TX";
                const typeLabel = property.propertyType === "multifamily" ? "Multifamily" : "Single Family";

                return (
                  <Card key={property.id} data-testid={`comparison-card-${property.id}`}>
                    <CardHeader className="p-0">
                      {primaryImage && (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                          <img
                            src={primaryImage.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <CardTitle className="mb-2">{property.title}</CardTitle>
                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary">{typeLabel}</Badge>
                          {property.featured && <Badge>Featured</Badge>}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {allFeatures.map(({ key, label, icon: Icon }) => {
                          let value: string | number = "N/A";
                          
                          if (key === "location") {
                            value = locationLabel;
                          } else if (key === "propertyType") {
                            value = typeLabel;
                          } else if (key === "squareFeet" && property.squareFeet) {
                            value = property.squareFeet.toLocaleString();
                          } else if (property[key as keyof typeof property] !== null) {
                            value = property[key as keyof typeof property] as string | number;
                          }

                          return (
                            <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon className="h-4 w-4" />
                                <span className="text-sm">{label}</span>
                              </div>
                              <span className="font-medium text-foreground text-sm">{value}</span>
                            </div>
                          );
                        })}
                      </div>

                      <Button asChild className="w-full" variant="outline">
                        <Link href={`/property/${property.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
