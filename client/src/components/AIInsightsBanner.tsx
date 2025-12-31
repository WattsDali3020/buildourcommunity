import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, TrendingUp, Users } from "lucide-react";

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
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Brain className="h-3 w-3 mr-1" />
            AI-Nudged RevitalDAO
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Governance, Evolved
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The first real estate platform combining AI with DAO governance 
            for fairer, smarter community decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <Card key={index} className="border-0 bg-background/50 backdrop-blur" data-testid={`card-ai-insight-${index}`}>
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <insight.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
