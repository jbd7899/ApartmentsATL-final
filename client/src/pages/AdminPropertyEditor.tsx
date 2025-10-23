import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Loader2, ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PropertyWithImages, InsertProperty } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

export default function AdminPropertyEditor() {
  const params = useParams();
  const [, navigate] = useLocation();
  const propertyId = params.id === "new" ? null : params.id;
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<InsertProperty>({
    title: "",
    description: "",
    location: "atlanta",
    propertyType: "multifamily",
    address: "",
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    youtubeUrl: "",
    featured: false,
  });

  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
  }>>([]);

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

  const { data: property, isLoading } = useQuery<PropertyWithImages>({
    queryKey: ["/api/properties", propertyId],
    enabled: !!propertyId && isAuthenticated,
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        location: property.location,
        propertyType: property.propertyType,
        address: property.address || "",
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFeet: property.squareFeet,
        youtubeUrl: property.youtubeUrl || "",
        featured: property.featured || false,
      });
      setUploadedImages(
        property.images.map(img => ({
          url: img.imageUrl,
          caption: img.caption || "",
          isPrimary: img.isPrimary || false,
        }))
      );
    }
  }, [property]);

  const saveMutation = useMutation({
    mutationFn: async (data: { property: InsertProperty; images: typeof uploadedImages }) => {
      if (propertyId) {
        return await apiRequest("PUT", `/api/properties/${propertyId}`, data);
      } else {
        return await apiRequest("POST", "/api/properties", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: propertyId ? "Property updated successfully" : "Property created successfully",
      });
      navigate("/admin");
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
        description: "Failed to save property",
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
    const newImages = successfulUploads.map((file) => ({
      url: file.uploadURL || "",
      caption: "",
      isPrimary: uploadedImages.length === 0,
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
    toast({
      title: "Success",
      description: `${successfulUploads.length} image(s) uploaded successfully`,
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setUploadedImages(
      uploadedImages.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      property: formData,
      images: uploadedImages,
    });
  };

  if (authLoading || (propertyId && isLoading)) {
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
            <a href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Property Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Modern 2BR Apartment in Midtown"
                        required
                        data-testid="input-title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the property, amenities, and nearby attractions..."
                        rows={6}
                        required
                        data-testid="input-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Select
                          value={formData.location}
                          onValueChange={(value: "atlanta" | "dallas") =>
                            setFormData({ ...formData, location: value })
                          }
                        >
                          <SelectTrigger id="location" data-testid="select-location">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="atlanta">Intown Atlanta, GA</SelectItem>
                            <SelectItem value="dallas">East Dallas, TX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="propertyType">Property Type *</Label>
                        <Select
                          value={formData.propertyType}
                          onValueChange={(value: "multifamily" | "single-family") =>
                            setFormData({ ...formData, propertyType: value })
                          }
                        >
                          <SelectTrigger id="propertyType" data-testid="select-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multifamily">Multifamily</SelectItem>
                            <SelectItem value="single-family">Single Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address (Optional)</Label>
                      <Input
                        id="address"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main St, City, State"
                        data-testid="input-address"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          value={formData.bedrooms || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, bedrooms: e.target.value ? parseInt(e.target.value) : null })
                          }
                          placeholder="2"
                          data-testid="input-bedrooms"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.bathrooms || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, bathrooms: e.target.value ? parseFloat(e.target.value) : null })
                          }
                          placeholder="2"
                          data-testid="input-bathrooms"
                        />
                      </div>

                      <div>
                        <Label htmlFor="squareFeet">Square Feet</Label>
                        <Input
                          id="squareFeet"
                          type="number"
                          min="0"
                          value={formData.squareFeet || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, squareFeet: e.target.value ? parseInt(e.target.value) : null })
                          }
                          placeholder="1200"
                          data-testid="input-sqft"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="youtubeUrl">YouTube Video URL (Optional)</Label>
                      <Input
                        id="youtubeUrl"
                        value={formData.youtubeUrl || ""}
                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        data-testid="input-youtube"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="featured"
                        checked={formData.featured || false}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, featured: checked as boolean })
                        }
                        data-testid="checkbox-featured"
                      />
                      <Label htmlFor="featured" className="cursor-pointer">
                        Featured Property
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Property Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ObjectUploader
                      maxNumberOfFiles={10}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      data-testid="button-upload-images"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Images
                      </div>
                    </ObjectUploader>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted">
                              <img
                                src={image.url}
                                alt={`Property image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(index)}
                                data-testid={`button-remove-image-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant={image.isPrimary ? "default" : "outline"}
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => handleSetPrimaryImage(index)}
                              data-testid={`button-primary-${index}`}
                            >
                              {image.isPrimary ? "Primary" : "Set as Primary"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={saveMutation.isPending}
                      data-testid="button-save-property"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : propertyId ? (
                        "Update Property"
                      ) : (
                        "Create Property"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      asChild
                      data-testid="button-cancel"
                    >
                      <a href="/admin">Cancel</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
