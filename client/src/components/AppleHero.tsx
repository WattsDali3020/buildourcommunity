import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Play } from "lucide-react";

export function AppleHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            AI-Powered Community Investment
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Own Your Community's
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Future
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform vacant properties into thriving assets. Invest from $12.50, 
          vote on development, and earn returns—powered by AI-driven governance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" asChild className="min-w-[200px]" data-testid="button-explore-properties">
            <Link href="/properties">
              Explore Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="min-w-[200px]" data-testid="button-watch-demo">
            <Link href="/how-it-works">
              <Play className="mr-2 h-4 w-4" />
              How It Works
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center" data-testid="stat-investment">
            <p className="text-3xl sm:text-4xl font-bold text-primary">$12.50</p>
            <p className="text-sm text-muted-foreground mt-1">Min. Investment</p>
          </div>
          <div className="text-center" data-testid="stat-returns">
            <p className="text-3xl sm:text-4xl font-bold text-primary">8.2%</p>
            <p className="text-sm text-muted-foreground mt-1">Target Returns</p>
          </div>
          <div className="text-center" data-testid="stat-protection">
            <p className="text-3xl sm:text-4xl font-bold text-primary">3%</p>
            <p className="text-sm text-muted-foreground mt-1">APR Protection</p>
          </div>
          <div className="text-center" data-testid="stat-governance">
            <p className="text-3xl sm:text-4xl font-bold text-primary">AI</p>
            <p className="text-sm text-muted-foreground mt-1">Smart Governance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
