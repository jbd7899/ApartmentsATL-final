import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertUnitSchema, type UnitWithImages, type InsertUnit } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface UnitFormProps {
  propertyId: string;
  unit?: UnitWithImages | null;
  onClose: () => void;
}

const unitFormSchema = insertUnitSchema.extend({
  unitNumber: z.string().min(1, "Unit number is required"),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or greater"),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or greater"),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

export function UnitForm({ propertyId, unit, onClose }: UnitFormProps) {
  const { toast } = useToast();
  const isEditing = !!unit;

  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    caption: string;
    isPrimary: boolean;
  }>>([]);

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      propertyId,
      unitNumber: unit?.unitNumber || "",
      bedrooms: unit?.bedrooms || 0,
      bathrooms: unit?.bathrooms || 0,
      squareFeet: unit?.squareFeet || null,
      features: unit?.features || "",
      youtubeUrl: unit?.youtubeUrl || "",
    },
  });

  useEffect(() => {
    if (unit) {
      setUploadedImages(
        unit.images.map(img => ({
          url: img.imageUrl,
          caption: img.caption || "",
          isPrimary: img.isPrimary || false,
        }))
      );
    }
  }, [unit]);

  const saveMutation = useMutation({
    mutationFn: async (data: { unit: InsertUnit; images: typeof uploadedImages }) => {
      if (isEditing && unit) {
        return await apiRequest("PATCH", `/api/units/${unit.id}`, data);
      } else {
        return await apiRequest("POST", "/api/units", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", propertyId, "units"] });
      toast({
        title: "Success",
        description: isEditing ? "Unit updated successfully" : "Unit created successfully",
      });
      onClose();
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
        description: "Failed to save unit",
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

  const onSubmit = (data: UnitFormData) => {
    saveMutation.mutate({
      unit: data,
      images: uploadedImages,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose} data-testid="button-back-units">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Units
        </Button>
        <h3 className="text-lg font-semibold">
          {isEditing ? `Edit Unit ${unit.unitNumber}` : "Add New Unit"}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="unitNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 101, A1, 1A"
                        data-testid="input-unit-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          placeholder="2"
                          data-testid="input-unit-bedrooms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          placeholder="2"
                          data-testid="input-unit-bathrooms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="1200"
                          data-testid="input-unit-sqft"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="e.g., Hardwood floors, stainless steel appliances, balcony..."
                        rows={4}
                        data-testid="input-unit-features"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://www.youtube.com/watch?v=..."
                        data-testid="input-unit-youtube"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unit Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ObjectUploader
                maxNumberOfFiles={10}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
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
                          alt={`Unit image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                          data-testid={`button-remove-unit-image-${index}`}
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
                        data-testid={`button-primary-unit-image-${index}`}
                      >
                        {image.isPrimary ? "Primary" : "Set as Primary"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              data-testid="button-save-unit"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Unit"
              ) : (
                "Create Unit"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-unit"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
