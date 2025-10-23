import { Button } from "@/components/ui/button";
import { MapPin, Building2 } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Luxury_apartment_building_hero_1639ee20.png";

export function Hero() {
  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
      </div>

      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl">
          Quality Rental Properties in Atlanta & Dallas
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
          Family-owned and operated property management offering multifamily and single-family homes
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/atlanta">
            <Button
              size="lg"
              variant="default"
              className="bg-primary border border-primary-border hover:bg-primary text-primary-foreground flex items-center gap-2 w-full sm:w-auto"
              data-testid="button-view-atlanta"
            >
              <MapPin className="h-5 w-5" />
              View Atlanta Properties
            </Button>
          </Link>
          <Link href="/dallas">
            <Button
              size="lg"
              variant="outline"
              className="bg-background/20 backdrop-blur-md border-white/30 text-white hover:bg-background/30 flex items-center gap-2 w-full sm:w-auto"
              data-testid="button-view-dallas"
            >
              <Building2 className="h-5 w-5" />
              View Dallas Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
