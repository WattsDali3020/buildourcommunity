import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, FileText } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left max-w-xl">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Ready to Invest in Your Community?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Join thousands of community investors transforming vacant properties 
              into thriving neighborhood assets. Start with as little as $50.
            </p>
          </div>
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
            <Link href="/submit">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground"
                data-testid="button-cta-submit-project"
              >
                <FileText className="mr-2 h-5 w-5" />
                Submit a Project
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
