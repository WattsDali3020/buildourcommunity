import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProposalCard, type Proposal } from "@/components/ProposalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Vote, Wallet } from "lucide-react";
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
                  <p className="text-xl font-semibold">142 Tokens</p>
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
