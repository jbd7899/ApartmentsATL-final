import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyGrid } from "@/components/PropertyGrid";
import { MapPin } from "lucide-react";
import type { PropertyWithImages } from "@shared/schema";

export default function AtlantaProperties() {
  const { data: properties, isLoading } = useQuery<PropertyWithImages[]>({
    queryKey: ["/api/properties"],
  });

  const atlantaProperties = properties?.filter(p => p.location === "atlanta") || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Intown Atlanta Properties
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Discover quality rental properties in Intown Atlanta. From multifamily apartments to charming single-family homes.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <PropertyGrid 
              properties={atlantaProperties} 
              isLoading={isLoading} 
              showFilters={true}
              location="atlanta"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
