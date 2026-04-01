import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, UserCircle, Menu, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

export function Header() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/atlanta", label: "Atlanta", icon: <MapPin className="h-4 w-4" />, testId: "link-atlanta" },
    { href: "/dallas", label: "Dallas", icon: <MapPin className="h-4 w-4" />, testId: "link-dallas" },
    { href: "/about", label: "About", icon: null, testId: "link-about" },
    { href: "/apartment-finder", label: "Apartment Finder", icon: null, testId: "link-apartment-finder-mobile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden -ml-2" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-8">
                <nav className="flex flex-col gap-1">
                  {navLinks.map(({ href, label, icon, testId }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        location === href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-testid={testId}
                    >
                      {icon}
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2 transition-colors"
              data-testid="link-home"
            >
              <Logo className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground font-display">
                ApartmentsATL
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/atlanta"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  location === "/atlanta" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
                data-testid="link-atlanta"
              >
                <MapPin className="h-4 w-4" />
                Atlanta
              </Link>
              <Link
                href="/dallas"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  location === "/dallas" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
                data-testid="link-dallas"
              >
                <MapPin className="h-4 w-4" />
                Dallas
              </Link>
              <Link
                href="/about"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  location === "/about" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
                data-testid="link-about"
              >
                About
              </Link>
            </nav>

            <Button variant="default" size="sm" asChild data-testid="button-apartment-finder" className="hidden md:inline-flex">
              <Link href="/apartment-finder">Apartment Finder</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Apartment Finder CTA */}
            <Button variant="default" size="sm" asChild className="md:hidden" data-testid="button-apartment-finder-mobile">
              <Link href="/apartment-finder" className="flex items-center gap-1.5">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Find</span>
                <span className="sr-only sm:hidden">Apartment Finder</span>
              </Link>
            </Button>

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

            {isAuthenticated && (
              <Button variant="default" size="sm" asChild data-testid="button-admin">
                <Link href="/admin">Admin</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
