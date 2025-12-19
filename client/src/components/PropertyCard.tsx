import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Share2 } from "lucide-react";
import { Link } from "wouter";
import { ShareModal } from "./ShareModal";

export type PropertyType = "vacant_land" | "historic_building" | "commercial" | "downtown";

export interface Property {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  type: PropertyType;
  image: string;
  tokenPrice: number;
  totalTokens: number;
  tokensSold: number;
  fundingGoal: number;
  fundingRaised: number;
  projectedROI: number;
  communityBenefits: string[];
}

const typeLabels: Record<PropertyType, string> = {
  vacant_land: "Vacant Land",
  historic_building: "Historic Building",
  commercial: "Commercial",
  downtown: "Downtown",
};

const typeColors: Record<PropertyType, string> = {
  vacant_land: "bg-chart-3 text-white",
  historic_building: "bg-chart-4 text-white",
  commercial: "bg-chart-1 text-white",
  downtown: "bg-chart-5 text-white",
};

export function PropertyCard({ property }: { property: Property }) {
  const fundingPercent = Math.round((property.fundingRaised / property.fundingGoal) * 100);
  const tokensSoldPercent = Math.round((property.tokensSold / property.totalTokens) * 100);

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
          data-testid={`img-property-${property.id}`}
        />
        <Badge className={`absolute top-3 left-3 ${typeColors[property.type]}`}>
          {typeLabels[property.type]}
        </Badge>
        <div className="absolute top-2 right-2">
          <ShareModal
            title={property.name}
            description={`Invest in ${property.name} - ${property.location.city}, ${property.location.state}. Token price: $${property.tokenPrice}. Projected ROI: ${property.projectedROI}%`}
            url={`${typeof window !== "undefined" ? window.location.origin : ""}/properties/${property.id}`}
            image={property.image}
            type="property"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-background/70 dark:bg-background/60 backdrop-blur-sm rounded-md"
              data-testid={`button-share-${property.id}`}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </ShareModal>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1" data-testid={`text-property-name-${property.id}`}>
          {property.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span data-testid={`text-property-location-${property.id}`}>
            {property.location.city}, {property.location.state}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Tokens Sold</span>
              <span className="font-medium">{tokensSoldPercent}%</span>
            </div>
            <Progress value={tokensSoldPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground">Token Price</div>
              <div className="font-semibold text-sm" data-testid={`text-token-price-${property.id}`}>
                ${property.tokenPrice}
              </div>
            </div>
            <div className="p-2 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground">Est. ROI</div>
              <div className="font-semibold text-sm text-chart-3" data-testid={`text-roi-${property.id}`}>
                {property.projectedROI}%
              </div>
            </div>
            <div className="p-2 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground">Raised</div>
              <div className="font-semibold text-sm" data-testid={`text-raised-${property.id}`}>
                ${(property.fundingRaised / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{property.communityBenefits[0]}</span>
          </div>

          <Link href={`/properties/${property.id}`}>
            <Button className="w-full" data-testid={`button-view-property-${property.id}`}>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
