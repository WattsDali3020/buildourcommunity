import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconTray, type IconTrayItem } from "@/components/IconTray";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, PieChart, Vote, Coins, History, TrendingUp,
  ArrowRight, Building2, Lock, DollarSign
} from "lucide-react";
import { Link } from "wouter";
import type { TokenHolding, Proposal as ProposalType } from "@shared/schema";

const iconTrayItems: IconTrayItem[] = [
  { id: "portfolio", label: "Portfolio", icon: PieChart },
  { id: "proposals", label: "Proposals", icon: Vote },
  { id: "buy-tokens", label: "Buy Tokens", icon: Coins },
  { id: "history", label: "Tx History", icon: History },
];

function PortfolioSection() {
  const { data: holdings = [] } = useQuery<TokenHolding[]>({
    queryKey: ["/api/user/holdings"],
  });

  if (holdings.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Portfolio Positions</h3>
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h4 className="font-medium mb-2">No Positions Yet</h4>
          <p className="text-muted-foreground text-sm mb-4">Purchase tokens in a property to start building your portfolio.</p>
          <Link href="/properties">
            <Button data-testid="button-browse-properties"><ArrowRight className="mr-2 h-4 w-4" />Browse Properties</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Portfolio Positions</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {holdings.map(holding => (
          <Card key={holding.id} className="p-4" data-testid={`card-holding-${holding.id}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Offering #{holding.offeringId}</h4>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tokens</p>
                <p className="font-semibold">{holding.tokenCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Voting Power</p>
                <p className="font-semibold">{holding.votingPower}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProposalsSection() {
  const { data: proposals = [] } = useQuery<ProposalType[]>({
    queryKey: ["/api/proposals"],
  });

  const activeProposals = proposals.filter(p => p.status === "active");

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Active Proposals</h3>
      {activeProposals.length === 0 ? (
        <Card className="p-8 text-center">
          <Vote className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h4 className="font-medium mb-2">No Active Proposals</h4>
          <p className="text-muted-foreground text-sm">There are no proposals currently open for voting.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeProposals.map(proposal => (
            <Card key={proposal.id} className="p-4" data-testid={`card-proposal-${proposal.id}`}>
              <h4 className="font-semibold text-sm mb-2">{proposal.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{proposal.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">For: {proposal.votesFor} | Against: {proposal.votesAgainst}</span>
                <Badge variant="outline">{proposal.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BuyTokensSection() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Buy Tokens</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2"><Coins className="h-5 w-5 text-primary" />How Token Purchasing Works</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="font-bold text-primary">1.</span>Browse available properties and select one to invest in</li>
            <li className="flex items-start gap-2"><span className="font-bold text-primary">2.</span>Choose the number of tokens (starting at $12.50 each)</li>
            <li className="flex items-start gap-2"><span className="font-bold text-primary">3.</span>Complete purchase with your connected wallet</li>
            <li className="flex items-start gap-2"><span className="font-bold text-primary">4.</span>Receive voting power and dividend eligibility</li>
          </ul>
        </Card>
        <Card className="p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-5 w-5 text-chart-3" />4-Phase Pricing</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span>County Phase</span><span className="font-semibold">$12.50</span></div>
            <div className="flex justify-between text-sm"><span>State Phase</span><span className="font-semibold">$18.75</span></div>
            <div className="flex justify-between text-sm"><span>National Phase</span><span className="font-semibold">$28.13</span></div>
            <div className="flex justify-between text-sm"><span>International Phase</span><span className="font-semibold">$37.50</span></div>
          </div>
        </Card>
      </div>
      <div className="text-center">
        <Link href="/properties">
          <Button size="lg" data-testid="button-browse-to-buy"><ArrowRight className="mr-2 h-4 w-4" />Browse Properties to Invest</Button>
        </Link>
      </div>
    </div>
  );
}

function TxHistorySection() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Transaction History</h3>
      <Card className="p-8 text-center">
        <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h4 className="font-medium mb-2">No Transactions Yet</h4>
        <p className="text-muted-foreground text-sm">Your transaction history will appear here once you make your first investment.</p>
      </Card>
    </div>
  );
}

export default function Invest() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const walletConnected = false;

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && iconTrayItems.some(item => item.id === hash)) {
      setActiveSection(hash);
    }
  }, []);

  const handleSelect = (id: string) => {
    setActiveSection(id || null);
    if (id) window.history.replaceState(null, "", `/invest#${id}`);
    else window.history.replaceState(null, "", "/invest");
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2" data-testid="text-invest-title">Invest</h1>
              <p className="text-muted-foreground">Manage your portfolio, vote on proposals, and track your investments.</p>
            </div>

            <Card className="max-w-lg mx-auto p-8 text-center">
              <Lock className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
              <h2 className="text-xl font-semibold mb-3">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to access your investment portfolio, vote on governance proposals, and manage your token holdings.
              </p>
              <div className="space-y-3">
                <Button size="lg" className="w-full" data-testid="button-connect-wallet">
                  <Wallet className="mr-2 h-5 w-5" />Connect Wallet
                </Button>
                <Link href="/properties">
                  <Button variant="outline" size="lg" className="w-full" data-testid="button-explore-first">
                    <Building2 className="mr-2 h-5 w-5" />Explore Properties First
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-invest-title">Invest</h1>
            <p className="text-muted-foreground">Manage your portfolio, vote on proposals, and track your investments.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-xl font-semibold" data-testid="text-portfolio-value">$0.00</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Returns</p>
                  <p className="text-xl font-semibold" data-testid="text-total-returns">$0.00</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <Vote className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voting Power</p>
                  <p className="text-xl font-semibold" data-testid="text-voting-power">0</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mb-8 flex-wrap">
            <Link href="/properties"><Button data-testid="button-buy-tokens"><Coins className="mr-2 h-4 w-4" />Buy Tokens</Button></Link>
            <Link href="/governance"><Button variant="outline" data-testid="button-vote"><Vote className="mr-2 h-4 w-4" />Vote</Button></Link>
          </div>

          <IconTray items={iconTrayItems} activeId={activeSection} onSelect={handleSelect} className="mb-2" />

          <ExpandableSection id="portfolio" isOpen={activeSection === "portfolio"}>
            <PortfolioSection />
          </ExpandableSection>

          <ExpandableSection id="proposals" isOpen={activeSection === "proposals"}>
            <ProposalsSection />
          </ExpandableSection>

          <ExpandableSection id="buy-tokens" isOpen={activeSection === "buy-tokens"}>
            <BuyTokensSection />
          </ExpandableSection>

          <ExpandableSection id="history" isOpen={activeSection === "history"}>
            <TxHistorySection />
          </ExpandableSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
