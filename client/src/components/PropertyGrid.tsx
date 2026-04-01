import { PropertyCard } from "./PropertyCard";
import { Loader2 } from "lucide-react";
import type { PropertyWithImages } from "@shared/schema";

interface PropertyGridProps {
  properties: PropertyWithImages[];
  isLoading?: boolean;
}

export function PropertyGrid({ properties, isLoading }: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-properties" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground" data-testid="text-no-properties">
            No properties available at this time.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
