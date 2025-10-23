import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Bed, Bath, Maximize, Plus, Check } from "lucide-react";
import { Link } from "wouter";
import type { PropertyWithImages } from "@shared/schema";
import { useComparison } from "@/contexts/ComparisonContext";

interface PropertyCardProps {
  property: PropertyWithImages;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { addToComparison, removeFromComparison, isInComparison, comparedProperties } = useComparison();
  const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
  const imageUrl = primaryImage?.imageUrl || "/api/placeholder/400/300";

  const locationLabel = property.location === "atlanta" ? "Atlanta, GA" : "Dallas, TX";
  const typeLabel = property.propertyType === "multifamily" ? "Multifamily" : "Single Family";
  const inComparison = isInComparison(property.id);
  const comparisonFull = comparedProperties.length >= 3 && !inComparison;

  return (
    <Card className="group hover-elevate overflow-hidden transition-all duration-300" data-testid={`card-property-${property.id}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-testid={`img-property-${property.id}`}
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {property.featured && (
            <Badge variant="default" className="bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" data-testid={`badge-type-${property.id}`}>
            {typeLabel}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-xl font-semibold text-foreground line-clamp-1" data-testid={`text-title-${property.id}`}>
            {property.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span data-testid={`text-location-${property.id}`}>{locationLabel}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {property.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          {property.squareFeet !== null && (
            <div className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4" />
              <span>{property.squareFeet.toLocaleString()} sq ft</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Link href={`/property/${property.id}`} className="flex-1">
          <Button
            variant="outline"
            className="w-full"
            data-testid={`button-view-${property.id}`}
          >
            View Details
          </Button>
        </Link>
        <Button
          variant={inComparison ? "default" : "outline"}
          size="icon"
          onClick={() => inComparison ? removeFromComparison(property.id) : addToComparison(property)}
          disabled={comparisonFull}
          data-testid={`button-compare-${property.id}`}
          title={inComparison ? "Remove from comparison" : comparisonFull ? "Maximum 3 properties" : "Add to comparison"}
        >
          {inComparison ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
