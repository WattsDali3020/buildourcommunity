import { PropertyCard } from "../PropertyCard";
import riverfrontImage from "@assets/generated_images/riverfront_wellness_community_hub.png";

export default function PropertyCardExample() {
  const property = {
    id: "etowah-wellness",
    name: "Etowah Riverfront Wellness Village",
    location: { city: "Canton", state: "Georgia" },
    type: "downtown" as const,
    image: riverfrontImage,
    tokenPrice: 100,
    totalTokens: 100000,
    tokensSold: 42000,
    fundingGoal: 10000000,
    fundingRaised: 4200000,
    projectedROI: 8,
    communityBenefits: ["50+ affordable housing units", "100+ local jobs"],
  };

  return <PropertyCard property={property} />;
}
