import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Bed, Bath, Maximize2, Video } from "lucide-react";
import { useState } from "react";
import { UnitForm } from "@/components/admin/UnitForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UnitWithImages } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnitManagerProps {
  propertyId: string;
}

export function UnitManager({ propertyId }: UnitManagerProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitWithImages | null>(null);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);

  const { data: units, isLoading } = useQuery<UnitWithImages[]>({
    queryKey: ["/api/properties", propertyId, "units"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (unitId: string) => {
      return await apiRequest("DELETE", `/api/units/${unitId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", propertyId, "units"] });
      toast({
        title: "Success",
        description: "Unit deleted successfully",
      });
      setDeletingUnitId(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete unit",
        variant: "destructive",
      });
    },
  });

  const handleAddUnit = () => {
    setEditingUnit(null);
    setShowForm(true);
  };

  const handleEditUnit = (unit: UnitWithImages) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUnit(null);
  };

  const handleDeleteUnit = (unitId: string) => {
    setDeletingUnitId(unitId);
  };

  const confirmDelete = () => {
    if (deletingUnitId) {
      deleteMutation.mutate(deletingUnitId);
    }
  };

  if (showForm) {
    return (
      <UnitForm
        propertyId={propertyId}
        unit={editingUnit}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Units</h3>
          <p className="text-sm text-muted-foreground">
            Manage individual units within this property
          </p>
        </div>
        <Button onClick={handleAddUnit} data-testid="button-add-unit">
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : units && units.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <Card key={unit.id} data-testid={`card-unit-${unit.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                <CardTitle className="text-lg">Unit {unit.unitNumber}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditUnit(unit)}
                    data-testid={`button-edit-unit-${unit.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteUnit(unit.id)}
                    data-testid={`button-delete-unit-${unit.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {unit.images.length > 0 && (
                  <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted">
                    <img
                      src={unit.images.find(img => img.isPrimary)?.imageUrl || unit.images[0].imageUrl}
                      alt={`Unit ${unit.unitNumber}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" data-testid={`badge-bedrooms-${unit.id}`}>
                    <Bed className="h-3 w-3 mr-1" />
                    {unit.bedrooms} {unit.bedrooms === 1 ? "Bed" : "Beds"}
                  </Badge>
                  <Badge variant="secondary" data-testid={`badge-bathrooms-${unit.id}`}>
                    <Bath className="h-3 w-3 mr-1" />
                    {unit.bathrooms} {unit.bathrooms === 1 ? "Bath" : "Baths"}
                  </Badge>
                  {unit.squareFeet && (
                    <Badge variant="secondary" data-testid={`badge-sqft-${unit.id}`}>
                      <Maximize2 className="h-3 w-3 mr-1" />
                      {unit.squareFeet} sqft
                    </Badge>
                  )}
                  {unit.youtubeUrl && (
                    <Badge variant="secondary" data-testid={`badge-video-${unit.id}`}>
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  )}
                </div>

                {unit.features && (
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-features-${unit.id}`}>
                    {unit.features}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground" data-testid="text-no-units">
              No units added yet. Click "Add Unit" to get started.
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deletingUnitId} onOpenChange={() => setDeletingUnitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this unit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover-elevate"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
