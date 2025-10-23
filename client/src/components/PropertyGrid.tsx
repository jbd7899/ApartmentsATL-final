import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { PropertyFilters, type PropertyFiltersState } from "./PropertyFilters";
import { Loader2 } from "lucide-react";
import type { PropertyWithImages } from "@shared/schema";

interface PropertyGridProps {
  properties: PropertyWithImages[];
  isLoading?: boolean;
  showFilters?: boolean;
  location?: string;
}

export function PropertyGrid({ properties, isLoading, showFilters = false }: PropertyGridProps) {
  const [filters, setFilters] = useState<PropertyFiltersState>({
    search: "",
    bedrooms: "any",
    minPrice: "",
    maxPrice: "",
    propertyType: "any",
  });

  const handleResetFilters = () => {
    setFilters({
      search: "",
      bedrooms: "any",
      minPrice: "",
      maxPrice: "",
      propertyType: "any",
    });
  };

  const filteredProperties = properties.filter(property => {
    // Search filter
    if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !property.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Bedrooms filter
    if (filters.bedrooms !== "any" && property.bedrooms !== null) {
      const minBedrooms = parseInt(filters.bedrooms);
      if (property.bedrooms < minBedrooms) return false;
    }

    // Property type filter
    if (filters.propertyType !== "any" && property.propertyType !== filters.propertyType) {
      return false;
    }

    return true;
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
        <PropertyFilters 
          filters={filters} 
          onFiltersChange={setFilters} 
          onReset={handleResetFilters}
        />
      )}

      {filteredProperties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground" data-testid="text-no-properties">
            No properties match your filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
