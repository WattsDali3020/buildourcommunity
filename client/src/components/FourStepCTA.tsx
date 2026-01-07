import { Card, CardContent } from "@/components/ui/card";
import { Search, Coins, Vote, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Browse",
    description: "Explore community-nominated properties ready for revitalization",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Coins,
    number: "02",
    title: "Invest",
    description: "Purchase tokens starting at $12.50 with community-first pricing",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    icon: Vote,
    number: "03",
    title: "Vote",
    description: "Shape development decisions with AI-balanced governance",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Earn",
    description: "Receive quarterly dividends and watch your community thrive",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
];

export function FourStepCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Four Steps to Community Ownership
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands building wealth while revitalizing neighborhoods
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={step.number} 
              className="relative border-glow"
              data-testid={`card-step-${index + 1}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className={`h-6 w-6 ${step.color}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${step.color}`}>{step.number}</span>
                    <h3 className="text-lg font-semibold mt-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
