import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, TrendingUp, Users, Sparkles } from "lucide-react";

const insights = [
  {
    icon: Brain,
    title: "AI-Balanced Voting",
    description: "Detects bias patterns and suggests balanced governance options",
  },
  {
    icon: Shield,
    title: "Whale Protection",
    description: "AI monitors for concentration risk and manipulation attempts",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Phases",
    description: "Phase advancement based on real engagement, not fixed timelines",
  },
  {
    icon: Users,
    title: "Engagement Nudges",
    description: "Behavioral prompts increase participation and community returns",
  },
];

export function AIInsightsBanner() {
  return (
    <section className="py-20 section-alt">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Nudged RevitalDAO
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Governance, Evolved
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The first real estate platform combining AI with DAO governance 
            for fairer, smarter community decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <Card key={index} className="border-glow bg-card" data-testid={`card-ai-insight-${index}`}>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <insight.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
