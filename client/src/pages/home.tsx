import { SimpleHeader } from "@/components/SimpleHeader";
import { Footer } from "@/components/Footer";
import { AppleHero } from "@/components/AppleHero";
import { FourStepCTA } from "@/components/FourStepCTA";
import { AIInsightsBanner } from "@/components/AIInsightsBanner";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  ArrowRight,
  Shield,
  Users,
  Coins,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Vote,
  Zap,
  BarChart3,
  Lock,
} from "lucide-react";

function TrustIndicators() {
  return (
    <section className="py-16 border-y section-alt" data-testid="section-trust">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-xl border-glow border bg-card/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Investor Protected</p>
              <p className="text-sm text-muted-foreground">3% APR refunds if funding fails</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border-glow border bg-card/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="font-semibold">Community First</p>
              <p className="text-sm text-muted-foreground">Local investors get 1.5x voting power</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border-glow border bg-card/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="font-semibold">Low Entry</p>
              <p className="text-sm text-muted-foreground">Start investing from just $12.50</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlights() {
  const features = [
    {
      title: "Dynamic Community Vaults",
      desc: "Not static fractional shares. RevitaHub properties are living vaults — pricing, governance, and yield evolve as engagement grows.",
      icon: BarChart3,
    },
    {
      title: "4-Phase Pricing Ramp",
      desc: "County $12.50 → State $18.75 → National $28.13 → International $37.50. Early community investors get the best price and strongest voting power.",
      icon: TrendingUp,
    },
    {
      title: "75% Engagement Auto-Advance",
      desc: "When community engagement hits 75%, the phase auto-advances via smart contract. No gatekeepers — the community drives momentum.",
      icon: Zap,
    },
    {
      title: "Vote-to-Earn Governance",
      desc: "Active voters earn bonus tokens. Phase-weighted voting power ensures local voices lead (County 1.5x, State 1.25x, National 1.0x).",
      icon: Vote,
    },
    {
      title: "Transparent Founder Economics",
      desc: "1% of treasury disbursements, on-chain, capped, and auditable. 24-month vesting with 90-day cliff. No hidden fees.",
      icon: Lock,
    },
    {
      title: "3% APR Investor Protection",
      desc: "100% funding required or full refund with 3% APR interest. Your investment is protected by smart contract escrow.",
      icon: Shield,
    },
  ];

  return (
    <section className="py-20 bg-gradient-premium" data-testid="section-features">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            Why RevitaHub
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4" data-testid="text-why-revitahub">
            Distribution Is the Real Unlock
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            RevitaHub doesn't just tokenize real estate — it distributes ownership, governance, 
            and yield directly to the communities that need it most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-glow">
              <CardContent className="p-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function JoinWaitlist() {
  return (
    <section className="py-24 bg-gradient-hero glow-blue">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-10 lg:p-14">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
            Join the Community Revolution
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be among the first to transform vacant properties into thriving community assets. 
            Early members get priority access to County Phase investments at $12.50 per token.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {[
              "Fractional real estate ownership",
              "Quarterly dividend payments",
              "Community voting rights",
              "Vote-to-earn bonus tokens"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild data-testid="button-join-waitlist">
              <a href="https://buildourcommunity.co" target="_blank" rel="noopener noreferrer">
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/litepaper">Read the Litepaper</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader />
      <main className="flex-1">
        <AppleHero />
        <TrustIndicators />
        <FourStepCTA />
        <FeatureHighlights />
        <AIInsightsBanner />
        <FeaturedProperties />
        <JoinWaitlist />
      </main>
      <Footer />
    </div>
  );
}
