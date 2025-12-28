import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProposalCard, type Proposal } from "@/components/ProposalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Vote, Wallet, MapPin, Flag, Globe, Info, ShieldCheck, ArrowRight, FileText, CheckCircle2, Clock, MessageSquare, ThumbsUp, ThumbsDown, Zap, Calendar, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Proposal as ProposalType, TokenHolding } from "@shared/schema";

// Fallback mock data when API returns empty
const mockProposals: Proposal[] = [
  {
    id: "prop-1",
    title: "Add EV Charging Stations to Wellness Village",
    description: "Proposal to allocate $150,000 from the community treasury to install 8 Level 2 EV charging stations at the Etowah Wellness Village parking area.",
    propertyName: "Etowah Wellness Village",
    status: "active",
    votesFor: 45000,
    votesAgainst: 12000,
    totalVoters: 234,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    proposer: "0x1234...5678",
  },
  {
    id: "prop-2",
    title: "Expand Historic Mill Co-Working Space",
    description: "Convert the unused third floor of the Historic Mill into additional co-working space with 50 new desks and 4 meeting rooms.",
    propertyName: "Historic Mill",
    status: "active",
    votesFor: 32000,
    votesAgainst: 28000,
    totalVoters: 189,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    proposer: "0xabcd...efgh",
  },
  {
    id: "prop-3",
    title: "Community Solar Panel Installation",
    description: "Install 200kW solar array on Main Street District buildings to reduce energy costs and provide green energy credits to token holders.",
    propertyName: "Main Street District",
    status: "passed",
    votesFor: 89000,
    votesAgainst: 15000,
    totalVoters: 412,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    proposer: "0x9876...5432",
  },
  {
    id: "prop-4",
    title: "Quarterly Dividend Increase",
    description: "Increase quarterly dividend distribution from 60% to 70% of net operating income across all properties.",
    propertyName: "All Properties",
    status: "rejected",
    votesFor: 35000,
    votesAgainst: 65000,
    totalVoters: 356,
    deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    proposer: "0xijkl...mnop",
  },
];

export default function Governance() {
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();

  const { data: apiProposals = [] } = useQuery<ProposalType[]>({
    queryKey: ["/api/proposals"],
  });

  const { data: holdings = [] } = useQuery<TokenHolding[]>({
    queryKey: ["/api/user/holdings"],
  });

  const totalVotingPower = holdings.reduce((sum, h) => sum + (h.votingPower || 0), 0);

  const proposals: Proposal[] = apiProposals.length > 0
    ? apiProposals.map((p) => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description || "",
        propertyName: "Community Property",
        status: p.status as "active" | "passed" | "rejected",
        votesFor: p.votesFor || 0,
        votesAgainst: p.votesAgainst || 0,
        totalVoters: p.totalVoters || 0,
        deadline: p.endsAt ? new Date(p.endsAt) : new Date(),
        proposer: p.proposerId || "Community",
      }))
    : mockProposals;

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "passed") return p.status === "passed";
    if (activeTab === "rejected") return p.status === "rejected";
    return true;
  });

  const activeCount = proposals.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Community Governance</h1>
              <p className="text-muted-foreground">
                Vote on proposals and shape the future of your community properties
              </p>
            </div>
            <Button className="flex items-center gap-2" data-testid="button-create-proposal">
              <Plus className="h-4 w-4" />
              Create Proposal
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Voting Power</p>
                  <p className="text-xl font-semibold" data-testid="text-voting-power">{totalVotingPower} Votes</p>
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
                  <p className="text-xl font-semibold">{activeCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Voters</p>
                  <p className="text-xl font-semibold">1,247</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Vote className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">How Governance Works</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                RevitaHub uses a Decentralized Autonomous Organization (DAO) model where token holders make all major property decisions. Here's the complete voting process:
              </p>
              
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex flex-col items-center text-center p-4 rounded-md bg-muted/50">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="mb-2">Step 1</Badge>
                    <h4 className="font-medium text-sm mb-1">Proposal Created</h4>
                    <p className="text-xs text-muted-foreground">Any token holder submits a proposal for review</p>
                  </div>
                  
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="md:hidden flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 rounded-md bg-muted/50">
                    <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center mb-3">
                      <Clock className="h-6 w-6 text-chart-3" />
                    </div>
                    <Badge variant="outline" className="mb-2">Step 2</Badge>
                    <h4 className="font-medium text-sm mb-1">Voting Period</h4>
                    <p className="text-xs text-muted-foreground">7-day window for token holders to vote</p>
                  </div>
                  
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="md:hidden flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 rounded-md bg-muted/50">
                    <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center mb-3">
                      <Zap className="h-6 w-6 text-chart-1" />
                    </div>
                    <Badge variant="outline" className="mb-2">Step 3</Badge>
                    <h4 className="font-medium text-sm mb-1">Execution</h4>
                    <p className="text-xs text-muted-foreground">Approved proposals are implemented</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    What You Can Vote On
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Property development plans (housing, commercial, green space)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Contractor and vendor selection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Community benefit allocations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Dividend distribution percentages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Property sale decisions</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Voting Timeline
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground w-24">Day 1:</span>
                      <span>Proposal submitted and published</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground w-24">Days 1-7:</span>
                      <span>Voting open - cast your vote anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground w-24">Day 7:</span>
                      <span>Voting closes, results tallied</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground w-24">Day 8+:</span>
                      <span>Approved proposals begin implementation</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-3 rounded-md bg-primary/5 border border-primary/20 flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">All votes are on-chain:</span> Every vote is recorded on the blockchain for complete transparency. 
                  You can verify any voting outcome independently.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Community-First Voting Power</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Early investors from local communities have greater governance power. Voting power is weighted 
                based on the phase in which tokens were purchased, ensuring local voices are prioritized.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-md bg-chart-3/10 border border-chart-3/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-chart-3" />
                    <span className="text-sm font-medium">County Phase</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-3">1.5x</p>
                  <p className="text-xs text-muted-foreground">Voting multiplier</p>
                </div>
                <div className="p-3 rounded-md bg-chart-1/10 border border-chart-1/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-4 w-4 text-chart-1" />
                    <span className="text-sm font-medium">State Phase</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-1">1.25x</p>
                  <p className="text-xs text-muted-foreground">Voting multiplier</p>
                </div>
                <div className="p-3 rounded-md bg-chart-4/10 border border-chart-4/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-chart-4" />
                    <span className="text-sm font-medium">National Phase</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-4">1.0x</p>
                  <p className="text-xs text-muted-foreground">Voting multiplier</p>
                </div>
                <div className="p-3 rounded-md bg-muted border">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">International</span>
                  </div>
                  <p className="text-2xl font-bold">0.75x</p>
                  <p className="text-xs text-muted-foreground">Voting multiplier</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20 flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Example:</span> A County Phase investor with 50 tokens has 75 voting power (50 x 1.5x), 
                  while an International Phase investor with 100 tokens has 75 voting power (100 x 0.75x). 
                  This ensures local community members maintain governance influence even against larger external investors.
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
              <TabsTrigger value="passed" data-testid="tab-passed">Passed</TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>

          {filteredProposals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No proposals found in this category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
