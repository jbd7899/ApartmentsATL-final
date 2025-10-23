import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";

export function AppfolioSection() {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.charset = 'utf-8';
    script1.text = `
      document.write(unescape("%3Cscript src='" + (('https:' == document.location.protocol) ? 'https:' : 'http:') + "//apartmentsatl.appfolio.com/javascripts/listing.js' type='text/javascript'%3E%3C/script%3E"));
    `;

    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.charset = 'utf-8';
    script2.text = `
      Appfolio.Listing({
        hostUrl: 'apartmentsatl.appfolio.com',
        themeColor: '#676767',
        height: '500px',
        width: '100%',
        defaultOrder: 'date_posted'
      });
    `;

    const container = document.getElementById('appfolio-container');
    if (container) {
      container.appendChild(script1);
      setTimeout(() => {
        container.appendChild(script2);
      }, 100);
      scriptLoadedRef.current = true;
    }

    return () => {
      if (container) {
        container.innerHTML = '';
        scriptLoadedRef.current = false;
      }
    };
  }, []);

  return (
    <section className="py-16 bg-muted/30" data-testid="section-appfolio">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Available Properties for Rent
            </h2>
            <p className="text-lg text-muted-foreground">
              View current availability and submit inquiries directly through our listing portal
            </p>
          </div>

          <Card className="p-6 overflow-hidden">
            <div id="appfolio-container" className="min-h-[500px]" />
          </Card>
        </div>
      </div>
    </section>
  );
}
