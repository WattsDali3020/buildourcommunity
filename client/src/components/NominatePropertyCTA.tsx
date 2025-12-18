import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Vote, Building2, ArrowRight, CheckCircle } from "lucide-react";

export function NominatePropertyCTA() {
  return (
    <section className="py-16 lg:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">Your Community, Your Choice</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Know a vacant building or unused land that could transform your neighborhood? 
            Nominate it for community-led development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Nominate Properties</h3>
              <p className="text-sm text-muted-foreground">
                Submit vacant or underused properties in your community that deserve revitalization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
                <Vote className="h-7 w-7 text-chart-3" />
              </div>
              <h3 className="font-semibold mb-2">Community Votes</h3>
              <p className="text-sm text-muted-foreground">
                Token holders vote on which properties to develop and what they should become
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-chart-1/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-chart-1" />
              </div>
              <h3 className="font-semibold mb-2">Survey-Driven Priorities</h3>
              <p className="text-sm text-muted-foreground">
                Community needs surveys inform development decisions based on what neighbors actually want
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card border rounded-lg p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Ready to Shape Your Neighborhood?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your voice matters. Nominate a property, join the discussion, and vote on your community's future.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-chart-3" /> Free to nominate
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-chart-3" /> Token holders vote
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-chart-3" /> Community decides
                </span>
              </div>
            </div>
            <Link href="/community">
              <Button size="lg" className="flex items-center gap-2" data-testid="button-nominate-property-home">
                Nominate a Property
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
