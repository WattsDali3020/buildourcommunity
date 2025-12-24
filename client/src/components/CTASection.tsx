import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, FileText, Shield } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left max-w-xl">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Your Community Needs You. Start Today.
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-2">
              2,400+ investors are already earning returns while revitalizing neighborhoods. 
              Your $12.50 investment could be the start of something transformative.
            </p>
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
              <Shield className="h-4 w-4" />
              <span>Protected by our 3% APR investor guarantee</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/properties">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  data-testid="button-cta-start-investing"
                >
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tokenize">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground"
                  data-testid="button-cta-submit-project"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  List Your Property
                </Button>
              </Link>
            </div>
            <p className="text-primary-foreground/60 text-sm">
              No account needed to browse. Free to sign up.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
