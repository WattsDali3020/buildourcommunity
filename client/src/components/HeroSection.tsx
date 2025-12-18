import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Play, Shield, Users, TrendingUp } from "lucide-react";
import heroImage from "@assets/generated_images/revitalized_downtown_community_district.png";

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Revitalized downtown community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">
              Built on Base
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Community-Owned
            <br />
            <span className="text-primary">Revitalization</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
            Transform vacant properties into thriving community assets. Invest in real-world 
            real estate tokenization and earn returns while revitalizing neighborhoods across 
            all 50 states.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/properties">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-explore-properties">
                Explore Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 border-white/20 text-white backdrop-blur-sm"
              data-testid="button-watch-video"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch How It Works
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-white">$12M+</span>
              </div>
              <p className="text-sm text-white/60">Assets Tokenized</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-white">2,400+</span>
              </div>
              <p className="text-sm text-white/60">Community Investors</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-white">8.2%</span>
              </div>
              <p className="text-sm text-white/60">Avg. Annual Return</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
