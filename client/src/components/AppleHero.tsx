import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export function AppleHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero glow-blue">
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Community Investment Platform
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
          <span className="block text-foreground">
            Own Your Community's
          </span>
          <span className="text-gradient-animated">
            Future
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Transform vacant properties into thriving assets. Invest from $12.50, 
          vote on development, and earn returns—powered by AI-driven governance 
          on the blockchain.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <div className="stat-card rounded-xl border bg-card/50 backdrop-blur-sm p-5 border-glow" data-testid="stat-investment">
            <p className="text-3xl sm:text-4xl font-bold metric-value text-primary">$12.50</p>
            <p className="text-sm text-muted-foreground mt-2">Min. Investment</p>
          </div>
          <div className="stat-card rounded-xl border bg-card/50 backdrop-blur-sm p-5 border-glow" data-testid="stat-returns">
            <p className="text-3xl sm:text-4xl font-bold metric-value text-primary">8.2%</p>
            <p className="text-sm text-muted-foreground mt-2">Target Returns</p>
          </div>
          <div className="stat-card rounded-xl border bg-card/50 backdrop-blur-sm p-5 border-glow" data-testid="stat-protection">
            <p className="text-3xl sm:text-4xl font-bold metric-value text-primary">3%</p>
            <p className="text-sm text-muted-foreground mt-2">APR Protection</p>
          </div>
          <div className="stat-card rounded-xl border bg-card/50 backdrop-blur-sm p-5 border-glow" data-testid="stat-governance">
            <p className="text-3xl sm:text-4xl font-bold metric-value text-primary">AI</p>
            <p className="text-sm text-muted-foreground mt-2">Smart Governance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
