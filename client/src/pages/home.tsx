import { SimpleHeader } from "@/components/SimpleHeader";
import { Footer } from "@/components/Footer";
import { AppleHero } from "@/components/AppleHero";
import { FourStepCTA } from "@/components/FourStepCTA";
import { AIInsightsBanner } from "@/components/AIInsightsBanner";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Shield, Users, Coins } from "lucide-react";

function TrustIndicators() {
  return (
    <section className="py-16 border-y bg-muted/20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Investor Protected</p>
              <p className="text-sm text-muted-foreground">3% APR refunds if funding fails</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="font-semibold">Community First</p>
              <p className="text-sm text-muted-foreground">Local investors get 1.5x voting power</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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

function JoinWaitlist() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Card className="bg-gradient-to-br from-primary/10 via-background to-chart-2/10 border-0">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold mb-4">
              Join the Community Revolution
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be among the first to transform vacant properties into thriving community assets. 
              Early members get priority access to Phase 1 investments.
            </p>
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
          </CardContent>
        </Card>
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
        <AIInsightsBanner />
        <FeaturedProperties />
        <JoinWaitlist />
      </main>
      <Footer />
    </div>
  );
}
