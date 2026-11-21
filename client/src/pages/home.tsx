import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GenesisHero } from "@/components/GenesisHero";
import { ThreeDoors } from "@/components/ThreeDoors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useLayoutEffect, useRef } from "react";
import { motion, useScroll, useInView, useSpring } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Vote,
  MapPin,
  Home as HomeIcon,
  Store,
  Factory,
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

const projectTypes = [
  { label: "Homes", desc: "Places people who work here can afford to live.", icon: HomeIcon },
  { label: "Shops & storefronts", desc: "Everyday businesses on the street.", icon: Store },
  { label: "Jobs & industrial", desc: "Workplaces close to where people live.", icon: Factory },
];

const votingTiers = [
  { label: "Verified county residents", weight: "Extra weight", color: "text-green-400 border-green-500/30 bg-green-500/10" },
  { label: "Elsewhere in the state", weight: "Standard weight", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { label: "Elsewhere in the U.S.", weight: "Lighter weight", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
];

function ProjectTypesPanel() {
  return (
    <div className="order-2 lg:order-1">
      <div className="rounded-xl border bg-muted/30 p-6 space-y-3">
        {projectTypes.map((t) => (
          <div key={t.label} className="flex items-start gap-3 rounded-lg border bg-background/80 p-4">
            <t.icon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-24" data-testid="section-how-it-works">
      <div className="mx-auto px-5 md:px-10" style={{ maxWidth: "1100px" }}>
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">How It Could Work</p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-4" data-testid="text-how-it-works-title">Three Steps, From Idea to Built</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A proposed design for how neighbors could suggest projects and weigh in on what gets built nearby.</p>
          </div>
        </ScrollReveal>
        <div className="space-y-24">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                  Suggest
                </div>
                <h3 className="font-serif text-2xl mb-4">Spot What Your Area Needs</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">A lot that could hold homes, a storefront that has sat empty, a site that could bring jobs closer. Suggest it, and neighbors can weigh in.</p>
                <Button asChild variant="outline" data-testid="button-nominate">
                  <Link href="/wishlist"><MapPin className="mr-2 h-4 w-4" />Suggest a Project</Link>
                </Button>
              </div>
              <div className="rounded-xl border bg-muted/30 p-8 flex items-center justify-center" style={{ minHeight: 280 }}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Starting in Cherokee County.</p>
                  <p className="text-sm text-muted-foreground">Pins are RevitaHub properties only.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ProjectTypesPanel />
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                  First Window
                </div>
                <h3 className="font-serif text-2xl mb-4">Who Goes First</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">In the proposed design, county residents would get the first window to help fund a chosen project, once their residency is verified. How that works legally is still being settled. This preview does not do this.</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
                  Weigh In
                </div>
                <h3 className="font-serif text-2xl mb-4">Have a Say on What Goes First</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">In the proposed design, votes would be weighted by where you live: verified county residents would get extra weight per vote. This preview does not weight votes that way.</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-8">
                <div className="space-y-3">
                  {votingTiers.map((tier) => (
                    <div key={tier.label} className={`flex items-center justify-between rounded-lg border p-4 ${tier.color}`}>
                      <span className="text-sm font-medium">{tier.label}</span>
                      <span className="font-serif text-lg font-bold">{tier.weight}</span>
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
    { title: "Homes", desc: "Housing that people who already work in the county can afford, near the jobs they have.", icon: HomeIcon },
    { title: "Shops & Storefronts", desc: "Everyday businesses on the street, so fewer errands mean leaving the county.", icon: Store },
    { title: "Jobs & Industrial", desc: "Workshops and job sites closer to where people live, so fewer long commutes.", icon: Factory },
    { title: "Local Voices Weighed In", desc: "Neighbors can suggest projects and weigh in on what gets built nearby.", icon: Vote },
    { title: "Costs in the Open", desc: "In the proposed design, each project would show who nearby bears its costs, not only who benefits.", icon: Shield },
    { title: "Walk to Work", desc: "Homes, shops, and workplaces near each other, so more people can live close to where they work.", icon: MapPin },
  ];
  return (
    <ScrollReveal>
      <section className="py-20 md:py-24 bg-gradient-premium" data-testid="section-features">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: "1100px" }}>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-4">Why RevitaHub</p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-4" data-testid="text-why-revitahub">Build What the County Is Missing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-glow">
                <CardContent className="p-7">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

function ClosingSection() {
  return (
    <ScrollReveal>
      <section className="py-20 md:py-24 bg-gradient-hero glow-gold">
        <div className="mx-auto px-5 md:px-10 text-center" style={{ maxWidth: "1100px" }}>
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-10 lg:p-14">
            <h2 className="font-serif text-3xl lg:text-4xl mb-4 tracking-tight">What is your area missing?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">This is an early design, shared to learn from neighbors. Homes, a storefront, a place to work: tell us what would make the biggest difference where you live.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="button-suggest-project"><Link href="/wishlist">Suggest a Project<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
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
    <motion.div className="fixed right-0 top-0 bottom-0 w-[3px] bg-muted/20 z-50 origin-top hidden lg:block" data-testid="scroll-progress">
      <motion.div className="absolute top-0 left-0 right-0 bg-primary origin-top" style={{ scaleY, height: "100%" }} />
    </motion.div>
  );
}

const HOW_IT_WORKS_HASH = "#how-it-works";

function scrollToHowItWorks() {
  if (window.location.hash !== HOW_IT_WORKS_HASH) return;
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [location] = useLocation();

  useLayoutEffect(() => {
    scrollToHowItWorks();
    const events = ["hashchange", "popstate", "pushState", "replaceState"] as const;
    for (const eventName of events) window.addEventListener(eventName, scrollToHowItWorks);
    return () => {
      for (const eventName of events) window.removeEventListener(eventName, scrollToHowItWorks);
    };
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ScrollProgressIndicator />
      <main className="flex-1">
        <GenesisHero />
        <ThreeDoors />
        <HowItWorks />
        <FeatureHighlights />
        <ClosingSection />
      </main>
      <Footer />
    </div>
  );
}
