import { Card, CardContent } from "@/components/ui/card";
import { Search, Coins, Vote, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Investment",
    benefit: "Browse properties that match your goals",
    description: "Discover verified revitalization projects in your community or across America. See exactly how your investment will transform neighborhoods.",
  },
  {
    icon: Coins,
    title: "Own Real Estate for $12.50",
    benefit: "Designed for all income levels",
    description: "Skip the traditional barriers to real estate. Buy tokens that represent real ownership, with prices starting at $12.50 for local investors.",
  },
  {
    icon: Vote,
    title: "Shape Your Community",
    benefit: "Your investment, your voice",
    description: "Vote on how properties are developed. Decide between affordable housing, green spaces, or local businesses.",
  },
  {
    icon: TrendingUp,
    title: "Earn Quarterly Returns",
    benefit: "8.2% average annual returns",
    description: "Receive dividends from property income directly to your wallet. Watch your community thrive while your investment grows.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-medium mb-2">Simple 4-Step Process</p>
          <h2 className="text-3xl font-semibold mb-4">From Investor to Owner in Minutes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No real estate experience needed. No large down payments. 
            Just pick a property, invest what you're comfortable with, and start earning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative">
              <CardContent className="p-6 pt-8">
                <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-primary font-medium mb-2">{step.benefit}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
