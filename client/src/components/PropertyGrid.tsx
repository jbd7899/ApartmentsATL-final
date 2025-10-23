import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PropertyWithImages } from "@shared/schema";

interface PropertyGridProps {
  properties: PropertyWithImages[];
  isLoading?: boolean;
  showFilters?: boolean;
  location?: string;
}

export function PropertyGrid({ properties, isLoading, showFilters = false, location }: PropertyGridProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "multifamily" | "single-family">("all");

  const filteredProperties = properties.filter(property => {
    if (typeFilter === "all") return true;
    return property.propertyType === typeFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-properties" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground">Filter by type:</span>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
              data-testid="filter-all"
            >
              All Properties
            </Button>
            <Button
              variant={typeFilter === "multifamily" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("multifamily")}
              data-testid="filter-multifamily"
            >
              Multifamily
            </Button>
            <Button
              variant={typeFilter === "single-family" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("single-family")}
              data-testid="filter-single-family"
            >
              Single Family
            </Button>
          </div>
        </div>
      )}

      {filteredProperties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground" data-testid="text-no-properties">
            No properties found. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
