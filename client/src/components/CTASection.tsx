import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, FileText, Shield, Bell } from "lucide-react";
import { WaitlistModal } from "./WaitlistModal";

export function CTASection() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  
  return (
    <>
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left max-w-xl">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Your Community Needs You. Start Today.
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-2">
                Join the waitlist for updates on blockchain integration, first pilots, and early access opportunities.
                Your $12.50 investment could be the start of something transformative.
              </p>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Shield className="h-4 w-4" />
                <span>Protected by our 3% APR investor guarantee</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => setWaitlistOpen(true)}
                  data-testid="button-cta-join-waitlist"
                >
                  <Bell className="mr-2 h-5 w-5" />
                  Join Waitlist
                </Button>
                <Link href="/litepaper">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground"
                    data-testid="button-cta-read-litepaper"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Read Litepaper
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-primary-foreground/60 text-sm">
                <Link href="/properties" className="hover:text-primary-foreground transition-colors">
                  Browse Properties
                  <ArrowRight className="ml-1 h-3 w-3 inline" />
                </Link>
                <span className="hidden sm:inline">|</span>
                <Link href="/tokenize" className="hover:text-primary-foreground transition-colors">
                  List Your Property
                  <ArrowRight className="ml-1 h-3 w-3 inline" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
}
