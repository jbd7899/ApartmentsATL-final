import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, MapPin, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2 transition-colors" 
              data-testid="link-home"
            >
              <Home className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Properties</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Link 
                href="/atlanta"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  location === '/atlanta' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
                data-testid="link-atlanta"
              >
                <MapPin className="h-4 w-4" />
                Atlanta
              </Link>
              <Link 
                href="/dallas"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  location === '/dallas' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
                data-testid="link-dallas"
              >
                <MapPin className="h-4 w-4" />
                Dallas
              </Link>
              <Link 
                href="/about"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  location === '/about' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
                data-testid="link-about"
              >
                About
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
              data-testid="button-resident-portal"
            >
              <a 
                href="https://apartmentsatl.appfolio.com/connect/users/sign_in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <UserCircle className="h-4 w-4" />
                Resident Portal
              </a>
            </Button>

            {isAuthenticated ? (
              <Button
                variant="default"
                size="sm"
                asChild
                data-testid="button-admin"
              >
                <Link href="/admin">Admin</Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                data-testid="button-login"
              >
                <a href="/api/login">Log In</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
