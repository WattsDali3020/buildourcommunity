import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { TrustSection } from "@/components/TrustSection";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { NominatePropertyCTA } from "@/components/NominatePropertyCTA";
import { TokenizePropertyCTA } from "@/components/TokenizePropertyCTA";
import { HowItWorks } from "@/components/HowItWorks";
import { ImpactStats } from "@/components/ImpactStats";
import { SummaryPanel } from "@/components/SummaryPanel";
import { CTASection } from "@/components/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <HowItWorks />
        <FeaturedProperties />
        <ImpactStats />
        <NominatePropertyCTA />
        <TokenizePropertyCTA />
        <SummaryPanel />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
