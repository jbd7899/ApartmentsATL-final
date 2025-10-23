import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Maximize, ArrowLeft, ExternalLink } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { PropertyWithImages } from "@shared/schema";
import { useState } from "react";

export default function PropertyDetail() {
  const params = useParams();
  const propertyId = params.id;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: property, isLoading } = useQuery<PropertyWithImages>({
    queryKey: ["/api/properties", propertyId],
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
            <Button asChild>
              <Link href="/">
                <a>Back to Home</a>
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const locationLabel = property.location === "atlanta" ? "Intown Atlanta, GA" : "East Dallas, TX";
  const typeLabel = property.propertyType === "multifamily" ? "Multifamily" : "Single Family";
  const images = property.images.sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.displayOrder - b.displayOrder));
  const selectedImage = images[selectedImageIndex] || images[0];

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
            <Link href={`/${property.location}`}>
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to {property.location === "atlanta" ? "Atlanta" : "Dallas"} Properties
              </a>
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedImage.imageUrl}
                      alt={selectedImage.caption || property.title}
                      className="w-full h-full object-cover"
                      data-testid="img-property-main"
                    />
                  </div>

                  {images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-[4/3] rounded-md overflow-hidden hover-elevate transition-all ${
                            selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                          }`}
                          data-testid={`button-image-${index}`}
                        >
                          <img
                            src={image.imageUrl}
                            alt={image.caption || `Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {property.youtubeUrl && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Property Tour</h2>
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(property.youtubeUrl)}
                        title="Property Video Tour"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        data-testid="iframe-video"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-3" data-testid="text-property-title">
                      {property.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{typeLabel}</Badge>
                      {property.featured && <Badge variant="default">Featured</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{locationLabel}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-foreground">Property Details</h3>
                    <div className="space-y-2">
                      {property.bedrooms !== null && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Bed className="h-4 w-4" />
                            <span>Bedrooms</span>
                          </div>
                          <span className="font-medium text-foreground">{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms !== null && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Bath className="h-4 w-4" />
                            <span>Bathrooms</span>
                          </div>
                          <span className="font-medium text-foreground">{property.bathrooms}</span>
                        </div>
                      )}
                      {property.squareFeet !== null && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Maximize className="h-4 w-4" />
                            <span>Square Feet</span>
                          </div>
                          <span className="font-medium text-foreground">{property.squareFeet.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      className="w-full"
                      size="lg"
                      asChild
                      data-testid="button-check-availability"
                    >
                      <a 
                        href="https://apartmentsatl.appfolio.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Check Availability
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
