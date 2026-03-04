import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  image?: string;
  tokenPrice: number;
  totalTokens: number;
  tokensSold: number;
  fundingGoal: number;
  fundingRaised: number;
  projectedROI: number;
  communityBenefits: string[];
  phase?: string;
  engagementPercent?: number;
  isFunded?: boolean;
}

const typeLabels: Record<PropertyType, string> = {
  vacant_land: "Vacant Land",
  historic_building: "Historic Building",
  commercial: "Commercial",
  downtown: "Downtown",
};

const phaseColors: Record<string, string> = {
  County: "bg-green-500/10 text-green-500 border-green-500/20",
  State: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  National: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  International: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Funding: "bg-green-500/10 text-green-500 border-green-500/20",
  "Phase 2": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Phase 3": "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const phaseRingColors: Record<string, string> = {
  County: "#22c55e",
  State: "#3b82f6",
  National: "#a855f7",
  International: "#f59e0b",
  Funding: "#22c55e",
  "Phase 2": "#3b82f6",
  "Phase 3": "#a855f7",
};

function EngagementRing({ percent, size = 64, phase = "County" }: { percent: number; size?: number; phase?: string }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = phaseRingColors[phase] || "#3b82f6";

  return (
    <div className="relative inline-flex items-center justify-center" data-testid="engagement-ring">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{percent}%</span>
      </div>
    </div>
  );
}

export function PropertyCard({ property }: { property: Property }) {
  const fundingPercent = Math.round((property.fundingRaised / property.fundingGoal) * 100);
  const engagementPercent = property.engagementPercent ?? fundingPercent;
  const isFunded = property.isFunded ?? fundingPercent >= 100;
  const phase = property.phase || "County";

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group">
      <div className="relative aspect-video overflow-hidden">
        {property.image ? (
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid={`img-property-${property.id}`}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center" data-testid={`img-property-${property.id}`}>
            <MapPin className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge variant="outline" className={`${phaseColors[phase] || "bg-muted/80 text-foreground"} border text-xs font-medium`} data-testid={`badge-phase-${property.id}`}>
            {phase}
          </Badge>
          {isFunded && (
            <Badge className="bg-green-500 text-white text-xs" data-testid={`badge-funded-${property.id}`}>
              Funded
            </Badge>
          )}
        </div>
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
        <div className="absolute bottom-3 right-3">
          <EngagementRing percent={engagementPercent} size={56} phase={phase} />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-base mb-1 line-clamp-1" data-testid={`text-property-name-${property.id}`}>
          {property.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span data-testid={`text-property-location-${property.id}`}>
            {property.location.city}, {property.location.state}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Token</div>
            <div className="font-bold text-sm" data-testid={`text-token-price-${property.id}`}>
              ${property.tokenPrice}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">ROI</div>
            <div className="font-bold text-sm text-chart-3" data-testid={`text-roi-${property.id}`}>
              {property.projectedROI}%
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Raised</div>
            <div className="font-bold text-sm" data-testid={`text-raised-${property.id}`}>
              ${(property.fundingRaised / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Users className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{property.communityBenefits[0]}</span>
        </div>

        <Link href={`/properties/${property.id}`}>
          <Button className="w-full" size="sm" data-testid={`button-view-property-${property.id}`}>
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
