import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Coins, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const benefits = [
  {
    icon: Coins,
    title: "Unlock Capital",
    description: "Transform your property into digital tokens that can be purchased by community investors"
  },
  {
    icon: Users,
    title: "Community Investment",
    description: "Local residents get first access through our phased offering system"
  },
  {
    icon: Building2,
    title: "Revitalization Support",
    description: "Access our network of developers, planners, and community partners"
  }
];

const propertyTypes = [
  "Vacant Land",
  "Historic Buildings",
  "Commercial Properties",
  "Downtown Areas",
  "Industrial Sites",
  "Mixed-Use Spaces"
];

export function TokenizePropertyCTA() {
  return (
    <section className="py-16 bg-muted/30" data-testid="section-tokenize-property">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Coins className="h-4 w-4" />
              Property Owners
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight">
              Tokenize Your Property
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Own vacant land, a historic building, or underutilized commercial space? 
              Transform it into a community-owned asset through blockchain-enabled tokenization 
              on the Base network.
            </p>

            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/tokenize">
                <Button size="lg" data-testid="button-start-tokenization">
                  Start Tokenization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" data-testid="button-learn-tokenization">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-card">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Eligible Property Types</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {propertyTypes.map((type) => (
                  <div 
                    key={type}
                    className="flex items-center gap-2 p-3 rounded-md bg-muted/50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-chart-3" />
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">How Tokenization Works</h4>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                    <span className="text-muted-foreground">Submit your property for community review and election</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                    <span className="text-muted-foreground">Community votes on property and proposes potential uses</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                    <span className="text-muted-foreground">Property is tokenized on Base blockchain with 5-phase offering</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">4</span>
                    <span className="text-muted-foreground">Funds raised over 1 year with investor protections</span>
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
                <p className="text-sm">
                  <span className="font-medium">Community First:</span>{" "}
                  <span className="text-muted-foreground">
                    County residents invest at $12.50/token before state ($18.75), 
                    national ($28.13), and international ($37.50) phases.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
