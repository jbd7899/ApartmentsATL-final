import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Loader2, Upload, X, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { HeroImage } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
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

export default function HeroSettings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [images, setImages] = useState<HeroImage[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previousOrder, setPreviousOrder] = useState<HeroImage[]>([]);

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

  const { data: heroImages, isLoading } = useQuery<HeroImage[]>({
    queryKey: ["/api/hero-images"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (heroImages) {
      setImages(heroImages);
    }
  }, [heroImages]);

  const uploadMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return await apiRequest("POST", "/api/hero-images", {
        imageUrl,
        displayOrder: images.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero-images"] });
      toast({
        title: "Success",
        description: "Hero image uploaded successfully",
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
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return await apiRequest("DELETE", `/api/hero-images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero-images"] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
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
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (imageIds: string[]) => {
      return await apiRequest("PATCH", "/api/hero-images/reorder", { imageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero-images"] });
      toast({
        title: "Success",
        description: "Images reordered successfully",
      });
    },
    onError: (error: Error) => {
      // Revert to previous order on error
      setImages(previousOrder);
      
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
        description: "Failed to reorder images",
        variant: "destructive",
      });
      
      // Also invalidate to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/hero-images"] });
    },
  });

  const handleUpload = async () => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });
      const { uploadURL } = await response.json();
      return {
        method: "PUT" as const,
        url: uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const uploadURL = file.uploadURL;
      if (uploadURL) {
        const url = new URL(uploadURL);
        const imageUrl = url.pathname;
        uploadMutation.mutate(imageUrl);
      }
    }
  };

  const handleDeleteClick = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (imageToDelete) {
      deleteMutation.mutate(imageToDelete);
      setImageToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDragStart = (index: number) => {
    // Store previous order before drag starts for potential rollback
    setPreviousOrder([...images]);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Optimistic update: update visual state for drag preview
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      // Finalize the reorder and trigger mutation with optimistic update already applied
      const imageIds = images.map(img => img.id);
      reorderMutation.mutate(imageIds);
    }
  };

  const handleDragEnd = () => {
    // Clean up drag state
    setDraggedIndex(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loader-hero-settings" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle data-testid="title-hero-settings">Hero Images Management</CardTitle>
                <p className="text-muted-foreground mt-1" data-testid="text-image-count">
                  {images.length}/4 images
                </p>
              </div>
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleUpload}
                onComplete={handleUploadComplete}
                buttonClassName={images.length >= 4 ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </ObjectUploader>
            </div>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="text-no-images">
                No hero images yet. Upload your first image to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className="relative group rounded-md overflow-hidden border hover-elevate cursor-move"
                    data-testid={`card-hero-image-${image.id}`}
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-sm">
                        <GripVertical className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeleteClick(image.id)}
                        data-testid={`button-delete-${image.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      src={image.imageUrl}
                      alt={`Hero image ${index + 1}`}
                      className="w-full h-64 object-cover"
                      data-testid={`img-hero-${image.id}`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm" data-testid={`text-order-${image.id}`}>
                        Position {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hero image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
