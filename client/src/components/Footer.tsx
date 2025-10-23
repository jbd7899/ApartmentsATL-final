import { Button } from "@/components/ui/button";
import { UserCircle, Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Properties</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Family-owned and operated property management serving Intown Atlanta and East Dallas.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Locations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Intown Atlanta, GA</li>
              <li>East Dallas, TX</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Residents</h3>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              asChild
              data-testid="button-footer-portal"
            >
              <a 
                href="https://apartmentsatl.appfolio.com/connect/users/sign_in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <UserCircle className="h-4 w-4" />
                Access Resident Portal
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
