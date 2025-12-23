import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Shield, DollarSign, Vote } from "lucide-react";

const keyPoints = [
  {
    icon: DollarSign,
    text: "Start investing with just $50",
  },
  {
    icon: Shield,
    text: "3% APR investor protection guarantee",
  },
  {
    icon: Vote,
    text: "Vote on how properties are developed",
  },
];

export function SummaryPanel() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <Card className="bg-muted/50 border-2">
          <CardContent className="p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                  Ready to own a piece of real estate?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Join 2,400+ community investors who are earning returns while revitalizing 
                  neighborhoods across America. Here's what you get:
                </p>
                <div className="space-y-3 mb-6">
                  {keyPoints.map((point) => (
                    <div key={point.text} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <point.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{point.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4 w-full lg:w-auto">
                <Link href="/properties">
                  <Button size="lg" className="w-full lg:w-auto" data-testid="button-summary-invest">
                    Start Investing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-chart-3" />
                  <span>No credit card required to browse</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
