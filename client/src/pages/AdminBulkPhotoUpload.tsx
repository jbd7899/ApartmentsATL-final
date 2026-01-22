import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ArrowLeft, Upload, X, Loader2, GripVertical, Star, ImagePlus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError, isForbiddenError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PropertyWithImages, UnitWithImages } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

interface UploadedImage {
  id?: string;
  url: string;
  caption: string;
  isPrimary: boolean;
}

export default function AdminBulkPhotoUpload() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: properties, isLoading: propertiesLoading } = useQuery<PropertyWithImages[]>({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  const { data: units, isLoading: unitsLoading } = useQuery<UnitWithImages[]>({
    queryKey: ["/api/properties", selectedPropertyId, "units"],
    enabled: !!selectedPropertyId && isAuthenticated,
  });

  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);
  const selectedUnit = units?.find(u => u.id === selectedUnitId);
  const isMultifamily = selectedProperty?.propertyType === "multifamily";

  // Load images when property or unit selection changes
  useEffect(() => {
    if (selectedProperty && !isMultifamily) {
      // Single-family: load property images
      setUploadedImages(
        selectedProperty.images.map(img => ({
          id: img.id,
          url: img.imageUrl,
          caption: img.caption || "",
          isPrimary: img.isPrimary || false,
        }))
      );
    } else if (selectedUnit) {
      // Multifamily: load unit images
      setUploadedImages(
        selectedUnit.images.map(img => ({
          id: img.id,
          url: img.imageUrl,
          caption: img.caption || "",
          isPrimary: img.isPrimary || false,
        }))
      );
    } else {
      setUploadedImages([]);
    }
  }, [selectedProperty, selectedUnit, isMultifamily]);

  // Reset when property changes
  useEffect(() => {
    setSelectedUnitId("");
  }, [selectedPropertyId]);

  // Save mutation for unit images
  const saveUnitImagesMutation = useMutation({
    mutationFn: async (data: { unitId: string; images: UploadedImage[] }) => {
      return await apiRequest("POST", `/api/units/${data.unitId}/bulk-images`, { images: data.images });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", selectedPropertyId, "units"] });
      toast({
        title: "Success",
        description: "Photos saved successfully",
      });
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
      if (isForbiddenError(error)) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to upload photos.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save photos",
        variant: "destructive",
      });
    },
  });

  // Save mutation for property images
  const savePropertyImagesMutation = useMutation({
    mutationFn: async (data: { propertyId: string; images: UploadedImage[] }) => {
      return await apiRequest("POST", `/api/properties/${data.propertyId}/bulk-images`, { images: data.images });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties", selectedPropertyId] });
      toast({
        title: "Success",
        description: "Photos saved successfully",
      });
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
      if (isForbiddenError(error)) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to upload photos.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save photos",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const successfulUploads = result.successful || [];
    const newImages = successfulUploads.map((file, idx) => ({
      url: file.uploadURL || "",
      caption: "",
      isPrimary: false,
    }));
    
    // Use functional setState to avoid race conditions with quick successive uploads
    setUploadedImages((prevImages) => {
      const updatedImages = [...prevImages, ...newImages];
      // Set first image as primary if no primary exists
      if (!updatedImages.some(img => img.isPrimary) && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      return updatedImages;
    });
    
    toast({
      title: "Success",
      description: `${successfulUploads.length} photo(s) uploaded successfully`,
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);
      // If we removed the primary image, set the first remaining as primary
      if (prevImages[index]?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setUploadedImages((prevImages) =>
      prevImages.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setUploadedImages((prevImages) =>
      prevImages.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setUploadedImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSavePhotos = () => {
    if (isMultifamily) {
      if (!selectedUnitId) {
        toast({
          title: "Error",
          description: "Please select an apartment first",
          variant: "destructive",
        });
        return;
      }
      saveUnitImagesMutation.mutate({ unitId: selectedUnitId, images: uploadedImages });
    } else {
      if (!selectedPropertyId) {
        toast({
          title: "Error",
          description: "Please select a property first",
          variant: "destructive",
        });
        return;
      }
      savePropertyImagesMutation.mutate({ propertyId: selectedPropertyId, images: uploadedImages });
    }
  };

  const isSaving = saveUnitImagesMutation.isPending || savePropertyImagesMutation.isPending;
  const canShowPhotoSection = selectedProperty && (!isMultifamily || selectedUnitId);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-6" data-testid="button-back-admin">
            <Link href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Bulk Photo Upload
            </h1>
            <p className="text-muted-foreground">
              Upload multiple photos for properties and apartments quickly and easily
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Select Property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="property">Property</Label>
                    <Select
                      value={selectedPropertyId}
                      onValueChange={setSelectedPropertyId}
                    >
                      <SelectTrigger id="property" data-testid="select-property">
                        <SelectValue placeholder="Select a property..." />
                      </SelectTrigger>
                      <SelectContent>
                        {propertiesLoading ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </div>
                        ) : (
                          properties?.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title} ({property.propertyType === "multifamily" ? "Multi" : "Single"})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPropertyId && isMultifamily && (
                    <div>
                      <Label htmlFor="unit">Apartment / Unit</Label>
                      <Select
                        value={selectedUnitId}
                        onValueChange={setSelectedUnitId}
                      >
                        <SelectTrigger id="unit" data-testid="select-unit">
                          <SelectValue placeholder="Select an apartment..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unitsLoading ? (
                            <div className="p-2 text-center">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : units && units.length > 0 ? (
                            units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                Unit {unit.unitNumber} ({unit.bedrooms}BR / {unit.bathrooms}BA)
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-muted-foreground text-sm">
                              No apartments found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {canShowPhotoSection && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">
                        Current photos: {uploadedImages.length}
                      </div>
                      <Button
                        onClick={handleSavePhotos}
                        disabled={isSaving || uploadedImages.length === 0}
                        className="w-full"
                        data-testid="button-save-photos"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Save Photos
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {!canShowPhotoSection ? (
                <Card>
                  <CardContent className="py-20 text-center">
                    <ImagePlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">
                      {!selectedPropertyId 
                        ? "Select a property to start uploading photos"
                        : "Select an apartment to start uploading photos"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle>
                        {isMultifamily 
                          ? `Photos for Unit ${selectedUnit?.unitNumber}`
                          : `Photos for ${selectedProperty?.title}`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isMultifamily ? selectedProperty?.title : selectedProperty?.address}
                      </p>
                    </div>
                    <ObjectUploader
                      maxNumberOfFiles={50}
                      maxFileSize={15728640}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Photos
                      </div>
                    </ObjectUploader>
                  </CardHeader>
                  <CardContent>
                    {uploadedImages.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed rounded-lg">
                        <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No photos yet. Click "Upload Photos" to add images.
                        </p>
                        <ObjectUploader
                          maxNumberOfFiles={50}
                          maxFileSize={15728640}
                          onGetUploadParameters={handleGetUploadParameters}
                          onComplete={handleUploadComplete}
                        >
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Photos
                          </div>
                        </ObjectUploader>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Drag to reorder photos. The primary photo will be shown first.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {uploadedImages.map((image, index) => (
                            <div
                              key={image.id || `new-${index}`}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`relative group border rounded-lg overflow-visible bg-card ${
                                draggedIndex === index ? "opacity-50" : ""
                              }`}
                              data-testid={`photo-card-${index}`}
                            >
                              <div className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing">
                                <div className="bg-background/80 backdrop-blur-sm rounded p-1">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                              
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(index)}
                                data-testid={`button-remove-photo-${index}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>

                              <div className="aspect-[4/3] bg-muted">
                                <img
                                  src={image.url}
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="p-3 space-y-2">
                                <Input
                                  placeholder="Add caption..."
                                  value={image.caption}
                                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                                  className="text-sm"
                                  data-testid={`input-caption-${index}`}
                                />
                                <Button
                                  type="button"
                                  variant={image.isPrimary ? "default" : "outline"}
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleSetPrimaryImage(index)}
                                  data-testid={`button-primary-${index}`}
                                >
                                  <Star className={`h-3 w-3 mr-1 ${image.isPrimary ? "fill-current" : ""}`} />
                                  {image.isPrimary ? "Primary Photo" : "Set as Primary"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
