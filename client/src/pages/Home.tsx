import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Currently For Rent
              </h2>
              <p className="text-lg text-muted-foreground">
                Browse our available homes in Intown Atlanta and East Dallas. View current listings, check availability, and apply directly on AppFolio.
              </p>
              <Button size="lg" asChild data-testid="button-view-listings">
                <a
                  href="https://apartmentsatl.appfolio.com/listings/listings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  View Current Listings on AppFolio
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
