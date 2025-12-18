import { Card, CardContent } from "@/components/ui/card";
import { Search, Coins, Vote, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Properties",
    description: "Browse verified revitalization projects across all 50 states. Each listing includes detailed financials, community impact metrics, and legal documentation.",
  },
  {
    icon: Coins,
    title: "Invest with Tokens",
    description: "Purchase fractional ownership tokens starting at $50. Your investment is secured on the Base blockchain with transparent, verifiable ownership.",
  },
  {
    icon: Vote,
    title: "Participate in Governance",
    description: "Vote on key decisions about property development and community benefits. Your tokens equal your voice in shaping neighborhood revitalization.",
  },
  {
    icon: TrendingUp,
    title: "Earn Returns",
    description: "Receive quarterly dividends from property income. Track your portfolio performance and community impact in real-time through your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Community ownership made simple through blockchain technology. 
            From discovery to dividends in four easy steps.
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
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
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
