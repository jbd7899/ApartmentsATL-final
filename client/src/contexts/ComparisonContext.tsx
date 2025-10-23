import { createContext, useContext, useState, ReactNode } from "react";
import type { PropertyWithImages } from "@shared/schema";

interface ComparisonContextType {
  comparedProperties: PropertyWithImages[];
  addToComparison: (property: PropertyWithImages) => void;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;
  isInComparison: (propertyId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparedProperties, setComparedProperties] = useState<PropertyWithImages[]>([]);

  const addToComparison = (property: PropertyWithImages) => {
    setComparedProperties((prev) => {
      if (prev.length >= 3) {
        return prev; // Max 3 properties
      }
      if (prev.some(p => p.id === property.id)) {
        return prev; // Already in comparison
      }
      return [...prev, property];
    });
  };

  const removeFromComparison = (propertyId: string) => {
    setComparedProperties((prev) => prev.filter(p => p.id !== propertyId));
  };

  const clearComparison = () => {
    setComparedProperties([]);
  };

  const isInComparison = (propertyId: string) => {
    return comparedProperties.some(p => p.id === propertyId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparedProperties,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return context;
}
