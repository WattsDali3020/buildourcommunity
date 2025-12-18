import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { NominatePropertyCTA } from "@/components/NominatePropertyCTA";
import { HowItWorks } from "@/components/HowItWorks";
import { ImpactStats } from "@/components/ImpactStats";
import { CTASection } from "@/components/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProperties />
        <NominatePropertyCTA />
        <HowItWorks />
        <ImpactStats />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
