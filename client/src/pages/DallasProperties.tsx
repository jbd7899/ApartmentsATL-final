import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyGrid } from "@/components/PropertyGrid";
import { MapPin } from "lucide-react";
import type { PropertyWithImages } from "@shared/schema";

export default function DallasProperties() {
  const { data: properties, isLoading } = useQuery<PropertyWithImages[]>({
    queryKey: ["/api/properties"],
  });

  const dallasProperties = properties?.filter(p => p.location === "dallas") || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                East Dallas Properties
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Explore our portfolio of rental properties in East Dallas. Quality homes for every lifestyle.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <PropertyGrid 
              properties={dallasProperties} 
              isLoading={isLoading} 
              showFilters={true}
              location="dallas"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
