import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StateFilter } from "@/components/StateFilter";
import { PropertyCard, type Property } from "@/components/PropertyCard";
import { ROICalculator } from "@/components/ROICalculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LayoutGrid, Map as MapIcon, MapPin } from "lucide-react";
import { Link } from "wouter";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import riverfrontImage from "@assets/generated_images/riverfront_wellness_community_hub.png";
import millImage from "@assets/generated_images/historic_mill_adaptive_reuse.png";
import downtownImage from "@assets/generated_images/revitalized_downtown_community_district.png";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface PropertyWithCoords extends Property {
  latitude: number;
  longitude: number;
  phase?: string;
}

const allProperties: PropertyWithCoords[] = [
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
    latitude: 34.2368,
    longitude: -84.4908,
    phase: "Funding",
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
    latitude: 34.8526,
    longitude: -82.3940,
    phase: "Phase 2",
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
    latitude: 35.5951,
    longitude: -82.5515,
    phase: "Phase 3",
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
    latitude: 30.2672,
    longitude: -97.7431,
    phase: "Funding",
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
    latitude: 39.7645,
    longitude: -104.9803,
    phase: "Phase 2",
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
    latitude: 33.4620,
    longitude: -112.0650,
    phase: "Funding",
  },
];

function PropertyMarkerPopup({ property }: { property: PropertyWithCoords }) {
  const fundingPercent = Math.round((property.fundingRaised / property.fundingGoal) * 100);

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="w-56 cursor-pointer hover-elevate" data-testid={`marker-card-${property.id}`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{property.name}</h4>
            {property.phase && (
              <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
                {property.phase}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {property.location.city}, {property.location.state}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Funded</span>
              <span className="font-medium">{fundingPercent}%</span>
            </div>
            <Progress value={fundingPercent} className="h-1.5" />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-muted-foreground">${property.tokenPrice}/token</span>
            <span className="font-medium text-chart-3">{property.projectedROI}% ROI</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Properties() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 3.8,
  });

  const handleMarkerClick = useCallback((propertyId: string) => {
    setSelectedMarkerId((prev) => (prev === propertyId ? null : propertyId));
  }, []);

  const hasMapToken = !!MAPBOX_TOKEN;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Browse Properties</h1>
              <p className="text-muted-foreground">
                Discover tokenized revitalization projects across all 50 states
              </p>
            </div>
            {hasMapToken && (
              <div className="flex items-center gap-1 border rounded-md p-1" data-testid="view-mode-toggle">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <LayoutGrid className="h-4 w-4 mr-1.5" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  data-testid="button-map-view"
                >
                  <MapIcon className="h-4 w-4 mr-1.5" />
                  Map
                </Button>
              </div>
            )}
          </div>

          <div className="mb-8">
            <StateFilter />
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-20 z-50">
                  <ROICalculator />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-0">
                    <div className="h-[600px] rounded-md overflow-hidden" data-testid="properties-map">
                      <Map
                        {...viewState}
                        onMove={(evt: { viewState: typeof viewState }) => setViewState(evt.viewState)}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        mapboxAccessToken={MAPBOX_TOKEN}
                        style={{ width: "100%", height: "100%" }}
                        onClick={() => setSelectedMarkerId(null)}
                      >
                        <NavigationControl position="top-right" />
                        {allProperties.map((property) => (
                          <Marker
                            key={property.id}
                            longitude={property.longitude}
                            latitude={property.latitude}
                            anchor="bottom"
                            onClick={(e) => {
                              e.originalEvent.stopPropagation();
                              handleMarkerClick(property.id);
                            }}
                          >
                            <div className="flex flex-col items-center cursor-pointer" data-testid={`marker-${property.id}`}>
                              {selectedMarkerId === property.id && (
                                <div className="mb-1">
                                  <PropertyMarkerPopup property={property} />
                                </div>
                              )}
                              <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
                                <MapPin className="h-4 w-4" />
                              </div>
                            </div>
                          </Marker>
                        ))}
                      </Map>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto">
                {allProperties.map((property) => {
                  const fundingPercent = Math.round((property.fundingRaised / property.fundingGoal) * 100);
                  const isSelected = selectedMarkerId === property.id;
                  return (
                    <Card
                      key={property.id}
                      className={`cursor-pointer hover-elevate ${isSelected ? "ring-2 ring-primary" : ""}`}
                      onClick={() => {
                        setSelectedMarkerId(property.id);
                        setViewState({
                          longitude: property.longitude,
                          latitude: property.latitude,
                          zoom: 12,
                        });
                      }}
                      data-testid={`map-list-item-${property.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm line-clamp-1">{property.name}</h3>
                          {property.phase && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {property.phase}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location.city}, {property.location.state}
                        </p>
                        <div className="space-y-1 mb-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Funded</span>
                            <span className="font-medium">{fundingPercent}%</span>
                          </div>
                          <Progress value={fundingPercent} className="h-1.5" />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">${property.tokenPrice}/token</span>
                          <span className="font-medium text-chart-3">{property.projectedROI}% ROI</span>
                        </div>
                        <Link href={`/properties/${property.id}`}>
                          <Button size="sm" className="w-full mt-3" data-testid={`button-view-map-${property.id}`}>
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
