import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Shield, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import heroImage from "@assets/generated_images/revitalized_downtown_community_district.png";

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[750px] flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Revitalized downtown community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
              <div className="h-2 w-2 bg-chart-3 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">2,400+ investors already earning</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Turn $50 Into Real Estate Ownership
            <br />
            <span className="text-primary">And Revitalize Your Community</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-4 leading-relaxed">
            Join thousands of everyday investors earning <span className="font-semibold text-white">8.2% average returns</span> by 
            transforming vacant properties into thriving neighborhood assets.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 text-white/70 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-chart-3" />
              <span>SEC-compliant tokenization</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-chart-3" />
              <span>Built on Base blockchain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-chart-3" />
              <span>Quarterly dividends</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link href="/properties">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-explore-properties">
                Start Investing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 border-white/20 text-white backdrop-blur-sm"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-how-it-works"
            >
              See How It Works
            </Button>
          </div>

          <p className="text-white/60 text-sm mb-12">
            No hidden fees. Investor protection guarantee. Cancel anytime.
          </p>

          <div className="grid grid-cols-3 gap-6 p-4 rounded-md bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-white" data-testid="stat-assets-tokenized">$12M+</span>
              </div>
              <p className="text-sm text-white/60">Assets Tokenized</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-white" data-testid="stat-community-investors">2,400+</span>
              </div>
              <p className="text-sm text-white/60">Community Investors</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-white" data-testid="stat-avg-return">8.2%</span>
              </div>
              <p className="text-sm text-white/60">Avg. Annual Return</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
