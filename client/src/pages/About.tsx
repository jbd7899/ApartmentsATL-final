import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Heart, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Family-owned and operated property management since day one
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-foreground leading-relaxed mb-6">
                We are a family-owned and operated small business dedicated to providing quality rental properties 
                in Intown Atlanta and East Dallas. Our commitment to personal service and attention to detail sets 
                us apart in property management.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                With years of experience in the rental market, we understand what makes a house a home. Whether 
                you're looking for a multifamily apartment or a single-family residence, we're here to help you 
                find the perfect place to call home.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Home className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Quality Properties
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Well-maintained homes in desirable Atlanta and Dallas locations
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Personal Service
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Family values mean we treat every resident like part of our family
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Trusted Experience
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Years of property management expertise you can count on
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
                  Our Locations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Intown Atlanta, Georgia
                    </h3>
                    <p className="text-muted-foreground">
                      Serving the vibrant Intown Atlanta community with quality rental homes
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      East Dallas, Texas
                    </h3>
                    <p className="text-muted-foreground">
                      Providing exceptional properties in the heart of East Dallas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
