import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Settings,
  Coins,
  Rocket,
  Target,
  Wallet,
  Send,
  Link2,
  BarChart3,
  ArrowLeftRight,
  FileText,
  RefreshCw,
  AlertTriangle,
  Flame,
  Shield,
  Users,
  Building2,
  Clock,
  DollarSign,
} from "lucide-react";

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  color: string;
}

function ProcessStep({ number, title, description, icon, details, color }: ProcessStepProps) {
  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-md ${color} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">Step {number}</Badge>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-3">{description}</p>
          <ul className="space-y-2">
            {details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ 
  phase, 
  title, 
  description, 
  steps, 
  color 
}: { 
  phase: string; 
  title: string; 
  description: string; 
  steps: ProcessStepProps[];
  color: string;
}) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge className={color}>{phase}</Badge>
          <CardTitle>{title}</CardTitle>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={idx}>
              <ProcessStep {...step} />
              {idx < steps.length - 1 && (
                <div className="ml-6 mt-4 mb-4 h-8 border-l-2 border-dashed border-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TokenizationProcess() {
  const primaryPhaseSteps: ProcessStepProps[] = [
    {
      number: 1,
      title: "Evaluate",
      description: "Property eligibility and valuation assessment",
      icon: <FileSearch className="h-6 w-6 text-white" />,
      color: "bg-primary",
      details: [
        "Property nomination submitted by community member or owner",
        "Eligibility check: vacant land, historic buildings, commercial, residential, or mixed-use",
        "Title verification and ownership confirmation via county records",
        "Chainlink oracles fetch independent property valuation data",
        "Environmental and zoning compliance review",
      ],
    },
    {
      number: 2,
      title: "Configure",
      description: "Legal structure and token parameters setup",
      icon: <Settings className="h-6 w-6 text-white" />,
      color: "bg-primary",
      details: [
        "Create property-holding LLC or trust structure",
        "Define token parameters: total supply based on property value",
        "Set phase pricing: $12.50 (County) to $37.50 (International)",
        "Configure per-person token limits per phase (100 tokens in Phase 1)",
        "Establish 1-year funding deadline and 100% funding requirement",
      ],
    },
    {
      number: 3,
      title: "Tokenize",
      description: "Smart contract deployment and token creation",
      icon: <Coins className="h-6 w-6 text-white" />,
      color: "bg-primary",
      details: [
        "Deploy ERC-1155 multi-token contract with ERC-1400 security extensions",
        "Implement transfer restrictions for KYC/AML compliance",
        "Configure dividend distribution mechanisms",
        "Set up governance voting power multipliers by phase",
        "Smart contract security audit by third-party firm",
      ],
    },
    {
      number: 4,
      title: "Launch",
      description: "4-phase community-first token offering",
      icon: <Rocket className="h-6 w-6 text-white" />,
      color: "bg-primary",
      details: [
        "Phase 1 (County): Local residents at $12.50/token, 100 tokens/person limit",
        "Phase 2 (State): State residents at $18.75/token, 250 tokens/person limit",
        "Phase 3 (National): US investors at $28.13/token, 500 tokens/person limit",
        "Phase 4 (International): Global at $37.50/token, 1000 tokens/person limit",
        "Voting power multipliers: County 1.5x, State 1.25x, National 1.0x, International 0.75x",
      ],
    },
    {
      number: 5,
      title: "Close",
      description: "Funding completion or deadline reached",
      icon: <Target className="h-6 w-6 text-white" />,
      color: "bg-primary",
      details: [
        "100% funding target must be reached for property acquisition",
        "If target met: proceed to property purchase and development",
        "If target not met: trigger investor protection refund process",
        "All investments held in USDC escrow during funding period",
        "Final token allocation confirmed and locked",
      ],
    },
    {
      number: 6,
      title: "Intake",
      description: "Fund collection and escrow management",
      icon: <Wallet className="h-6 w-6 text-white" />,
      color: "bg-primary",
      details: [
        "USDC payments collected via Stripe and crypto wallets",
        "Funds held in smart contract escrow with multi-sig security",
        "3% APR accrues on all deposits from day one",
        "Real-time funding progress displayed on property page",
        "Chainlink Automation monitors funding milestones",
      ],
    },
    {
      number: 7,
      title: "Issue",
      description: "Token distribution to investors",
      icon: <Send className="h-6 w-6 text-white" />,
      color: "bg-primary",
      details: [
        "Upon successful funding: tokens minted to investor wallets",
        "Voting power assigned based on purchase phase",
        "Investors added to property DAO governance",
        "Welcome email with portfolio access and next steps",
        "Property acquisition process initiated",
      ],
    },
  ];

  const secondaryPhaseSteps: ProcessStepProps[] = [
    {
      number: 8,
      title: "Connect",
      description: "Wallet and exchange integrations",
      icon: <Link2 className="h-6 w-6 text-white" />,
      color: "bg-chart-3",
      details: [
        "Tokens visible in connected wallets (MetaMask, Coinbase Wallet, etc.)",
        "Integration with compliant secondary trading platforms",
        "Partnership with Republic and Canton Network for liquidity",
        "Cross-chain bridge support via Chainlink CCIP",
      ],
    },
    {
      number: 9,
      title: "List",
      description: "Enable secondary market trading",
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      color: "bg-chart-3",
      details: [
        "Tokens listed on compliant security token exchanges",
        "Order book and peer-to-peer trading enabled",
        "Price discovery through market mechanisms",
        "All trades subject to KYC verification",
      ],
    },
    {
      number: 10,
      title: "Trade",
      description: "Token transfers between verified investors",
      icon: <ArrowLeftRight className="h-6 w-6 text-white" />,
      color: "bg-chart-3",
      details: [
        "Investor-to-investor transfers with compliance checks",
        "60%+ early exit option via share transfer if funding fails",
        "Automated tax documentation (1099-DIV, K-1)",
        "Transaction history and portfolio tracking",
      ],
    },
    {
      number: 11,
      title: "Manage",
      description: "Ongoing property governance",
      icon: <Users className="h-6 w-6 text-white" />,
      color: "bg-chart-3",
      details: [
        "DAO governance for all property decisions",
        "Proposal creation and token-weighted voting",
        "Development planning, contractor selection, community benefits",
        "Phase-based voting multipliers ensure local voice",
      ],
    },
    {
      number: 12,
      title: "Report",
      description: "Financial reporting and dividend distribution",
      icon: <FileText className="h-6 w-6 text-white" />,
      color: "bg-chart-3",
      details: [
        "Quarterly financial reports and property updates",
        "Chainlink Automation triggers dividend calculations",
        "Automated USDC dividend distribution to token holders",
        "Annual property revaluations via Chainlink oracles",
      ],
    },
  ];

  const dispositionPhaseSteps: ProcessStepProps[] = [
    {
      number: 13,
      title: "Delist",
      description: "Property sale or wind-down initiation",
      icon: <AlertTriangle className="h-6 w-6 text-white" />,
      color: "bg-chart-1",
      details: [
        "DAO votes to sell property or wind down investment",
        "Property listed for sale through traditional channels",
        "Tokens suspended from secondary trading",
        "Final valuation and sale proceeds calculated",
      ],
    },
    {
      number: 14,
      title: "Burn",
      description: "Token redemption and proceeds distribution",
      icon: <Flame className="h-6 w-6 text-white" />,
      color: "bg-chart-1",
      details: [
        "Sale proceeds distributed proportionally to token holders",
        "Tokens burned (permanently removed) after redemption",
        "Final tax documentation issued",
        "Property LLC dissolved and records archived",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <Badge variant="outline" className="mb-4">Complete Lifecycle</Badge>
            <h1 className="text-4xl font-bold mb-4" data-testid="tokenization-title">
              Tokenization Process
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              From property nomination to token distribution and beyond - a complete guide to how RevitaHub transforms real estate into community-owned digital assets.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/properties">
                <Button data-testid="button-hero-browse-properties">
                  <Building2 className="mr-2 h-4 w-4" />
                  Browse Properties
                </Button>
              </Link>
              <Link href="/nominate">
                <Button variant="outline" data-testid="button-hero-nominate-property">
                  Nominate a Property
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">1 Year</p>
                <p className="text-sm text-muted-foreground">Funding Timeline</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">$12.50</p>
                <p className="text-sm text-muted-foreground">Minimum Investment</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">3% APR</p>
                <p className="text-sm text-muted-foreground">Protected Returns</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Process Overview</h2>
            <p className="text-muted-foreground mb-6">
              The tokenization lifecycle consists of three main phases: Primary (token creation and offering), 
              Secondary (ongoing management and trading), and Disposition (end-of-life). Each phase ensures 
              compliance, transparency, and community benefit.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge className="bg-primary">Primary Phase</Badge>
              <span className="text-muted-foreground">Prepare, Issue, Fund</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-chart-3">Secondary Phase</Badge>
              <span className="text-muted-foreground">Manage, Trade, Report</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-chart-1">Disposition Phase</Badge>
              <span className="text-muted-foreground">Exit, Distribute</span>
            </div>
          </div>

          <Separator className="my-8" />

          <PhaseCard
            phase="Primary Phase"
            title="Preparing and Issuing Tokens"
            description="The initial phase covers property evaluation, legal structuring, token creation, and the community-first offering process."
            steps={primaryPhaseSteps}
            color="bg-primary"
          />

          <PhaseCard
            phase="Secondary Phase"
            title="Post-Issuance Management"
            description="Once tokens are issued, this phase covers ongoing governance, trading, reporting, and dividend distribution."
            steps={secondaryPhaseSteps}
            color="bg-chart-3"
          />

          <PhaseCard
            phase="Disposition Phase"
            title="End-of-Life Handling"
            description="When a property is sold or the investment winds down, tokens are redeemed and burned."
            steps={dispositionPhaseSteps}
            color="bg-chart-1"
          />

          <Separator className="my-8" />

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Investor Protection Throughout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                At every stage of the tokenization process, investor capital is protected:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Escrow Protection:</strong> All funds held in USDC smart contract escrow until 100% funding achieved</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Guaranteed Returns:</strong> If funding fails, investors receive full refund plus 3% APR interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Early Exit Option:</strong> 60%+ of investment recoverable via share transfer even if funding incomplete</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Transparent Governance:</strong> All property decisions made through on-chain DAO voting</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/properties">
                <Button size="lg" data-testid="button-cta-view-properties">
                  View Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/governance">
                <Button variant="outline" size="lg" data-testid="button-cta-learn-governance">
                  Learn About Governance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
