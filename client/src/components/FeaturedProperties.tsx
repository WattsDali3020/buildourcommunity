import { PropertyCard, type Property } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import riverfrontImage from "@assets/generated_images/riverfront_wellness_community_hub.png";
import millImage from "@assets/generated_images/historic_mill_adaptive_reuse.png";
import downtownImage from "@assets/generated_images/revitalized_downtown_community_district.png";

// todo: remove mock functionality
const mockProperties: Property[] = [
  {
    id: "etowah-wellness-village",
    name: "Etowah Riverfront Wellness Village",
    location: { city: "Canton", state: "Georgia" },
    type: "downtown",
    image: riverfrontImage,
    tokenPrice: 100,
    totalTokens: 100000,
    tokensSold: 42000,
    fundingGoal: 10000000,
    fundingRaised: 4200000,
    projectedROI: 8,
    communityBenefits: ["50+ affordable housing units", "100+ local jobs", "Riverfront trail access"],
  },
  {
    id: "mill-on-main",
    name: "Historic Mill Adaptive Reuse",
    location: { city: "Greenville", state: "South Carolina" },
    type: "historic_building",
    image: millImage,
    tokenPrice: 250,
    totalTokens: 80000,
    tokensSold: 58000,
    fundingGoal: 20000000,
    fundingRaised: 14500000,
    projectedROI: 9.5,
    communityBenefits: ["Co-working space", "Local retail incubator", "Event venue"],
  },
  {
    id: "downtown-revitalization",
    name: "Main Street Revitalization District",
    location: { city: "Asheville", state: "North Carolina" },
    type: "commercial",
    image: downtownImage,
    tokenPrice: 150,
    totalTokens: 120000,
    tokensSold: 85000,
    fundingGoal: 18000000,
    fundingRaised: 12750000,
    projectedROI: 7.5,
    communityBenefits: ["Downtown walkability", "Small business support", "Cultural programming"],
  },
];

export function FeaturedProperties() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-semibold mb-2">Featured Properties</h2>
            <p className="text-muted-foreground">
              Discover high-impact revitalization projects across the nation
            </p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-view-all-properties">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
