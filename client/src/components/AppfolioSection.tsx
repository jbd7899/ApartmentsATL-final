import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function AppfolioSection() {
  return (
    <section className="py-16 bg-muted/30" data-testid="section-appfolio">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Interested in one of our properties? Contact us through AppFolio to check availability and schedule a viewing.
            </p>
          </div>

          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-3">
                <p className="text-lg text-foreground">
                  All property inquiries and rental applications are managed through our AppFolio portal.
                </p>
                <p className="text-muted-foreground">
                  View current availability, submit applications, and communicate with our property management team.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="default"
                  asChild
                  data-testid="button-view-listings"
                >
                  <a
                    href="https://apartmentsatl.appfolio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    View Available Listings
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  data-testid="button-resident-portal-cta"
                >
                  <a
                    href="https://apartmentsatl.appfolio.com/connect/users/sign_in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Current Residents
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
