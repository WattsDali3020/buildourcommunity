import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhaseOfferingCard, type Phase } from "@/components/PhaseOfferingCard";
import { TokenOfferingTimeline } from "@/components/TokenOfferingTimeline";
import { FundingTimeline } from "@/components/FundingTimeline";
import { SimplePurchaseModal } from "@/components/SimplePurchaseModal";
import { PrivateAccessGate } from "@/components/PrivateAccessGate";
import { CapitalStackDisplay } from "@/components/CapitalStackDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, Building2, Users, TrendingUp, DollarSign, 
  FileText, Calendar, ExternalLink, Share2, Heart,
  Briefcase, Home, Leaf, CheckCircle, Lock, Loader2
} from "lucide-react";
import { useParams, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import riverfrontImage from "@assets/generated_images/riverfront_wellness_community_hub.png";
import { PHASE_CONFIG } from "@shared/schema";
import type { User, Property, TokenOffering, OfferingPhase } from "@shared/schema";

interface PropertyDetailData {
  property: Property;
  offering: TokenOffering | null;
  phases: OfferingPhase[];
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearch();
  const { toast } = useToast();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [hasPrivateAccess, setHasPrivateAccess] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [isValidatingAccess, setIsValidatingAccess] = useState(false);
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  const { data: propertyData, isLoading: isLoadingProperty } = useQuery<PropertyDetailData>({
    queryKey: ["/api/properties", id],
    enabled: !!id,
  });

  const property = propertyData?.property;
  const offering = propertyData?.offering;
  const apiPhases = propertyData?.phases || [];

  const phases: Phase[] = apiPhases.map((p, index) => ({
    id: p.id,
    phase: p.phase,
    phaseName: PHASE_CONFIG[p.phase]?.name || p.phase,
    description: PHASE_CONFIG[p.phase]?.description || "",
    basePrice: Number(p.basePrice),
    currentPrice: Number(p.currentPrice),
    priceMultiplier: Number(p.priceMultiplier),
    tokenAllocation: p.tokenAllocation,
    tokensSold: p.tokensSold || 0,
    maxTokensPerPerson: p.maxTokensPerPerson,
    eligibilityCounty: p.eligibilityCounty || undefined,
    eligibilityState: p.eligibilityState || undefined,
    isActive: p.isActive || false,
    isCompleted: (p.tokensSold || 0) >= p.tokenAllocation,
    isLocked: !p.isActive && index > 0,
    userEligible: true,
    userTokensPurchased: 0,
  }));

  useEffect(() => {
    const validateAccess = async () => {
      if (!property || !offering) {
        if (!isLoadingProperty && id) {
          setAccessCheckComplete(true);
        }
        return;
      }

      const isPrivate = offering.offeringType === "private";
      
      if (!isPrivate) {
        setAccessCheckComplete(true);
        return;
      }

      const storedAccess = sessionStorage.getItem(`private_access_validated_${offering.id}`);
      if (storedAccess) {
        try {
          const parsed = JSON.parse(storedAccess);
          if (parsed.validated) {
            setHasPrivateAccess(true);
            setInviteDetails(parsed.inviteDetails);
            setAccessCheckComplete(true);
            return;
          }
        } catch (e) {
        }
      }

      const urlParams = new URLSearchParams(searchParams);
      const inviteCodeFromUrl = urlParams.get("invite");
      const accessCodeFromUrl = urlParams.get("code");

      if (inviteCodeFromUrl || accessCodeFromUrl) {
        setIsValidatingAccess(true);
        try {
          const response = await fetch("/api/private-offerings/validate-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              offeringId: offering.id,
              inviteCode: inviteCodeFromUrl || undefined,
              accessCode: accessCodeFromUrl || undefined,
            }),
          });

          const result = await response.json();

          if (result.valid) {
            sessionStorage.setItem(`private_access_validated_${offering.id}`, JSON.stringify({
              validated: true,
              type: inviteCodeFromUrl ? "inviteCode" : "accessCode",
              inviteDetails: result.invite,
            }));
            setHasPrivateAccess(true);
            setInviteDetails(result.invite);
            toast({
              title: "Access Granted",
              description: "You now have access to this private offering.",
            });
          } else {
            toast({
              title: "Invalid Code",
              description: "The access link is invalid or expired. Please enter a valid code.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Validation Error",
            description: "Could not validate access. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsValidatingAccess(false);
        }
      }

      setAccessCheckComplete(true);
    };

    validateAccess();
  }, [id, searchParams, toast, property, offering, isLoadingProperty]);

  const isPrivateOffering = offering?.offeringType === "private";
  const needsAccessGate = isPrivateOffering && !hasPrivateAccess && accessCheckComplete;

  const handleAccessGranted = (accessType: "accessCode" | "inviteCode", invite?: any) => {
    if (!offering) return;
    sessionStorage.setItem(`private_access_validated_${offering.id}`, JSON.stringify({
      validated: true,
      type: accessType,
      inviteDetails: invite,
    }));
    setHasPrivateAccess(true);
    if (invite) {
      setInviteDetails(invite);
    }
  };

  const handlePurchase = (phaseId: string, tokenCount: number) => {
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      setSelectedPhase(phase);
      setPurchaseModalOpen(true);
    }
  };

  if (isLoadingProperty) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">Property Not Found</h1>
            <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const fundingGoal = property.fundingGoal ? parseFloat(property.fundingGoal) : 0;
  const fundingRaised = offering?.totalFundingRaised ? parseFloat(offering.totalFundingRaised) : 0;
  const totalTokens = offering?.totalSupply || 0;
  const tokensSold = offering?.tokensSold || 0;
  const fundingPercent = fundingGoal > 0 ? Math.round((fundingRaised / fundingGoal) * 100) : 0;
  const tokensSoldPercent = totalTokens > 0 ? Math.round((tokensSold / totalTokens) * 100) : 0;

  const activePhase = phases.find(p => p.isActive);
  const currentPrice = activePhase?.currentPrice || phases[0]?.currentPrice || 0;

  const phaseStatuses = phases.map(p => ({
    phase: p.phase,
    isActive: p.isActive,
    isCompleted: p.isCompleted,
    tokensSold: p.tokensSold,
    tokenAllocation: p.tokenAllocation,
    currentPrice: p.currentPrice,
  }));

  const communityBenefits = property.communityBenefits 
    ? (typeof property.communityBenefits === 'string' 
        ? JSON.parse(property.communityBenefits) 
        : property.communityBenefits)
    : [];

  if (isPrivateOffering && (!accessCheckComplete || isValidatingAccess)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (needsAccessGate && offering) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <PrivateAccessGate
            offeringId={offering.id}
            propertyName={property.name}
            onAccessGranted={handleAccessGranted}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative h-64 md:h-80 lg:h-96">
          <img
            src={property.imageUrl || riverfrontImage}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-chart-5 text-white">{property.propertyType || "Property"}</Badge>
                {activePhase && (
                  <Badge className="bg-chart-3 text-white">
                    {PHASE_CONFIG[activePhase.phase]?.name || activePhase.phase} Active
                  </Badge>
                )}
                {isPrivateOffering && (
                  <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                    <Lock className="h-3 w-3 mr-1" />
                    Private Offering
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {property.name}
              </h1>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{property.city}, {property.county} County, {property.state}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </p>
                </CardContent>
              </Card>

              {communityBenefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Community Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {communityBenefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-chart-3 shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Projected Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <Briefcase className="h-6 w-6 mx-auto mb-2 text-chart-1" />
                      <p className="text-2xl font-bold">{property.projectedJobs || 0}</p>
                      <p className="text-xs text-muted-foreground">Jobs Created</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <Home className="h-6 w-6 mx-auto mb-2 text-chart-3" />
                      <p className="text-2xl font-bold">{property.projectedHousingUnits || 0}</p>
                      <p className="text-xs text-muted-foreground">Housing Units</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-chart-4" />
                      <p className="text-2xl font-bold">{property.projectedROI || 0}%</p>
                      <p className="text-xs text-muted-foreground">Est. Annual ROI</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="phases">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="phases">Token Phases</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="phases" className="space-y-4 mt-4">
                  {phases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phases.map((phase) => (
                        <PhaseOfferingCard
                          key={phase.id}
                          phase={phase}
                          propertyName={property.name}
                          onPurchase={handlePurchase}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">
                          Token offering phases are not yet configured for this property.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground">
                        Legal documents, property surveys, and financial projections will be available 
                        upon request for verified investors.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="updates" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground">
                        Project updates will be posted here as the development progresses.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Raised</span>
                      <span className="font-semibold">
                        ${(fundingRaised / 1000000).toFixed(1)}M of ${(fundingGoal / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <Progress value={fundingPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">{fundingPercent}% funded</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tokens Sold</span>
                      <span className="font-semibold">
                        {tokensSold.toLocaleString()} / {totalTokens.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={tokensSoldPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">{tokensSoldPercent}% of tokens sold</p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Token Symbol</span>
                      <span className="font-mono font-semibold">{offering?.tokenSymbol || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Phase</span>
                      <Badge className="bg-chart-3 text-white">
                        {activePhase ? PHASE_CONFIG[activePhase.phase]?.name : "Upcoming"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="font-semibold text-chart-3">${currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {phases.length > 0 && (
                <TokenOfferingTimeline
                  phases={phaseStatuses}
                  propertyCounty={property.county}
                  propertyState={property.state}
                />
              )}

              {offering && (
                <FundingTimeline
                  offeringId={offering.id}
                  fundingGoal={fundingGoal}
                  fundingRaised={fundingRaised}
                  minimumThreshold={offering.minimumFundingThreshold ? parseFloat(offering.minimumFundingThreshold) : fundingGoal * 0.6}
                  deadline={offering.fundingDeadline ? new Date(offering.fundingDeadline) : new Date(Date.now() + 280 * 24 * 60 * 60 * 1000)}
                  startDate={offering.createdAt ? new Date(offering.createdAt) : new Date()}
                  currentPhase={activePhase?.phase || "county"}
                  status="in_progress"
                />
              )}

              <CapitalStackDisplay propertyId={property.id} />

              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-share">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-save">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {selectedPhase && offering && (
        <SimplePurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => {
            setPurchaseModalOpen(false);
            setSelectedPhase(null);
          }}
          propertyId={property.id}
          propertyName={property.name}
          tokenSymbol={offering.tokenSymbol}
          currentPhase={selectedPhase.phase}
          pricePerToken={selectedPhase.currentPrice}
          maxTokensPerPerson={selectedPhase.maxTokensPerPerson}
          userTokensPurchased={selectedPhase.userTokensPurchased || 0}
          user={user}
        />
      )}
    </div>
  );
}
