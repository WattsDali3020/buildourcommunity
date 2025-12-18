import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StateFilter } from "@/components/StateFilter";
import { PropertyCard, type Property } from "@/components/PropertyCard";
import { ROICalculator } from "@/components/ROICalculator";
import riverfrontImage from "@assets/generated_images/riverfront_wellness_community_hub.png";
import millImage from "@assets/generated_images/historic_mill_adaptive_reuse.png";
import downtownImage from "@assets/generated_images/revitalized_downtown_community_district.png";

// todo: remove mock functionality
const allProperties: Property[] = [
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
  {
    id: "austin-land-trust",
    name: "Community Land Trust Initiative",
    location: { city: "Austin", state: "Texas" },
    type: "vacant_land",
    image: riverfrontImage,
    tokenPrice: 75,
    totalTokens: 200000,
    tokensSold: 65000,
    fundingGoal: 15000000,
    fundingRaised: 4875000,
    projectedROI: 6.5,
    communityBenefits: ["Permanently affordable housing", "Community garden", "Youth programs"],
  },
  {
    id: "denver-warehouse",
    name: "RiNo Arts District Warehouse",
    location: { city: "Denver", state: "Colorado" },
    type: "commercial",
    image: millImage,
    tokenPrice: 200,
    totalTokens: 100000,
    tokensSold: 72000,
    fundingGoal: 20000000,
    fundingRaised: 14400000,
    projectedROI: 8.5,
    communityBenefits: ["Artist studios", "Gallery space", "Maker workshops"],
  },
  {
    id: "phoenix-downtown",
    name: "Roosevelt Row Revitalization",
    location: { city: "Phoenix", state: "Arizona" },
    type: "downtown",
    image: downtownImage,
    tokenPrice: 125,
    totalTokens: 160000,
    tokensSold: 45000,
    fundingGoal: 20000000,
    fundingRaised: 5625000,
    projectedROI: 7.8,
    communityBenefits: ["Street activation", "Local business incubator", "Public art"],
  },
];

export default function Properties() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Browse Properties</h1>
            <p className="text-muted-foreground">
              Discover tokenized revitalization projects across all 50 states
            </p>
          </div>

          <div className="mb-8">
            <StateFilter />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <ROICalculator />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
