import { PropertyCard, type Property } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Property as DBProperty } from "@shared/schema";
import { inferMixCategory, passesSeedGate } from "@/lib/concise-loop";

export function FeaturedProperties() {
  const { data: dbProperties = [] } = useQuery<DBProperty[]>({
    queryKey: ["/api/properties"],
  });

  const properties: Property[] = dbProperties
    .map((p) => {
      const mix = inferMixCategory({
        propertyType: p.propertyType,
        proposedUse: p.proposedUse,
        currentUse: p.currentUse,
        description: p.description,
        communityBenefits: p.communityBenefits,
        projectedJobs: p.projectedJobs,
        projectedHousingUnits: p.projectedHousingUnits,
      });
      return {
        id: p.id,
        name: p.name,
        location: { city: p.city, state: p.state },
        type: p.propertyType as Property["type"],
        image: p.imageUrl || undefined,
        tokenPrice: 12.50,
        totalTokens: 0,
        tokensSold: 0,
        fundingGoal: parseFloat(p.fundingGoal || "0"),
        fundingRaised: 0,
        projectedROI: parseFloat(p.projectedROI || "0"),
        communityBenefits: p.communityBenefits || [],
        proposedUse: p.proposedUse,
        description: p.description,
        projectedJobs: p.projectedJobs ?? undefined,
        projectedHousingUnits: p.projectedHousingUnits ?? undefined,
        mixCategory: mix,
      };
    })
    .filter((p) => passesSeedGate(p.mixCategory!))
    .slice(0, 12);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-semibold mb-2" data-testid="text-featured-title">Featured priorities</h2>
            <p className="text-muted-foreground">
              Jobs, missing-middle housing, mixed-use, and service nodes. Housing-only pins stay parked.
            </p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-view-all-properties">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg border border-dashed" data-testid="text-no-featured">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No featured priorities yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Nominate a jobs, missing-middle, mixed-use, or service node. Housing-only nominations are saved as parked.
            </p>
            <Link href="/nominate">
              <Button data-testid="button-submit-first-property">Nominate a place</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
