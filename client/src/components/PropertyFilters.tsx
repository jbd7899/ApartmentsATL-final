import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface PropertyFiltersState {
  search: string;
  bedrooms: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
}

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onFiltersChange: (filters: PropertyFiltersState) => void;
  onReset: () => void;
}

export function PropertyFilters({ filters, onFiltersChange, onReset }: PropertyFiltersProps) {
  const handleChange = (key: keyof PropertyFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.search || filters.bedrooms || filters.minPrice || filters.maxPrice || filters.propertyType;

  return (
    <Card data-testid="card-filters">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </h3>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              className="flex items-center gap-1"
              data-testid="button-reset-filters"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Property name..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              data-testid="input-search"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Select value={filters.bedrooms} onValueChange={(value) => handleChange("bedrooms", value)}>
              <SelectTrigger id="bedrooms" data-testid="select-bedrooms">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select value={filters.propertyType} onValueChange={(value) => handleChange("propertyType", value)}>
              <SelectTrigger id="propertyType" data-testid="select-property-type">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="multifamily">Multifamily</SelectItem>
                <SelectItem value="single-family">Single Family</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minPrice">Price Range (placeholder)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="minPrice"
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                data-testid="input-min-price"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                data-testid="input-max-price"
              />
            </div>
          </div>
        </div>

        {filters.minPrice || filters.maxPrice ? (
          <p className="text-sm text-muted-foreground mt-4">
            Note: Price filtering is a placeholder - property prices are not stored in the database yet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
