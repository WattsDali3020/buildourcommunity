import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhaseOfferingCard, type Phase } from "@/components/PhaseOfferingCard";
import { TokenOfferingTimeline } from "@/components/TokenOfferingTimeline";
import { FundingTimeline } from "@/components/FundingTimeline";
import { SimplePurchaseModal } from "@/components/SimplePurchaseModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, Building2, Users, TrendingUp, DollarSign, 
  FileText, Calendar, ExternalLink, Share2, Heart,
  Briefcase, Home, Leaf, CheckCircle
} from "lucide-react";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import riverfrontImage from "@assets/generated_images/riverfront_wellness_community_hub.png";
import { PHASE_CONFIG } from "@shared/schema";
import type { User } from "@shared/schema";

// todo: remove mock functionality
const mockProperty = {
  id: "etowah-wellness-village",
  name: "Etowah Riverfront Wellness Village",
  description: `The Etowah Riverfront Wellness Village is a transformative mixed-use development project 
  located along the scenic Etowah River in Canton, Georgia. This 15-acre site will be converted from 
  an abandoned industrial area into a vibrant community hub featuring affordable housing, wellness 
  facilities, retail spaces, and public riverfront access.
  
  The project aims to create a model for sustainable community development that prioritizes local 
  residents and small businesses while providing attractive returns for community investors.`,
  propertyType: "downtown",
  status: "live",
  streetAddress: "100 Riverfront Drive",
  city: "Canton",
  county: "Cherokee",
  state: "Georgia",
  zipCode: "30114",
  acreage: "15.0",
  estimatedValue: 8000000,
  fundingGoal: 10000000,
  fundingRaised: 4200000,
  totalTokens: 100000,
  tokensSold: 42000,
  projectedROI: 8.0,
  projectedJobs: 120,
  projectedHousingUnits: 50,
  communityBenefits: [
    "50+ affordable housing units",
    "120+ local jobs created",
    "Riverfront trail and park access",
    "Community wellness center",
    "Small business retail incubator",
    "Youth recreation programs",
  ],
  image: riverfrontImage,
  tokenSymbol: "ETOWAH",
  currentPhase: "county" as const,
};

const mockPhases: Phase[] = [
  {
    id: "phase-1",
    phase: "county",
    phaseName: "County Phase",
    description: "Cherokee County residents only",
    basePrice: 12.50,
    currentPrice: 12.50,
    priceMultiplier: 1.0,
    tokenAllocation: 25000,
    tokensSold: 18500,
    maxTokensPerPerson: 100,
    eligibilityCounty: "Cherokee",
    eligibilityState: "Georgia",
    isActive: true,
    isCompleted: false,
    isLocked: false,
    userEligible: true,
    userTokensPurchased: 25,
  },
  {
    id: "phase-2",
    phase: "state",
    phaseName: "State Phase",
    description: "Georgia residents",
    basePrice: 12.50,
    currentPrice: 18.75,
    priceMultiplier: 1.5,
    tokenAllocation: 25000,
    tokensSold: 0,
    maxTokensPerPerson: 250,
    eligibilityState: "Georgia",
    isActive: false,
    isCompleted: false,
    isLocked: true,
    userEligible: true,
    userTokensPurchased: 0,
  },
  {
    id: "phase-3",
    phase: "national",
    phaseName: "National Phase",
    description: "All US residents",
    basePrice: 12.50,
    currentPrice: 28.13,
    priceMultiplier: 2.25,
    tokenAllocation: 25000,
    tokensSold: 0,
    maxTokensPerPerson: 500,
    isActive: false,
    isCompleted: false,
    isLocked: true,
    userEligible: true,
    userTokensPurchased: 0,
  },
  {
    id: "phase-4",
    phase: "international",
    phaseName: "International Phase",
    description: "Global investors",
    basePrice: 12.50,
    currentPrice: 37.50,
    priceMultiplier: 3.0,
    tokenAllocation: 25000,
    tokensSold: 0,
    maxTokensPerPerson: 1000,
    isActive: false,
    isCompleted: false,
    isLocked: true,
    userEligible: true,
    userTokensPurchased: 0,
  },
];

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  const handlePurchase = (phaseId: string, tokenCount: number) => {
    const phase = mockPhases.find(p => p.id === phaseId);
    if (phase) {
      setSelectedPhase(phase);
      setPurchaseModalOpen(true);
    }
  };

  const fundingPercent = Math.round((mockProperty.fundingRaised / mockProperty.fundingGoal) * 100);
  const tokensSoldPercent = Math.round((mockProperty.tokensSold / mockProperty.totalTokens) * 100);

  const phaseStatuses = mockPhases.map(p => ({
    phase: p.phase,
    isActive: p.isActive,
    isCompleted: p.isCompleted,
    tokensSold: p.tokensSold,
    tokenAllocation: p.tokenAllocation,
    currentPrice: p.currentPrice,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative h-64 md:h-80 lg:h-96">
          <img
            src={mockProperty.image}
            alt={mockProperty.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-chart-5 text-white">Downtown</Badge>
                <Badge className="bg-chart-3 text-white">Phase 1 Active</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {mockProperty.name}
              </h1>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{mockProperty.city}, {mockProperty.county} County, {mockProperty.state}</span>
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
                    {mockProperty.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mockProperty.communityBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-chart-3 shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projected Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <Briefcase className="h-6 w-6 mx-auto mb-2 text-chart-1" />
                      <p className="text-2xl font-bold">{mockProperty.projectedJobs}</p>
                      <p className="text-xs text-muted-foreground">Jobs Created</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <Home className="h-6 w-6 mx-auto mb-2 text-chart-3" />
                      <p className="text-2xl font-bold">{mockProperty.projectedHousingUnits}</p>
                      <p className="text-xs text-muted-foreground">Housing Units</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-chart-4" />
                      <p className="text-2xl font-bold">{mockProperty.projectedROI}%</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockPhases.map((phase) => (
                      <PhaseOfferingCard
                        key={phase.id}
                        phase={phase}
                        propertyName={mockProperty.name}
                        onPurchase={handlePurchase}
                      />
                    ))}
                  </div>
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
                      <span className="font-semibold">${(mockProperty.fundingRaised / 1000000).toFixed(1)}M of ${(mockProperty.fundingGoal / 1000000).toFixed(1)}M</span>
                    </div>
                    <Progress value={fundingPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">{fundingPercent}% funded</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tokens Sold</span>
                      <span className="font-semibold">{mockProperty.tokensSold.toLocaleString()} / {mockProperty.totalTokens.toLocaleString()}</span>
                    </div>
                    <Progress value={tokensSoldPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">{tokensSoldPercent}% of tokens sold</p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Token Symbol</span>
                      <span className="font-mono font-semibold">{mockProperty.tokenSymbol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Phase</span>
                      <Badge className="bg-chart-3 text-white">County</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="font-semibold text-chart-3">$12.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <TokenOfferingTimeline
                phases={phaseStatuses}
                propertyCounty={mockProperty.county}
                propertyState={mockProperty.state}
              />

              <FundingTimeline
                offeringId={mockProperty.id}
                fundingGoal={mockProperty.fundingGoal}
                fundingRaised={mockProperty.fundingRaised}
                minimumThreshold={mockProperty.fundingGoal * 0.6}
                deadline={new Date(Date.now() + 280 * 24 * 60 * 60 * 1000)}
                startDate={new Date(Date.now() - 85 * 24 * 60 * 60 * 1000)}
                currentPhase={mockProperty.currentPhase}
                status="in_progress"
                userHoldings={{
                  tokenCount: 25,
                  investedAmount: 312.50,
                  purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                }}
              />

              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
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

      {selectedPhase && (
        <SimplePurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => {
            setPurchaseModalOpen(false);
            setSelectedPhase(null);
          }}
          propertyId={mockProperty.id}
          propertyName={mockProperty.name}
          tokenSymbol={mockProperty.tokenSymbol}
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
