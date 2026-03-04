import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MapPin, Plus, ThumbsUp, Users, Vote, Building2, 
  Briefcase, Home, Heart, Leaf, GraduationCap, Baby,
  UtensilsCrossed, Palette, TreePine, Clock, CheckCircle,
  ChevronRight, Target, TrendingUp
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { GENERIC_PROPERTY_USES } from "@shared/schema";

interface PropertyNomination {
  id: string;
  propertyAddress: string;
  city: string;
  county: string;
  state: string;
  description: string;
  whyThisProperty: string;
  currentCondition?: string;
  estimatedSize?: string;
  status: string;
  nominationVotes: number;
  hasVoted: boolean;
}

interface UseProposal {
  id: string;
  nominationId: string;
  proposedUse: string;
  description: string;
  estimatedBudget?: string;
  estimatedJobs?: number;
  estimatedTimeline?: string;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  hasVoted: boolean;
}

interface CommunityNeed {
  id: string;
  category: string;
  need: string;
  description?: string;
  voteCount: number;
  hasVoted: boolean;
}

const nominations: PropertyNomination[] = [];

const useProposals: UseProposal[] = [];

const communityNeeds: CommunityNeed[] = [];

const categoryIcons: Record<string, any> = {
  Housing: Home,
  Jobs: Briefcase,
  Healthcare: Heart,
  Youth: Users,
  Food: UtensilsCrossed,
  Childcare: Baby,
  Community: Building2,
  Transportation: MapPin,
  Culture: Palette,
  Education: GraduationCap,
  Recreation: TreePine,
};

export default function Community() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("proposals");
  const [nominateDialogOpen, setNominateDialogOpen] = useState(false);
  const [proposeUseDialogOpen, setProposeUseDialogOpen] = useState(false);
  const [selectedNomination, setSelectedNomination] = useState<PropertyNomination | null>(null);
  const [selectedGenericUses, setSelectedGenericUses] = useState<string[]>([]);

  const userTokenHoldings = {
    hasTokens: false,
    totalTokens: 0,
    votingPower: 0,
    properties: [] as string[],
  };

  const handleVoteNomination = (nomination: PropertyNomination) => {
    toast({
      title: "Vote Recorded",
      description: `You voted to elect ${nomination.propertyAddress} for community development.`,
    });
  };

  const handleVoteProposal = (proposal: UseProposal, direction: boolean) => {
    toast({
      title: "Vote Recorded",
      description: `You voted ${direction ? "for" : "against"} the ${proposal.proposedUse} proposal.`,
    });
  };

  const handleVoteNeed = (need: CommunityNeed) => {
    toast({
      title: "Priority Recorded",
      description: `You marked "${need.need}" as a community priority.`,
    });
  };

  const handleNominateProperty = () => {
    setNominateDialogOpen(false);
    toast({
      title: "Property Nominated",
      description: "Your property nomination has been submitted for community review.",
    });
  };

  const handleProposeUse = () => {
    setProposeUseDialogOpen(false);
    toast({
      title: "Use Proposal Submitted",
      description: "Your proposed use has been submitted for community voting.",
    });
  };

  const openProposeDialog = (nomination: PropertyNomination) => {
    setSelectedNomination(nomination);
    setProposeUseDialogOpen(true);
  };

  const toggleGenericUse = (useId: string) => {
    setSelectedGenericUses(prev => 
      prev.includes(useId) ? prev.filter(id => id !== useId) : [...prev, useId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Community Hub</h1>
              <p className="text-muted-foreground">
                Nominate properties for development, vote on governance proposals, and shape your community.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/nominate">
                <Button className="flex items-center gap-2" data-testid="button-nominate-property">
                  <MapPin className="h-4 w-4" />
                  Nominate Property
                </Button>
              </Link>
            </div>
            <Dialog open={nominateDialogOpen} onOpenChange={setNominateDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nominate a Property</DialogTitle>
                  <DialogDescription>
                    Submit a property for community consideration. The community will vote on which properties to develop.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input id="address" placeholder="123 Main Street" data-testid="input-nomination-address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Canton" data-testid="input-nomination-city" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="county">County</Label>
                      <Input id="county" placeholder="Cherokee" data-testid="input-nomination-county" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Property Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the property..." 
                      rows={3}
                      data-testid="textarea-nomination-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="why">Why This Property?</Label>
                    <Textarea 
                      id="why" 
                      placeholder="Explain why this property should be developed by the community..."
                      rows={3}
                      data-testid="textarea-nomination-why"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="condition">Current Condition</Label>
                      <Input id="condition" placeholder="e.g., Vacant, Needs repair" data-testid="input-nomination-condition" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Estimated Size</Label>
                      <Input id="size" placeholder="e.g., 2 acres, 10,000 sq ft" data-testid="input-nomination-size" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNominateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleNominateProperty} data-testid="button-submit-nomination">Submit Nomination</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tokenized Properties</p>
                  <p className="text-xl font-semibold">{nominations.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Vote className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Proposals</p>
                  <p className="text-xl font-semibold">{useProposals.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Community Priorities</p>
                  <p className="text-xl font-semibold">{communityNeeds.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {userTokenHoldings.hasTokens ? (
            <Card className="mb-6 border-chart-3/30 bg-chart-3/5">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                      <Vote className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="font-medium">Your Voting Power: {userTokenHoldings.votingPower}</p>
                      <p className="text-sm text-muted-foreground">
                        Based on {userTokenHoldings.totalTokens} tokens in {userTokenHoldings.properties.length} property
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-chart-3 text-chart-3">
                    <CheckCircle className="h-3 w-3 mr-1" /> Eligible to Vote
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Vote className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400">Token Ownership Required</p>
                      <p className="text-sm text-muted-foreground">
                        Purchase tokens in any property to participate in community voting
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/properties">Browse Properties</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="proposals" data-testid="tab-proposals">Governance Proposals</TabsTrigger>
              <TabsTrigger value="needs" data-testid="tab-needs">Community Priorities</TabsTrigger>
            </TabsList>

            <TabsContent value="proposals">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Active Governance Proposals</h2>
                  <p className="text-sm text-muted-foreground">Vote on decisions for properties you own tokens in</p>
                </div>

                {nominations.filter(n => n.status === "in_voting").map((nomination) => {
                  const proposals = useProposals.filter(p => p.nominationId === nomination.id);
                  
                  return (
                    <Card key={nomination.id}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle>{nomination.propertyAddress}</CardTitle>
                            <CardDescription>{nomination.city}, {nomination.county} County</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          {proposals.length} proposed uses - vote for what you want this property to become:
                        </p>
                        
                        <div className="space-y-4">
                          {proposals.map((proposal) => {
                            const totalVotes = proposal.votesFor + proposal.votesAgainst;
                            const forPercent = totalVotes > 0 ? Math.round((proposal.votesFor / totalVotes) * 100) : 50;
                            
                            return (
                              <div key={proposal.id} className="p-4 rounded-md border bg-card">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div>
                                    <h4 className="font-medium">{proposal.proposedUse}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                                  {proposal.estimatedBudget && (
                                    <div>
                                      <span className="text-muted-foreground">Budget:</span>
                                      <span className="ml-1 font-medium">${(Number(proposal.estimatedBudget) / 1000000).toFixed(1)}M</span>
                                    </div>
                                  )}
                                  {proposal.estimatedJobs && (
                                    <div>
                                      <span className="text-muted-foreground">Jobs:</span>
                                      <span className="ml-1 font-medium">{proposal.estimatedJobs}</span>
                                    </div>
                                  )}
                                  {proposal.estimatedTimeline && (
                                    <div>
                                      <span className="text-muted-foreground">Timeline:</span>
                                      <span className="ml-1 font-medium">{proposal.estimatedTimeline}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-chart-3">For: {proposal.votesFor}</span>
                                    <span className="text-destructive">Against: {proposal.votesAgainst}</span>
                                  </div>
                                  <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                                    <div className="bg-chart-3" style={{ width: `${forPercent}%` }} />
                                    <div className="bg-destructive" style={{ width: `${100 - forPercent}%` }} />
                                  </div>
                                  <p className="text-xs text-muted-foreground text-center">
                                    {proposal.totalVoters} community members have voted
                                  </p>
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={proposal.hasVoted || !userTokenHoldings.hasTokens}
                                    onClick={() => handleVoteProposal(proposal, false)}
                                    data-testid={`button-vote-against-${proposal.id}`}
                                  >
                                    {!userTokenHoldings.hasTokens ? "Buy Tokens" : "Vote Against"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={proposal.hasVoted || !userTokenHoldings.hasTokens}
                                    onClick={() => handleVoteProposal(proposal, true)}
                                    data-testid={`button-vote-for-${proposal.id}`}
                                  >
                                    {!userTokenHoldings.hasTokens ? "Buy Tokens" : "Vote For"}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="needs">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Community Priorities</h2>
                  <p className="text-sm text-muted-foreground">Vote on what your community needs most</p>
                </div>

                <Card className="mb-6">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      These priorities come from community surveys and shape what properties should become. 
                      Vote for the needs most important to you and your neighbors.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communityNeeds.map((need, index) => {
                    const Icon = categoryIcons[need.category] || Building2;
                    const maxVotes = Math.max(...communityNeeds.map(n => n.voteCount));
                    const votePercent = Math.round((need.voteCount / maxVotes) * 100);
                    
                    return (
                      <Card key={need.id} className="relative overflow-visible">
                        <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <CardContent className="p-4 pl-8">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-medium">{need.need}</h4>
                                  <Badge variant="outline" className="text-xs">{need.category}</Badge>
                                </div>
                                {need.description && (
                                  <p className="text-sm text-muted-foreground mb-3">{need.description}</p>
                                )}
                                <div className="space-y-1">
                                  <Progress value={votePercent} className="h-2" />
                                  <p className="text-xs text-muted-foreground">{need.voteCount} community votes</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant={need.hasVoted ? "secondary" : "default"}
                              size="sm"
                              disabled={need.hasVoted || !userTokenHoldings.hasTokens}
                              onClick={() => handleVoteNeed(need)}
                              data-testid={`button-vote-need-${need.id}`}
                            >
                              {!userTokenHoldings.hasTokens ? "Buy Tokens" : need.hasVoted ? "Voted" : "This is Important"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Propose Use Dialog */}
        <Dialog open={proposeUseDialogOpen} onOpenChange={setProposeUseDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Propose a Use for {selectedNomination?.propertyAddress}</DialogTitle>
              <DialogDescription>
                Suggest what this property should become. You can select from common uses or describe a custom proposal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Select Common Uses (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {GENERIC_PROPERTY_USES.map((use) => (
                    <div
                      key={use.id}
                      className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedGenericUses.includes(use.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleGenericUse(use.id)}
                    >
                      <Checkbox
                        checked={selectedGenericUses.includes(use.id)}
                        onCheckedChange={() => toggleGenericUse(use.id)}
                        data-testid={`checkbox-use-${use.id}`}
                      />
                      <div>
                        <p className="text-sm font-medium">{use.label}</p>
                        <p className="text-xs text-muted-foreground">{use.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposedUse">Proposed Use Title</Label>
                <Input 
                  id="proposedUse" 
                  placeholder="e.g., Community Wellness Center with Affordable Housing"
                  data-testid="input-proposed-use-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useDescription">Describe Your Vision</Label>
                <Textarea
                  id="useDescription"
                  placeholder="Explain in detail what this property should become and how it would benefit the community..."
                  rows={4}
                  data-testid="textarea-use-description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Estimated Budget</Label>
                  <Input id="budget" type="number" placeholder="5000000" data-testid="input-use-budget" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobs">Estimated Jobs</Label>
                  <Input id="jobs" type="number" placeholder="50" data-testid="input-use-jobs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input id="timeline" placeholder="18-24 months" data-testid="input-use-timeline" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Which Community Needs Does This Address?</Label>
                <p className="text-xs text-muted-foreground mb-2">Select the community priorities this proposal would help address</p>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {communityNeeds.slice(0, 6).map((need) => (
                    <div key={need.id} className="flex items-center gap-2">
                      <Checkbox id={`need-${need.id}`} data-testid={`checkbox-need-${need.id}`} />
                      <Label htmlFor={`need-${need.id}`} className="text-sm font-normal cursor-pointer">
                        {need.need}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProposeUseDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleProposeUse} data-testid="button-submit-use-proposal">Submit Proposal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
