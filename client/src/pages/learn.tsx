import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconTray, type IconTrayItem } from "@/components/IconTray";
import { ExpandableSection } from "@/components/ExpandableSection";
import { LearnCard, type LearnArticle } from "@/components/LearnCard";
import { StateComplianceTable } from "@/components/StateComplianceTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Coins, Scale, Building2, Vote, Shield, BookOpen,
  FileText, Rocket, Settings, Target,
  CheckCircle2, Layers, Brain, Clock, Zap, Book, GraduationCap
} from "lucide-react";

const learnArticles: LearnArticle[] = [
  {
    id: "what-is-tokenization",
    title: "What is Real Estate Tokenization?",
    description: "Learn how blockchain technology enables fractional ownership of real-world properties and why it matters for community development.",
    category: "Basics",
    readTime: 8,
    difficulty: "beginner",
    icon: Coins,
  },
  {
    id: "how-to-invest",
    title: "How to Make Your First Investment",
    description: "Step-by-step guide to connecting your wallet, browsing properties, and purchasing your first community tokens.",
    category: "Getting Started",
    readTime: 12,
    difficulty: "beginner",
    icon: Building2,
  },
  {
    id: "understanding-governance",
    title: "Understanding DAO Governance",
    description: "How decentralized governance works, voting power, proposal creation, and making your voice heard in community decisions.",
    category: "Governance",
    readTime: 15,
    difficulty: "intermediate",
    icon: Vote,
  },
  {
    id: "legal-compliance",
    title: "Securities Law and Compliance",
    description: "Overview of SEC regulations, Reg D exemptions, and how tokenized real estate maintains legal compliance.",
    category: "Legal",
    readTime: 20,
    difficulty: "advanced",
    icon: Scale,
  },
  {
    id: "state-regulations",
    title: "State-by-State Regulatory Guide",
    description: "Comprehensive guide to blockchain and real estate regulations across all 50 states, including Blue Sky laws.",
    category: "Legal",
    readTime: 25,
    difficulty: "advanced",
    icon: Shield,
  },
  {
    id: "smart-contracts",
    title: "Smart Contracts Explained",
    description: "How smart contracts automate token distribution, dividend payments, and governance voting on EVM-compatible blockchains.",
    category: "Technology",
    readTime: 18,
    difficulty: "intermediate",
    icon: BookOpen,
  },
];

const TOTAL_GUIDES = 5;

const iconTrayItems: IconTrayItem[] = [
  { id: "process-guide", label: "Process Guide", icon: FileText },
  { id: "journey", label: "4-Phase Journey", icon: Rocket },
  { id: "blockchain-101", label: "Blockchain 101", icon: Layers },
  { id: "dao-governance", label: "DAO Governance", icon: Vote },
  { id: "glossary", label: "Glossary", icon: Book },
];

function ProcessGuideSection() {
  const steps = [
    { number: 1, title: "Evaluate", description: "Property eligibility and valuation", icon: Search, details: ["Nomination submitted", "Title verification", "Chainlink oracle valuation"] },
    { number: 2, title: "Configure", description: "Legal structure and token parameters", icon: Settings, details: ["Create property-holding LLC", "Set phase pricing ($12.50 to $37.50)", "Configure per-person limits"] },
    { number: 3, title: "Tokenize", description: "Smart contract deployment", icon: Coins, details: ["Deploy ERC-1155 multi-token contract", "Implement transfer restrictions", "Security audit"] },
    { number: 4, title: "Launch", description: "4-phase community-first offering", icon: Rocket, details: ["Phase 1 (County): $12.50/token", "Phase 2 (State): $18.75/token", "Phase 3-4: National/International"] },
    { number: 5, title: "Close & Issue", description: "Funding completion and token distribution", icon: Target, details: ["100% funding target required", "USDC escrow with 3% APR", "Tokens minted to investor wallets"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">How the Process Works</h3>
        <p className="text-muted-foreground text-sm">From property nomination to community ownership — step by step.</p>
      </div>
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.number}>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">Step {step.number}</Badge>
                    <h4 className="text-lg font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  <ul className="space-y-1">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {idx < steps.length - 1 && <div className="ml-6 mt-4 h-6 border-l-2 border-dashed border-muted-foreground/30" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FourPhaseJourneySection() {
  const phases = [
    { name: "County Phase", price: "$12.50", multiplier: "1.5x", limit: "100 tokens/person", color: "bg-chart-3/10 border-chart-3/20 text-chart-3" },
    { name: "State Phase", price: "$18.75", multiplier: "1.25x", limit: "250 tokens/person", color: "bg-chart-1/10 border-chart-1/20 text-chart-1" },
    { name: "National Phase", price: "$28.13", multiplier: "1.0x", limit: "500 tokens/person", color: "bg-chart-4/10 border-chart-4/20 text-chart-4" },
    { name: "International Phase", price: "$37.50", multiplier: "0.75x", limit: "1000 tokens/person", color: "bg-muted border text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">4-Phase Investment Journey</h3>
        <p className="text-muted-foreground text-sm">Community-first pricing ensures local investors get the best deal and the most voting power.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.map((phase, idx) => (
          <Card key={phase.name} className={`p-4 border ${phase.color.split(" ")[1]}`}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">Phase {idx + 1}</Badge>
            </div>
            <h4 className="font-semibold mb-2">{phase.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-bold">{phase.price}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Voting</span><span className="font-bold">{phase.multiplier}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Limit</span><span className="text-xs">{phase.limit}</span></div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">75% engagement threshold:</span> When community participation reaches 75%, the phase automatically advances via the PhaseManager smart contract.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Blockchain101Section() {
  const concepts = [
    { term: "Blockchain", definition: "A distributed digital ledger that records transactions across a network of computers, making records transparent and tamper-proof." },
    { term: "Smart Contract", definition: "Self-executing programs on the blockchain that automatically enforce the terms of an agreement when conditions are met." },
    { term: "Token", definition: "A digital asset on a blockchain that can represent ownership, voting rights, or other value. RevitaHub uses ERC-1155 tokens." },
    { term: "Wallet", definition: "A digital tool that stores your blockchain credentials and allows you to interact with smart contracts and hold tokens." },
    { term: "DAO", definition: "Decentralized Autonomous Organization — a community-governed entity where decisions are made through token-weighted voting." },
    { term: "Base Network", definition: "A Layer 2 blockchain built by Coinbase that offers low transaction fees while maintaining Ethereum's security." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Blockchain 101</h3>
        <p className="text-muted-foreground text-sm">New to blockchain? Here are the key concepts you need to know.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map(c => (
          <Card key={c.term} className="p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />{c.term}
            </h4>
            <p className="text-sm text-muted-foreground">{c.definition}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DAOGovernanceSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">DAO & Governance</h3>
        <p className="text-muted-foreground text-sm">How community decisions are made through decentralized governance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
          <h4 className="font-medium text-sm mb-1">Propose</h4>
          <p className="text-xs text-muted-foreground">Any token holder can create a proposal</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="h-8 w-8 mx-auto text-chart-3 mb-2" />
          <h4 className="font-medium text-sm mb-1">Vote</h4>
          <p className="text-xs text-muted-foreground">7-day voting window for all holders</p>
        </Card>
        <Card className="p-4 text-center">
          <Zap className="h-8 w-8 mx-auto text-chart-1 mb-2" />
          <h4 className="font-medium text-sm mb-1">Execute</h4>
          <p className="text-xs text-muted-foreground">Approved proposals are implemented</p>
        </Card>
      </div>
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3">What You Can Vote On</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Property development plans</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Contractor and vendor selection</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Community benefit allocations</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Dividend distribution percentages</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Property sale decisions</li>
        </ul>
      </Card>
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-2">
          <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">AI-Nudged Governance:</span> RevitaHub uses AI to detect voting bias, prevent whale manipulation, and optimize community engagement — while keeping all final decisions with human token holders.
          </p>
        </div>
      </Card>
    </div>
  );
}

function GlossarySection() {
  const terms = [
    { term: "ARC", definition: "Appalachian Regional Commission — classifies county distress levels" },
    { term: "BEA RIMS II", definition: "Bureau of Economic Analysis Regional Input-Output Model — calculates GDP multipliers" },
    { term: "CCIP", definition: "Chainlink Cross-Chain Interoperability Protocol — enables cross-chain communication" },
    { term: "ERC-1155", definition: "Multi-token standard allowing multiple token types in a single smart contract" },
    { term: "ERC-1400", definition: "Security token standard with transfer restrictions and compliance features" },
    { term: "EIP-712", definition: "Typed data signing standard enabling gasless voting" },
    { term: "KYC/AML", definition: "Know Your Customer / Anti-Money Laundering — regulatory compliance requirements" },
    { term: "Multi-sig", definition: "Multi-signature wallet requiring multiple approvals for transactions" },
    { term: "Reg D / Reg CF", definition: "SEC exemptions allowing companies to raise capital without full registration" },
    { term: "RevitaScore", definition: "Deterministic county-level impact scoring engine used for project evaluation" },
    { term: "TVL", definition: "Total Value Locked — aggregate value deposited in smart contracts" },
    { term: "USDC", definition: "USD Coin — a dollar-pegged stablecoin used for transactions" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Glossary</h3>
        <p className="text-muted-foreground text-sm">Key terms and abbreviations used across the platform.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {terms.map(t => (
              <div key={t.term} className="p-4 flex items-start gap-4">
                <span className="font-mono text-sm font-semibold text-primary min-w-[100px]">{t.term}</span>
                <span className="text-sm text-muted-foreground">{t.definition}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Learn() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const readGuides = 0;

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && iconTrayItems.some(item => item.id === hash)) {
      setActiveSection(hash);
    }
  }, []);

  const handleSelect = (id: string) => {
    setActiveSection(id || null);
    if (id) window.history.replaceState(null, "", `/learn#${id}`);
    else window.history.replaceState(null, "", "/learn");
  };

  const filteredArticles = learnArticles.filter((article) => {
    return !searchTerm || article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-learn-title">Learn</h1>
            <p className="text-muted-foreground">
              Everything you need to know about community-owned real estate tokenization
            </p>
          </div>

          <Card className="p-4 mb-8">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium" data-testid="text-progress-indicator">You've read {readGuides} of {TOTAL_GUIDES} guides</p>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(readGuides / TOTAL_GUIDES) * 100}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-articles"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredArticles.slice(0, 3).map((article) => (
              <LearnCard key={article.id} article={article} />
            ))}
          </div>

          <IconTray items={iconTrayItems} activeId={activeSection} onSelect={handleSelect} className="mb-2" />

          <ExpandableSection id="process-guide" isOpen={activeSection === "process-guide"}>
            <ProcessGuideSection />
          </ExpandableSection>

          <ExpandableSection id="journey" isOpen={activeSection === "journey"}>
            <FourPhaseJourneySection />
          </ExpandableSection>

          <ExpandableSection id="blockchain-101" isOpen={activeSection === "blockchain-101"}>
            <Blockchain101Section />
          </ExpandableSection>

          <ExpandableSection id="dao-governance" isOpen={activeSection === "dao-governance"}>
            <DAOGovernanceSection />
          </ExpandableSection>

          <ExpandableSection id="glossary" isOpen={activeSection === "glossary"}>
            <GlossarySection />
          </ExpandableSection>

          <div id="states" className="pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">State Regulatory Overview</h2>
            <StateComplianceTable />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
