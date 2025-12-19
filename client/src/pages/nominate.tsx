import { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GENERIC_PROPERTY_USES } from "@shared/schema";
import { MapPin, Search, Building2, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Users, Target, AlertCircle, Share2 } from "lucide-react";
import { ShareModal } from "@/components/ShareModal";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface GeocodingResult {
  place_name: string;
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
  }>;
  properties?: {
    address?: string;
  };
  address?: string;
  text?: string;
}

interface LocationData {
  address: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export default function NominateProperty() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedUses, setSelectedUses] = useState<string[]>([]);
  const [whyThisProperty, setWhyThisProperty] = useState("");
  const [currentCondition, setCurrentCondition] = useState("");
  const [estimatedSize, setEstimatedSize] = useState("");
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4,
  });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !MAPBOX_TOKEN) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  }, [searchAddress]);

  const selectLocation = useCallback((result: GeocodingResult) => {
    const [longitude, latitude] = result.center;
    
    let city = "";
    let county = "";
    let state = "";
    let zipCode = "";
    
    if (result.context) {
      for (const ctx of result.context) {
        if (ctx.id.startsWith("place.")) city = ctx.text;
        if (ctx.id.startsWith("district.")) county = ctx.text.replace(" County", "");
        if (ctx.id.startsWith("region.")) state = ctx.text;
        if (ctx.id.startsWith("postcode.")) zipCode = ctx.text;
      }
    }

    const address = result.place_name.split(",")[0];

    setSelectedLocation({
      address,
      city,
      county,
      state,
      zipCode,
      latitude,
      longitude,
    });

    setViewState({
      longitude,
      latitude,
      zoom: 17,
    });

    setSearchQuery(result.place_name);
    setSearchResults([]);
  }, []);

  const toggleUse = (useId: string) => {
    setSelectedUses((prev) =>
      prev.includes(useId)
        ? prev.filter((id) => id !== useId)
        : [...prev, useId]
    );
  };

  const [submittedNomination, setSubmittedNomination] = useState<{ id: string; address: string } | null>(null);

  const nominationMutation = useMutation({
    mutationFn: async (data: {
      propertyAddress: string;
      city: string;
      county: string;
      state: string;
      zipCode: string;
      latitude: number;
      longitude: number;
      description: string;
      whyThisProperty: string;
      currentCondition?: string;
      estimatedSize?: string;
      desiredUses: string[];
    }) => {
      const response = await apiRequest("POST", "/api/nominations", data);
      return response.json();
    },
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/nominations"] });
      setSubmittedNomination({ 
        id: data.id, 
        address: selectedLocation?.address || "property" 
      });
      setStep(4);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit nomination",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedLocation) return;

    const selectedUseLabels = selectedUses
      .map((id) => GENERIC_PROPERTY_USES.find((u) => u.id === id)?.label)
      .filter(Boolean)
      .join(", ");

    nominationMutation.mutate({
      propertyAddress: selectedLocation.address,
      city: selectedLocation.city,
      county: selectedLocation.county,
      state: selectedLocation.state,
      zipCode: selectedLocation.zipCode,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      description: `Community nominated property for: ${selectedUseLabels}`,
      whyThisProperty,
      currentCondition: currentCondition || undefined,
      estimatedSize: estimatedSize || undefined,
      desiredUses: selectedUses,
    });
  };

  const canProceedStep1 = selectedLocation !== null;
  const canProceedStep2 = selectedUses.length > 0;
  const canSubmit = whyThisProperty.length >= 20;

  const groupedUses = GENERIC_PROPERTY_USES.reduce((acc, use) => {
    if (!acc[use.category]) acc[use.category] = [];
    acc[use.category].push(use);
    return acc;
  }, {} as Record<string, Array<{ id: string; label: string; category: string }>>);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Map Configuration Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The map feature requires a Mapbox API key to be configured. Please contact the administrator to set up the VITE_MAPBOX_TOKEN.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Nominate a Property</h1>
            <p className="text-muted-foreground">
              Find a vacant or underutilized property and let the community know what you'd like it to become.
            </p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                1
              </div>
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Find Property</span>
            </div>
            <div className="w-12 h-0.5 bg-muted mx-2" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Choose Uses</span>
            </div>
            <div className="w-12 h-0.5 bg-muted mx-2" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                3
              </div>
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Details</span>
            </div>
          </div>

          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search for Property
                  </CardTitle>
                  <CardDescription>
                    Enter the property address to find it on the map
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Enter property address..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      data-testid="input-address-search"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border rounded-md divide-y">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          className="w-full p-3 text-left hover-elevate active-elevate-2"
                          onClick={() => selectLocation(result)}
                          data-testid={`button-select-address-${index}`}
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">{result.place_name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedLocation && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-chart-3 mt-0.5" />
                          <div>
                            <p className="font-medium">{selectedLocation.address}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedLocation.city}, {selectedLocation.county} County, {selectedLocation.state} {selectedLocation.zipCode}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <div className="h-[400px] rounded-md overflow-hidden">
                    <Map
                      {...viewState}
                      onMove={(evt: { viewState: typeof viewState }) => setViewState(evt.viewState)}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                      mapboxAccessToken={MAPBOX_TOKEN}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <NavigationControl position="top-right" />
                      <GeolocateControl position="top-right" />
                      {selectedLocation && (
                        <Marker
                          longitude={selectedLocation.longitude}
                          latitude={selectedLocation.latitude}
                          anchor="bottom"
                        >
                          <div className="flex flex-col items-center">
                            <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium mb-1 whitespace-nowrap">
                              {selectedLocation.address}
                            </div>
                            <MapPin className="h-8 w-8 text-primary" />
                          </div>
                        </Marker>
                      )}
                    </Map>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  data-testid="button-next-step-1"
                >
                  Continue to Choose Uses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    What Should This Property Become?
                  </CardTitle>
                  <CardDescription>
                    Select one or more desired uses for this property. Your votes help show the owner what the community wants.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedLocation && (
                    <div className="mb-6 p-3 rounded-md bg-muted/50 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{selectedLocation.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLocation.city}, {selectedLocation.state}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {Object.entries(groupedUses).map(([category, uses]) => (
                      <div key={category}>
                        <h3 className="font-medium mb-3">{category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {uses.map((use) => (
                            <button
                              key={use.id}
                              onClick={() => toggleUse(use.id)}
                              className={`p-4 rounded-md border text-left transition-colors ${
                                selectedUses.includes(use.id)
                                  ? "border-primary bg-primary/5"
                                  : "hover-elevate"
                              }`}
                              data-testid={`button-use-${use.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedUses.includes(use.id)}
                                  className="pointer-events-none"
                                />
                                <span className="font-medium">{use.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedUses.length > 0 && (
                    <div className="mt-6 p-4 rounded-md bg-muted/50">
                      <p className="text-sm font-medium mb-2">Selected Uses ({selectedUses.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUses.map((useId) => {
                          const use = GENERIC_PROPERTY_USES.find((u) => u.id === useId);
                          return use ? (
                            <Badge key={useId} variant="secondary">
                              {use.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-step-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  data-testid="button-next-step-2"
                >
                  Continue to Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tell Us More
                  </CardTitle>
                  <CardDescription>
                    Help us understand why this property matters to the community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedLocation && (
                    <div className="p-3 rounded-md bg-muted/50 flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{selectedLocation.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLocation.city}, {selectedLocation.county} County, {selectedLocation.state}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedUses.slice(0, 3).map((useId) => {
                            const use = GENERIC_PROPERTY_USES.find((u) => u.id === useId);
                            return use ? (
                              <Badge key={useId} variant="secondary" className="text-xs">
                                {use.label}
                              </Badge>
                            ) : null;
                          })}
                          {selectedUses.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedUses.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="whyThisProperty">
                      Why should this property be developed? *
                    </Label>
                    <Textarea
                      id="whyThisProperty"
                      placeholder="Describe why this property is important to the community and how developing it would benefit local residents..."
                      value={whyThisProperty}
                      onChange={(e) => setWhyThisProperty(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="textarea-why-this-property"
                    />
                    <p className="text-xs text-muted-foreground">
                      {whyThisProperty.length}/20 characters minimum
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentCondition">
                        Current Condition (optional)
                      </Label>
                      <Input
                        id="currentCondition"
                        placeholder="e.g., Vacant lot, Abandoned building"
                        value={currentCondition}
                        onChange={(e) => setCurrentCondition(e.target.value)}
                        data-testid="input-current-condition"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedSize">
                        Estimated Size (optional)
                      </Label>
                      <Input
                        id="estimatedSize"
                        placeholder="e.g., 0.5 acres, 10,000 sq ft"
                        value={estimatedSize}
                        onChange={(e) => setEstimatedSize(e.target.value)}
                        data-testid="input-estimated-size"
                      />
                    </div>
                  </div>

                  <Card className="bg-chart-3/5 border-chart-3/30">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">What happens next?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>1. We'll search public records to find who owns this property</li>
                        <li>2. The owner will be notified about community interest</li>
                        <li>3. Other community members can vote on their preferred uses</li>
                        <li>4. If the owner is interested, they can submit for tokenization</li>
                      </ul>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} data-testid="button-back-step-3">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || nominationMutation.isPending}
                  data-testid="button-submit-nomination"
                >
                  {nominationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Nomination
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && submittedNomination && (
            <div className="space-y-6">
              <Card className="text-center">
                <CardContent className="py-8">
                  <div className="h-16 w-16 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-chart-3" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Nomination Submitted!</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Thank you for nominating {submittedNomination.address} for community revitalization. 
                    We'll search for the owner and notify them about community interest.
                  </p>

                  <div className="bg-muted/50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 justify-center">
                      <Share2 className="h-4 w-4" />
                      Help This Property Go Viral!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your nomination to rally community support. More visibility means 
                      higher chances the owner will see the interest!
                    </p>
                    <ShareModal
                      title={submittedNomination.address}
                      description={`I just nominated ${submittedNomination.address} for community revitalization on RevitaHub! Help bring this property back to life.`}
                      url={`${typeof window !== "undefined" ? window.location.origin : ""}/nominations/${submittedNomination.id}`}
                      type="nomination"
                    >
                      <Button className="w-full" data-testid="button-share-nomination">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Your Nomination
                      </Button>
                    </ShareModal>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate("/community")} data-testid="button-view-community">
                      View Community
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setStep(1);
                      setSelectedLocation(null);
                      setSelectedUses([]);
                      setWhyThisProperty("");
                      setCurrentCondition("");
                      setEstimatedSize("");
                      setSearchQuery("");
                      setSearchResults([]);
                      setSubmittedNomination(null);
                    }} data-testid="button-nominate-another">
                      Nominate Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
