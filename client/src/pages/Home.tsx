import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppfolioSection } from "@/components/AppfolioSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { PropertyWithImages } from "@shared/schema";

export default function Home() {
  const { data: properties, isLoading } = useQuery<PropertyWithImages[]>({
    queryKey: ["/api/properties"],
  });

  const featuredProperties = properties?.filter(p => p.featured) || [];
  const displayProperties = featuredProperties.length > 0 ? featuredProperties : properties?.slice(0, 6) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Properties
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our selection of quality rental properties in Atlanta and Dallas
              </p>
            </div>

            <PropertyGrid properties={displayProperties} isLoading={isLoading} />
          </div>
        </section>

        <AppfolioSection />
      </main>
      <Footer />
    </div>
  );
}
