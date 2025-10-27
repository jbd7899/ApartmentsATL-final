import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Bed, Bath, Maximize, ArrowLeft, ExternalLink, Expand, Home } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { PropertyWithImages, UnitWithImages } from "@shared/schema";
import { useState, useEffect } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";

export default function PropertyDetail() {
  const params = useParams();
  const propertyId = params.id;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithImages | null>(null);
  const [selectedUnitImageIndex, setSelectedUnitImageIndex] = useState(0);
  const [isUnitLightboxOpen, setIsUnitLightboxOpen] = useState(false);

  const { data: property, isLoading: propertyLoading } = useQuery<PropertyWithImages>({
    queryKey: ["/api/properties", propertyId],
    enabled: !!propertyId,
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery<UnitWithImages[]>({
    queryKey: ["/api/properties", propertyId, "units"],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/units`);
      if (!response.ok) throw new Error("Failed to fetch units");
      return response.json();
    },
    enabled: !!propertyId,
  });

  // Track property view
  useEffect(() => {
    if (property?.id) {
      fetch(`/api/analytics/track-view/${property.id}`, {
        method: "POST",
      }).catch(err => console.error("Failed to track view:", err));
    }
  }, [property?.id]);

  const isLoading = propertyLoading || (property?.propertyType === "multifamily" && unitsLoading);

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
              <Link href="/">Back to Home</Link>
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
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&?\s]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  const renderSingleFamilyView = () => {
    const unitsWithVideos = units.filter(u => u.youtubeUrl);
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group cursor-pointer"
                 onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.caption || property.title}
                className="w-full h-full object-cover"
                data-testid="img-property-main"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white flex items-center gap-2">
                  <Expand className="h-6 w-6" />
                  <span className="text-lg font-medium">View Full Screen</span>
                </div>
              </div>
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

        {unitsWithVideos.map((unit, index) => (
          <Card key={unit.id}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {unitsWithVideos.length > 1 ? `Unit ${unit.unitNumber} Tour` : 'Unit Tour'}
              </h2>
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={getYouTubeEmbedUrl(unit.youtubeUrl!)}
                  title={`Unit ${unit.unitNumber} Video Tour`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  data-testid={`iframe-unit-video-${index}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}

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

          </CardContent>
        </Card>
      </div>
    </div>
    );
  };

  const renderMultifamilyView = () => (
    <div className="space-y-8">
      {/* Property Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="text-property-title">
                {property.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{typeLabel}</Badge>
                {property.featured && <Badge variant="default">Featured</Badge>}
                <Badge variant="outline">{units.length} Units</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{locationLabel}</span>
              </div>
              {property.address && (
                <p className="text-muted-foreground text-sm mb-4">{property.address}</p>
              )}
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Property Images */}
            {images.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group cursor-pointer"
                     onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.caption || property.title}
                    className="w-full h-full object-cover"
                    data-testid="img-property-main"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white flex items-center gap-2">
                      <Expand className="h-6 w-6" />
                      <span className="text-lg font-medium">View Full Screen</span>
                    </div>
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.slice(0, 4).map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setIsLightboxOpen(true);
                        }}
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
          </div>
        </CardContent>
      </Card>

      {/* Units Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Available Units</h2>
            <p className="text-muted-foreground">Browse {units.length} units in this property</p>
          </div>
        </div>

        {units.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No units available at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => {
              const unitImages = unit.images.sort((a, b) => 
                (a.isPrimary ? -1 : b.isPrimary ? 1 : a.displayOrder - b.displayOrder)
              );
              const thumbnailImage = unitImages[0];

              return (
                <Card key={unit.id} className="overflow-hidden hover-elevate" data-testid={`card-unit-${unit.id}`}>
                  {thumbnailImage && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={thumbnailImage.imageUrl}
                        alt={`Unit ${unit.unitNumber}`}
                        className="w-full h-full object-cover"
                        data-testid={`img-unit-${unit.id}`}
                      />
                    </div>
                  )}
                  <CardHeader className="p-4">
                    <h3 className="text-xl font-bold text-foreground mb-3" data-testid={`text-unit-number-${unit.id}`}>
                      Unit {unit.unitNumber}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Bed className="h-4 w-4" />
                          <span>Bedrooms</span>
                        </div>
                        <span className="font-medium text-foreground">{unit.bedrooms}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Bath className="h-4 w-4" />
                          <span>Bathrooms</span>
                        </div>
                        <span className="font-medium text-foreground">{unit.bathrooms}</span>
                      </div>
                      {unit.squareFeet && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Maximize className="h-4 w-4" />
                            <span>Sq Ft</span>
                          </div>
                          <span className="font-medium text-foreground">{unit.squareFeet.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {unit.features && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground line-clamp-2">{unit.features}</p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedUnit(unit);
                        setSelectedUnitImageIndex(0);
                      }}
                      data-testid={`button-view-unit-${unit.id}`}
                    >
                      View Unit Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
            <Link href={`/${property.location}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to {property.location === "atlanta" ? "Atlanta" : "Dallas"} Properties
            </Link>
          </Button>

          {property.propertyType === "single-family" ? renderSingleFamilyView() : renderMultifamilyView()}
        </div>
      </main>
      <Footer />
      
      {/* Property Images Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onPrevious={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
        onNext={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
      />

      {/* Unit Detail Dialog */}
      {selectedUnit && (
        <Dialog open={!!selectedUnit} onOpenChange={(open) => !open && setSelectedUnit(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" data-testid="dialog-unit-detail">
            <DialogHeader>
              <DialogTitle className="text-2xl">Unit {selectedUnit.unitNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Unit Images */}
              {selectedUnit.images.length > 0 && (
                <div className="space-y-4">
                  <div 
                    className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group cursor-pointer"
                    onClick={() => setIsUnitLightboxOpen(true)}
                  >
                    <img
                      src={selectedUnit.images[selectedUnitImageIndex]?.imageUrl}
                      alt={selectedUnit.images[selectedUnitImageIndex]?.caption || `Unit ${selectedUnit.unitNumber}`}
                      className="w-full h-full object-cover"
                      data-testid="img-unit-detail-main"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white flex items-center gap-2">
                        <Expand className="h-6 w-6" />
                        <span className="text-lg font-medium">View Full Screen</span>
                      </div>
                    </div>
                  </div>

                  {selectedUnit.images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {selectedUnit.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedUnitImageIndex(index)}
                          className={`relative aspect-[4/3] rounded-md overflow-hidden hover-elevate transition-all ${
                            selectedUnitImageIndex === index ? 'ring-2 ring-primary' : ''
                          }`}
                          data-testid={`button-unit-image-${index}`}
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

              {/* Unit Video */}
              {selectedUnit.youtubeUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Unit Tour</h3>
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedUnit.youtubeUrl)}
                      title={`Unit ${selectedUnit.unitNumber} Video Tour`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      data-testid="iframe-unit-video"
                    />
                  </div>
                </div>
              )}

              {/* Unit Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Bed className="h-4 w-4" />
                      <span>Bedrooms</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{selectedUnit.bedrooms}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Bath className="h-4 w-4" />
                      <span>Bathrooms</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{selectedUnit.bathrooms}</p>
                  </div>
                  {selectedUnit.squareFeet && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Maximize className="h-4 w-4" />
                        <span>Square Feet</span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{selectedUnit.squareFeet.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Unit Features */}
              {selectedUnit.features && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Features</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedUnit.features}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setSelectedUnit(null)}
                  data-testid="button-close-unit-detail"
                  className="w-full"
                >
                  Back to Units
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Unit Images Lightbox */}
      {selectedUnit && (
        <ImageLightbox
          images={selectedUnit.images}
          currentIndex={selectedUnitImageIndex}
          isOpen={isUnitLightboxOpen}
          onClose={() => setIsUnitLightboxOpen(false)}
          onPrevious={() => setSelectedUnitImageIndex((prev) => 
            (prev === 0 ? selectedUnit.images.length - 1 : prev - 1)
          )}
          onNext={() => setSelectedUnitImageIndex((prev) => 
            (prev === selectedUnit.images.length - 1 ? 0 : prev + 1)
          )}
        />
      )}
    </div>
  );
}
