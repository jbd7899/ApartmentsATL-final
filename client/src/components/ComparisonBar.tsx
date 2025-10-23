import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function ComparisonBar() {
  const { comparedProperties, removeFromComparison, clearComparison } = useComparison();

  if (comparedProperties.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur border-t shadow-lg" data-testid="comparison-bar">
      <div className="container mx-auto">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 overflow-x-auto">
              <span className="text-sm font-medium whitespace-nowrap">
                Compare Properties ({comparedProperties.length}/3)
              </span>
              
              <div className="flex gap-3">
                {comparedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md text-sm whitespace-nowrap"
                    data-testid={`comparison-item-${property.id}`}
                  >
                    <span>{property.title}</span>
                    <button
                      onClick={() => removeFromComparison(property.id)}
                      className="hover:text-destructive"
                      data-testid={`button-remove-${property.id}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearComparison}
                data-testid="button-clear-comparison"
              >
                Clear All
              </Button>
              {comparedProperties.length >= 2 && (
                <Button
                  size="sm"
                  asChild
                  data-testid="button-view-comparison"
                >
                  <Link href="/compare" className="flex items-center gap-2">
                    Compare
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
