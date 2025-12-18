import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProposalCard, type Proposal } from "@/components/ProposalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Vote, Wallet, MapPin, Flag, Globe, Info, ShieldCheck } from "lucide-react";
import { useState } from "react";

// todo: remove mock functionality
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

  const filteredProposals = mockProposals.filter((p) => {
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "passed") return p.status === "passed";
    if (activeTab === "rejected") return p.status === "rejected";
    return true;
  });

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
                  <p className="text-xl font-semibold" data-testid="text-voting-power">142 Votes</p>
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
                  <p className="text-xl font-semibold">{mockProposals.filter(p => p.status === "active").length}</p>
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
