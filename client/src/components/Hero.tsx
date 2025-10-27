import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Pause, Play } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/Westview_JTP_4541_1761242520164.jpg";
import type { HeroImage } from "@shared/schema";

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fadeState, setFadeState] = useState<'fade-in' | 'fade-out'>('fade-in');

  // Refs to prevent stale closures and manage cleanup
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentImagesRef = useRef<string[]>([heroImage]);

  const { data: heroImages, isLoading } = useQuery<HeroImage[]>({
    queryKey: ["/api/hero-images"],
  });

  // Determine which images to use
  const images = heroImages && heroImages.length > 0 
    ? heroImages.map(img => img.imageUrl)
    : [heroImage];

  const currentImage = images[currentIndex];

  // Keep currentImagesRef in sync with images
  useEffect(() => {
    currentImagesRef.current = images;
  }, [images]);

  // Reset currentIndex when images change to prevent out-of-bounds
  useEffect(() => {
    // Clear any pending fade timeout to prevent out-of-order state updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (currentIndex >= images.length) {
      setCurrentIndex(0);
      setFadeState('fade-in');
    }
  }, [images.length, currentIndex]);

  // Auto-play carousel with refs to prevent stale closures
  useEffect(() => {
    // Clear any existing interval and timeout
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (!isPlaying || currentImagesRef.current.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setFadeState('fade-out');
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % currentImagesRef.current.length);
        setFadeState('fade-in');
      }, 300);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [isPlaying]);

  // Navigation functions wrapped in useCallback to prevent stale closures
  const navigatePrev = useCallback(() => {
    setFadeState('fade-out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setFadeState('fade-in');
    }, 300);
  }, [images.length]);

  const navigateNext = useCallback(() => {
    setFadeState('fade-out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setFadeState('fade-in');
    }, 300);
  }, [images.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigatePrev, navigateNext, togglePlayPause]);

  if (isLoading) {
    return (
      <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-muted">
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-muted-foreground/20 rounded w-96 mb-6"></div>
            <div className="h-10 bg-muted-foreground/20 rounded w-64"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative h-[500px] md:h-[600px] w-full overflow-hidden"
      role="region"
      aria-label="Hero carousel"
      aria-live="polite"
    >
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
          fadeState === 'fade-in' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url(${currentImage})` }}
        data-testid="hero-carousel-image"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="icon"
              variant="outline"
              className="bg-background/20 backdrop-blur-md border-white/30 text-white hover:bg-background/30"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
              data-testid="button-carousel-toggle"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setFadeState('fade-out');
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setFadeState('fade-in');
                  }, 300);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                data-testid={`button-carousel-indicator-${index}`}
              />
            ))}
          </div>
        </>
      )}

      <div 
        className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl">
          Unique and architecturally charming urban living -Locally owned and managed.
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/atlanta">
            <Button
              size="lg"
              variant="default"
              className="bg-primary border border-primary-border hover:bg-primary text-primary-foreground flex items-center gap-2 w-full sm:w-auto"
              data-testid="button-view-atlanta"
            >
              <MapPin className="h-5 w-5" />
              View Atlanta Properties
            </Button>
          </Link>
          <Link href="/dallas">
            <Button
              size="lg"
              variant="outline"
              className="bg-background/20 backdrop-blur-md border-white/30 text-white hover:bg-background/30 flex items-center gap-2 w-full sm:w-auto"
              data-testid="button-view-dallas"
            >
              <Building2 className="h-5 w-5" />
              View Dallas Properties
            </Button>
          </Link>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Currently showing image {currentIndex + 1} of {images.length}
      </div>
    </section>
  );
}
