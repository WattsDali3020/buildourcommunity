import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Code, 
  Building2, 
  Shield, 
  Link2,
  Download,
  ExternalLink,
  Lock,
  CheckCircle2,
  Database,
  Globe,
  Coins
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function BusinessLayer() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Business Documentation</h1>
            <p className="text-muted-foreground mb-8">
              Access detailed technical documentation, smart contract code, 
              and institutional investor materials.
            </p>
            <Button size="lg" asChild>
              <a href="/api/login">Sign In to Access</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold" data-testid="page-title">Business Layer</h1>
                <Badge variant="secondary">Institutional Access</Badge>
              </div>
              <p className="text-muted-foreground">
                Technical documentation for partners, investors, and developers
              </p>
            </div>
          </div>

          <Tabs defaultValue="technical" className="space-y-8">
            <TabsList>
              <TabsTrigger value="technical" data-testid="tab-technical">Technical Docs</TabsTrigger>
              <TabsTrigger value="contracts" data-testid="tab-contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="partners" data-testid="tab-partners">Partner Integrations</TabsTrigger>
              <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="technical" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Full Technical Litepaper
                    </CardTitle>
                    <CardDescription>
                      Complete technical specification with smart contract architecture
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        100M RVTA tokenomics with vesting schedules
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        ERC-1155 property token architecture
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        AI governance integration specifications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        Chainlink oracle integration details
                      </li>
                    </ul>
                    <Button asChild data-testid="button-view-litepaper">
                      <a href="/litepaper">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Litepaper
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-chart-2" />
                      API Documentation
                    </CardTitle>
                    <CardDescription>
                      RESTful API endpoints for property data and governance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-md mb-4">
                      <pre className="text-xs overflow-x-auto">
{`GET /api/properties
GET /api/properties/:id
GET /api/offerings/:propertyId
POST /api/purchase
POST /api/proposals/:id/vote
GET /api/holdings`}
                      </pre>
                    </div>
                    <Button variant="outline" data-testid="button-api-docs">
                      <Code className="h-4 w-4 mr-2" />
                      Full API Reference
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Architecture Overview</CardTitle>
                  <CardDescription>
                    Hybrid on-chain/off-chain architecture for regulatory compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary" />
                        On-Chain Layer
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>ERC-1155 Property Tokens</li>
                        <li>GovernanceDAO Contracts</li>
                        <li>FundingEscrow (USDC)</li>
                        <li>Dividend Distribution</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-chart-2/5 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-chart-2" />
                        Oracle Layer
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>Chainlink Data Feeds</li>
                        <li>Proof of Reserve</li>
                        <li>CCIP Cross-Chain</li>
                        <li>Automation Keepers</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-chart-3/5 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-chart-3" />
                        Off-Chain Layer
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>PostgreSQL Metadata</li>
                        <li>KYC/AML Verification</li>
                        <li>AI Governance Engine</li>
                        <li>RESTful API Gateway</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    GovernanceDAO.sol
                  </CardTitle>
                  <CardDescription>
                    Token-weighted voting with phase multipliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-x-auto">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";

contract GovernanceDAO is Governor {
    mapping(address => uint256) public phaseMultipliers;
    
    // Phase multipliers: County=150, State=125, National=100, International=75
    function getVotingPower(address voter) public view returns (uint256) {
        uint256 tokens = balanceOf(voter);
        uint256 multiplier = phaseMultipliers[voter];
        return (tokens * multiplier) / 100;
    }
    
    function castVote(uint256 proposalId, bool support) external {
        require(proposals[proposalId].deadline > block.timestamp, "Voting ended");
        uint256 votingPower = getVotingPower(msg.sender);
        
        if (support) {
            proposals[proposalId].forVotes += votingPower;
        } else {
            proposals[proposalId].againstVotes += votingPower;
        }
        emit VoteCast(msg.sender, proposalId, support, votingPower);
    }
    
    // AI bias detection hook
    function checkVotingBias(uint256 proposalId) external view returns (uint256) {
        Proposal storage p = proposals[proposalId];
        uint256 total = p.forVotes + p.againstVotes;
        if (total == 0) return 50; // Neutral
        return (p.forVotes * 100) / total;
    }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-chart-2" />
                    FundingEscrow.sol
                  </CardTitle>
                  <CardDescription>
                    USDC escrow with 3% APR refund protection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-x-auto">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FundingEscrow {
    IERC20 public immutable USDC;
    uint256 public constant APR = 3; // 3% annual
    uint256 public constant FUNDING_PERIOD = 365 days;
    
    struct Investment {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(uint256 => mapping(address => Investment)) public investments;
    mapping(uint256 => uint256) public totalFunding;
    mapping(uint256 => uint256) public fundingTarget;
    mapping(uint256 => uint256) public deadline;
    
    function invest(uint256 propertyId, uint256 amount) external {
        require(block.timestamp < deadline[propertyId], "Funding closed");
        require(USDC.transferFrom(msg.sender, address(this), amount));
        
        investments[propertyId][msg.sender].amount += amount;
        investments[propertyId][msg.sender].timestamp = block.timestamp;
        totalFunding[propertyId] += amount;
        
        if (totalFunding[propertyId] >= fundingTarget[propertyId]) {
            _releaseFunds(propertyId);
        }
        emit Investment(msg.sender, propertyId, amount);
    }
    
    function claimRefund(uint256 propertyId) external {
        require(block.timestamp > deadline[propertyId], "Funding still active");
        require(totalFunding[propertyId] < fundingTarget[propertyId], "Fully funded");
        
        Investment storage inv = investments[propertyId][msg.sender];
        uint256 principal = inv.amount;
        uint256 daysHeld = (block.timestamp - inv.timestamp) / 1 days;
        uint256 interest = (principal * APR * daysHeld) / 36500;
        
        inv.amount = 0;
        USDC.transfer(msg.sender, principal + interest);
        emit Refund(msg.sender, propertyId, principal, interest);
    }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-primary" />
                      Chainlink Build Program
                    </CardTitle>
                    <CardDescription>
                      Oracle infrastructure and ecosystem participation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <span className="text-sm">Token Allocation</span>
                        <Badge>3% RVTA Supply</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <span className="text-sm">Network Fee Share</span>
                        <Badge>10% Revenue</Badge>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Services Used:</p>
                        <ul className="space-y-1">
                          <li>Data Feeds - Property valuations</li>
                          <li>Proof of Reserve - Asset verification</li>
                          <li>Automation - Dividend distribution</li>
                          <li>CCIP - Cross-chain governance</li>
                          <li>Functions - Off-chain data access</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-chart-2" />
                      Canton Network
                    </CardTitle>
                    <CardDescription>
                      Institutional-grade privacy for enterprise partners
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium mb-2">Privacy Features</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>Daml contracts for confidential workflows</li>
                          <li>Global Synchronizer for atomic settlements</li>
                          <li>Selective data disclosure for audits</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium mb-2">Use Cases</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>Institutional investor onboarding</li>
                          <li>Cross-network dividend distribution</li>
                          <li>Confidential property appraisals</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Republic Crypto Integration</CardTitle>
                  <CardDescription>
                    Regulation CF crowdfunding and investor access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-md text-center">
                      <p className="text-2xl font-bold text-primary">$5M</p>
                      <p className="text-xs text-muted-foreground">Annual Reg CF Limit</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-md text-center">
                      <p className="text-2xl font-bold text-primary">2M+</p>
                      <p className="text-xs text-muted-foreground">Investor Network</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-md text-center">
                      <p className="text-2xl font-bold text-primary">SEC</p>
                      <p className="text-xs text-muted-foreground">Compliant Platform</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-chart-3" />
                    Regulatory Framework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Regulation D (506c)</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Accredited investors with general solicitation
                      </p>
                      <Badge variant="outline">No Investment Limit</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Regulation A+ (Tier 2)</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Non-accredited investors welcome
                      </p>
                      <Badge variant="outline">$75M Annual</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Regulation CF</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Crowdfunding via Republic Crypto
                      </p>
                      <Badge variant="outline">$5M Annual</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>KYC/AML Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3" />
                      <span>Government-issued ID verification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3" />
                      <span>Address verification (determines phase eligibility)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3" />
                      <span>Accreditation verification (for Reg D)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3" />
                      <span>OFAC sanctions screening</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3" />
                      <span>Whitelist-only token transfers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
