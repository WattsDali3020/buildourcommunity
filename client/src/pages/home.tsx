import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GenesisHero } from "@/components/GenesisHero";
import { ThreeDoors } from "@/components/ThreeDoors";
import { FourStepCTA } from "@/components/FourStepCTA";
import { WaitlistModal } from "@/components/WaitlistModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useState, useRef } from "react";
import { motion, useScroll, useInView, useSpring } from "framer-motion";
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
  MapPin,
} from "lucide-react";

function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

const phases = [
  { label: "County", price: "$12.50", multiplier: "1.5x", active: true },
  { label: "State", price: "$18.75", multiplier: "1.25x", active: false },
  { label: "National", price: "$28.13", multiplier: "1.0x", active: false },
  { label: "International", price: "$37.50", multiplier: "0.75x", active: false },
];

const votingTiers = [
  { label: "County Investor", multiplier: "1.5x", color: "text-green-400 border-green-500/30 bg-green-500/10" },
  { label: "State Investor", multiplier: "1.25x", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { label: "National Investor", multiplier: "1.0x", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
];

function PhaseTimeline() {
  const timelineRef = useRef(null);
  const isTimelineInView = useInView(timelineRef, { once: true, margin: "-80px" });

  return (
    <div className="order-2 lg:order-1" ref={timelineRef}>
      <div className="rounded-xl border bg-muted/30 p-6">
        <div className="flex items-center gap-1 w-full">
          {phases.map((phase, i) => (
            <div key={phase.label} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-2">{phase.label}</div>
              <div className="relative flex items-center w-full h-1.5">
                <div className="absolute inset-0 rounded-full bg-muted-foreground/20" />
                {phase.active && (
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={isTimelineInView ? { width: "100%" } : { width: "0%" }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  />
                )}
                {phase.active && (
                  <motion.div
                    className="absolute right-0 h-4 w-4 rounded-full bg-primary border-2 border-background"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isTimelineInView ? {
                      scale: 1,
                      opacity: 1,
                      boxShadow: [
                        "0 0 0px rgba(201, 150, 58, 0.4)",
                        "0 0 12px rgba(201, 150, 58, 0.8)",
                        "0 0 0px rgba(201, 150, 58, 0.4)",
                      ],
                    } : { scale: 0, opacity: 0 }}
                    transition={{
                      scale: { duration: 0.4, delay: 1.4 },
                      opacity: { duration: 0.4, delay: 1.4 },
                      boxShadow: { duration: 2, repeat: Infinity, delay: 1.8 },
                    }}
                  />
                )}
                {i < phases.length - 1 && (
                  <div className="absolute right-0 translate-x-1/2 h-1 w-2 bg-muted-foreground/20" />
                )}
              </div>
              <div className={`font-serif text-lg font-bold mt-2 ${phase.active ? "text-primary" : "text-muted-foreground"}`}>
                {phase.price}
              </div>
              <div className="text-xs text-muted-foreground">per token</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="py-20 md:py-24" data-testid="section-how-it-works">
      <div className="mx-auto px-5 md:px-10" style={{ maxWidth: '1100px' }}>
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
              How It Works
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-4" style={{ letterSpacing: '-1px' }} data-testid="text-how-it-works-title">
              Three Steps to Community Ownership
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
              From nomination to governance, every step is powered by the community.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-24">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                  Nominate
                </div>
                <h3 className="font-serif text-2xl mb-4">Spot a Distressed Property</h3>
                <p className="text-muted-foreground leading-relaxed mb-6" style={{ lineHeight: '1.7' }}>
                  See an abandoned building dragging down your block? Nominate it. Your neighbors
                  vote on which properties matter most. The community decides what gets revitalized first.
                </p>
                <Button asChild variant="outline" data-testid="button-nominate">
                  <Link href="/wishlist">
                    <MapPin className="mr-2 h-4 w-4" />
                    Nominate Property
                  </Link>
                </Button>
              </div>
              <div className="rounded-xl border bg-muted/30 p-8 flex items-center justify-center" style={{ minHeight: 280 }}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pin properties on the map.</p>
                  <p className="text-sm text-muted-foreground">Your community votes them up.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <PhaseTimeline />
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                  Invest
                </div>
                <h3 className="font-serif text-2xl mb-4">Get In Early at $12.50</h3>
                <p className="text-muted-foreground leading-relaxed mb-6" style={{ lineHeight: '1.7' }}>
                  County-phase investors get the best price and strongest voting power.
                  As engagement grows, the phase auto-advances and token price increases.
                  Early community support is rewarded.
                </p>
                <Button asChild variant="outline" data-testid="button-explore-properties">
                  <Link href="/properties">
                    Explore Properties
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
                  Govern
                </div>
                <h3 className="font-serif text-2xl mb-4">Vote on What Gets Built</h3>
                <p className="text-muted-foreground leading-relaxed mb-6" style={{ lineHeight: '1.7' }}>
                  Token holders vote on development plans, contractor selection, and treasury
                  allocation. Phase-weighted voting ensures local voices lead. Active voters
                  earn bonus tokens.
                </p>
                <Button asChild variant="outline">
                  <Link href="/governance">
                    <Vote className="mr-2 h-4 w-4" />
                    View Proposals
                  </Link>
                </Button>
              </div>
              <div className="rounded-xl border bg-muted/30 p-8">
                <div className="space-y-3">
                  {votingTiers.map((tier) => (
                    <div key={tier.label} className={`flex items-center justify-between rounded-lg border p-4 ${tier.color}`}>
                      <span className="text-sm font-medium">{tier.label}</span>
                      <span className="font-serif text-lg font-bold">{tier.multiplier} voting power</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlights() {
  const features = [
    {
      title: "Dynamic Community Vaults",
      desc: "Not static fractional shares. RevitaHub properties are living vaults \u2014 pricing, governance, and yield evolve as engagement grows.",
      icon: BarChart3,
    },
    {
      title: "4-Phase Pricing Ramp",
      desc: "County $12.50 \u2192 State $18.75 \u2192 National $28.13 \u2192 International $37.50. Early community investors get the best price and strongest voting power.",
      icon: TrendingUp,
    },
    {
      title: "75% Engagement Auto-Advance",
      desc: "When community engagement hits 75%, the phase auto-advances via smart contract. No gatekeepers \u2014 the community drives momentum.",
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
    <ScrollReveal>
      <section className="py-20 md:py-24 bg-gradient-premium" data-testid="section-features">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: '1100px' }}>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
              Why RevitaHub
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-4" style={{ letterSpacing: '-1px' }} data-testid="text-why-revitahub">
              Distribution Is the Real Unlock
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
              RevitaHub doesn't just tokenize real estate \u2014 it distributes ownership, governance,
              and yield directly to the communities that need it most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-glow">
                <CardContent className="p-7">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground" style={{ lineHeight: '1.7' }}>{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

function InlineWaitlist({ onOpenWaitlist }: { onOpenWaitlist: () => void }) {
  return (
    <ScrollReveal>
      <section className="py-20 md:py-24 bg-gradient-hero glow-gold">
        <div className="mx-auto px-5 md:px-10 text-center" style={{ maxWidth: '1100px' }}>
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-10 lg:p-14">
            <h2 className="font-serif text-3xl lg:text-4xl mb-4 tracking-tight" style={{ letterSpacing: '-1px' }}>
              Join the Community Revolution
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
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
              <Button size="lg" onClick={onOpenWaitlist} data-testid="button-join-waitlist">
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/litepaper">Read the Litepaper</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

function ScrollProgressIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 w-[3px] bg-muted/20 z-50 origin-top hidden lg:block"
      data-testid="scroll-progress"
    >
      <motion.div
        className="absolute top-0 left-0 right-0 bg-primary origin-top"
        style={{ scaleY, height: "100%" }}
      />
    </motion.div>
  );
}

export default function Home() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ScrollProgressIndicator />
      <main className="flex-1">
        <GenesisHero />
        <ThreeDoors />
        <HowItWorks />
        <FeatureHighlights />
        <FourStepCTA />
        <InlineWaitlist onOpenWaitlist={() => setWaitlistOpen(true)} />
      </main>
      <Footer />
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
