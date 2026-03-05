import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, type ReactNode, type ElementType } from "react";
import { 
  FileText, 
  Download, 
  Building2,
  Users,
  Shield,
  Vote,
  Coins,
  Globe,
  Link2,
  Database,
  Lock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Zap,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Target,
  Code,
  Brain,
  Lightbulb,
  Activity,
  Eye,
  Sparkles,
  Clock,
  Layers,
  Heart,
  Scale,
  Percent,
  Landmark,
  Trophy,
  Hammer,
  MapPin,
  Store,
  Briefcase,
  ClipboardList,
  Star,
  UserCheck
} from "lucide-react";

const tableOfContents = [
  { id: "executive", title: "Executive Summary", icon: Sparkles },
  { id: "founder", title: "Founder & Mission", icon: Heart },
  { id: "problem", title: "Problem Statement", icon: AlertTriangle },
  { id: "market", title: "Market Opportunity", icon: BarChart3 },
  { id: "solution", title: "Solution Overview", icon: Lightbulb },
  { id: "ai-governance", title: "AI-Nudged Governance", icon: Brain },
  { id: "architecture", title: "Smart Contract Architecture", icon: Layers },
  { id: "tokenization", title: "Tokenization Model", icon: Coins },
  { id: "offering", title: "Community-First Offering", icon: Users },
  { id: "engagement", title: "Engagement & Phase Advancement", icon: Activity },
  { id: "revitaleague", title: "RevitaLeague Competition", icon: Trophy },
  { id: "impact", title: "Georgia Impact Simulation", icon: MapPin },
  { id: "marketplace", title: "Service Marketplace & Wishlist", icon: Store },
  { id: "professional-matching", title: "Professional Matching", icon: Briefcase },
  { id: "chainlink", title: "Chainlink Integration", icon: Link2 },
  { id: "governance", title: "DAO Governance", icon: Vote },
  { id: "treasury", title: "Treasury & Founder Economics", icon: Landmark },
  { id: "protection", title: "Investor Protections", icon: Shield },
  { id: "compliance", title: "Regulatory Compliance", icon: CheckCircle2 },
  { id: "technical", title: "Technical Implementation", icon: Code },
  { id: "tokenomics", title: "Tokenomics", icon: Database },
  { id: "risks", title: "Risk Factors", icon: AlertTriangle },
  { id: "roadmap", title: "Roadmap", icon: Calendar },
  { id: "legal", title: "Legal Disclosures", icon: Scale },
];

function Section({ id, title, icon: Icon, children, alternate = false }: { 
  id: string; 
  title: string; 
  icon?: ElementType;
  children: ReactNode;
  alternate?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-24 py-16 lg:py-20 ${alternate ? 'section-alt' : ''}`}>
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center gap-3 mb-8">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold mb-4 text-foreground/90">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon?: ElementType }) {
  return (
    <div className="stat-card rounded-xl border bg-card p-5 border-glow">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
      </div>
      <p className="text-3xl font-bold metric-value text-primary">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ title, description, icon: Icon }: { title: string; description: string; icon: ElementType }) {
  return (
    <Card className="border-glow">
      <CardContent className="p-6">
        <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-semibold mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 mb-6">
      <div className="bg-muted/50 px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <Code className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <pre className="text-xs bg-muted/20 p-4 overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Litepaper() {
  const [activeSection, setActiveSection] = useState("executive");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    tableOfContents.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative bg-gradient-hero glow-gold py-20 lg:py-28 print:py-8 print:bg-white overflow-hidden">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-6 print:hidden">
                <FileText className="h-4 w-4" />
                Technical Litepaper v3.2 — Alpha
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="litepaper-title">
                <span className="text-gradient-animated">Build Your Community,</span>
                <br />
                <span className="text-gradient-animated">One Token at a Time</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground mb-3 max-w-2xl mx-auto">
                AI-Nudged RevitalDAO — Community-Owned Real Estate Revitalization
              </p>
              
              <p className="text-sm text-muted-foreground mb-2">
                Build Our Community, LLC | Cherokee County, Georgia
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                March 2026 | Chainlink Build Program Participant | Base Network (Coinbase L2)
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-12 print:hidden">
                <Button onClick={handlePrint} variant="outline" size="lg" data-testid="button-download-pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto print:hidden">
              <StatCard value="$12.50" label="Minimum Investment" icon={Coins} />
              <StatCard value="3% APR" label="Refund Protection" icon={Shield} />
              <StatCard value="4-Phase" label="Community-First Pricing" icon={Users} />
              <StatCard value="1%" label="Founder Sustainability Fee" icon={Percent} />
            </div>
          </div>
        </section>

        <div className="border-b">
          <div className="mx-auto max-w-6xl px-4">
            <div className="py-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Key Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">4-phase pricing ramp prioritizing local investors at $12.50</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1.5x voting power for county residents</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">75% engagement threshold triggers automatic phase advancement</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">AI-moderated DAO with gasless EIP-712 voting</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">2-of-3 multi-sig treasury with on-chain audit trail</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1% capped founder fee — 24-month vesting, 90-day cliff</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">RevitaLeague: 4 competitive leagues turning properties into virtual cities</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Georgia county-level GDP impact simulation with Chainlink oracle integration</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Service provider marketplace and community wishlist voting</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Professional matching with 8 license types, reputation scoring, and agent task queue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex gap-12">
            <nav className="hidden lg:block w-64 flex-shrink-0 print:hidden">
              <div className="sticky-nav pr-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Contents</h3>
                <ul className="space-y-1">
                  {tableOfContents.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            activeSection === item.id 
                              ? "nav-item-active bg-primary/5" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                          data-testid={`toc-${item.id}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>

            <article className="flex-1 max-w-none">

              <Section id="executive" title="Executive Summary" icon={Sparkles}>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub is an AI-nudged, blockchain-powered platform for community-owned real estate revitalization. 
                  Built on Base (Coinbase L2) and integrated with Chainlink oracles, RevitaHub enables communities to 
                  collectively acquire, govern, and develop vacant and distressed properties through fractional 
                  ERC-1155 tokenization starting at <strong className="text-foreground">$12.50 per token</strong>.
                </p>

                <p className="leading-relaxed mb-8 text-muted-foreground">
                  The platform introduces a novel 4-phase community-first offering model that rewards local investors 
                  with lower prices and amplified voting power. A 75% engagement threshold triggers automatic 
                  phase advancement via Chainlink Automation, creating a gamified "SimCity-like" experience where 
                  community participation directly drives progress. The RevitaLeague competition layer turns 
                  every property into a competing virtual city across four live leagues, while the Georgia Impact 
                  Simulator models GDP growth across 159 counties. A service provider marketplace and community 
                  wishlist create a full pipeline from neighborhood need to funded project. All treasury operations 
                  are governed by a 2-of-3 multi-sig with a transparent 1% capped founder sustainability fee 
                  subject to 24-month vesting with a 90-day cliff.
                </p>

                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 mb-8">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Core Value Propositions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Distribution Is the Real Unlock</p>
                        <p className="text-sm text-muted-foreground">4-phase system ensures local communities invest first at the lowest price</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">AI-Nudged Governance</p>
                        <p className="text-sm text-muted-foreground">AI detects bias, prevents whale manipulation, optimizes engagement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Transparent Founder Economics</p>
                        <p className="text-sm text-muted-foreground">1% capped fee, 24-month vesting, fully on-chain and auditable</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Investor-First Protections</p>
                        <p className="text-sm text-muted-foreground">3% APR refunds on unfunded properties, transfer locks during funding</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="founder" title="Founder & Mission" icon={Heart} alternate>
                <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                  RevitaHub is a solo-founder project by <strong className="text-foreground">Build Our Community, LLC</strong>, 
                  based in Cherokee County, Georgia. The platform was conceived from a simple observation: communities 
                  closest to distressed properties have the most to gain from their revitalization, yet they are 
                  systematically excluded from real estate investment by high capital requirements.
                </p>

                <div className="rounded-2xl border p-6 mb-8">
                  <h4 className="font-semibold mb-4">Mission Statement</h4>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "To democratize real estate investment by giving communities the tools to collectively acquire, 
                    govern, and revitalize the properties in their own neighborhoods — starting at $12.50 per token, 
                    with the people who live there getting first access and the loudest voice."
                  </p>
                </div>

                <Subsection title="Founder Sustainability Model">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    As a solo-founder project, long-term sustainability is built directly into the smart contracts 
                    with full transparency. The founder takes a <strong className="text-foreground">1% fee (FOUNDER_CUT_BPS = 100)</strong> on 
                    treasury disbursements, subject to strict vesting:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-3xl font-bold text-primary mb-1">1%</p>
                      <p className="text-sm text-muted-foreground">Capped Founder Fee</p>
                      <p className="text-xs text-muted-foreground mt-1">Hardcoded in Treasury.sol</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-3xl font-bold text-primary mb-1">24 mo</p>
                      <p className="text-sm text-muted-foreground">Vesting Period</p>
                      <p className="text-xs text-muted-foreground mt-1">Linear after cliff</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-3xl font-bold text-primary mb-1">90 day</p>
                      <p className="text-sm text-muted-foreground">Cliff Period</p>
                      <p className="text-xs text-muted-foreground mt-1">Zero claims before cliff</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground p-4 rounded-xl bg-muted/30 border">
                    The 1% founder cut is explicit in the Treasury smart contract, capped at the contract level, 
                    and recorded on-chain for every transaction. It cannot be changed without a contract upgrade 
                    requiring DAO approval. This ensures founder incentives are permanently aligned with 
                    platform success.
                  </p>
                </Subsection>

                <Subsection title="Contact">
                  <div className="p-4 rounded-xl border">
                    <p className="text-sm"><strong>Entity:</strong> Build Our Community, LLC</p>
                    <p className="text-sm text-muted-foreground mt-1"><strong>Location:</strong> Cherokee County, Georgia</p>
                    <p className="text-sm text-muted-foreground mt-1"><strong>Contact:</strong> DEmery@buildourcommunity.co</p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="problem" title="Problem Statement" icon={AlertTriangle}>
                <Subsection title="The Vacant Property Crisis">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Across the United States, over 17 million vacant properties represent an estimated $500 billion 
                    in unrealized community value. These abandoned lots and structures drain municipal resources, 
                    depress neighboring property values, and create public safety hazards — while the communities 
                    surrounding them lack any mechanism to participate in their transformation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard value="17M+" label="Vacant Properties Nationwide" icon={Building2} />
                    <StatCard value="$500B" label="Estimated Lost Community Value" icon={TrendingUp} />
                    <StatCard value="3,000+" label="Counties Affected" icon={Globe} />
                  </div>
                </Subsection>

                <Subsection title="Barriers to Community Investment">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-destructive">1</span>
                      </div>
                      <div>
                        <p className="font-medium">High Capital Requirements</p>
                        <p className="text-sm text-muted-foreground">Traditional real estate investment requires $25,000-$100,000+ minimums, excluding over 90% of Americans from participating.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-destructive">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Illiquidity & Lock-up</p>
                        <p className="text-sm text-muted-foreground">Conventional real estate typically involves 5-10 year lock-ups with no secondary market access for small investors.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-destructive">3</span>
                      </div>
                      <div>
                        <p className="font-medium">No Community Voice</p>
                        <p className="text-sm text-muted-foreground">Communities have zero input on development decisions for properties in their own neighborhoods, often resulting in outcomes that don't serve local needs.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-destructive">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Opaque Economics</p>
                        <p className="text-sm text-muted-foreground">Fee structures and management compensation are often buried in legal documents, with no real-time accountability or on-chain verifiability.</p>
                      </div>
                    </div>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="market" title="Market Opportunity" icon={BarChart3} alternate>
                <Subsection title="Real World Asset (RWA) Growth">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The tokenized real estate market is experiencing significant growth, with Real World Assets (RWAs) 
                    on-chain reaching $30B in 2025 and projected to grow to <strong className="text-foreground">$10 trillion by 2030</strong> (Boston Consulting Group estimate). 
                    Community-focused real estate represents an underserved segment within this expanding market.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard value="$30B" label="RWA Market 2025" icon={BarChart3} />
                    <StatCard value="$10T" label="Projected 2030 (BCG)" icon={TrendingUp} />
                    <StatCard value="42%" label="ESG Investment Growth YoY" icon={Target} />
                  </div>
                </Subsection>

                <Subsection title="RevitaHub's Position">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    RevitaHub targets the intersection of three growing trends: tokenized real estate, 
                    community development finance, and DAO governance. The platform's unique position:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Community-First Distribution</h5>
                      <p className="text-xs text-muted-foreground">4-phase pricing rewards locals who invest early with lower entry and higher voting power. This creates natural alignment between investors and outcomes.</p>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">AI-Nudged Governance</h5>
                      <p className="text-xs text-muted-foreground">Novel combination of AI moderation with DAO voting prevents whale manipulation while keeping governance accessible to all token holders.</p>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Engagement-Driven Advancement</h5>
                      <p className="text-xs text-muted-foreground">75% engagement threshold via Chainlink Automation creates a gamified investment experience that rewards active community participation.</p>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Transparent Economics</h5>
                      <p className="text-xs text-muted-foreground">All fees including the 1% founder cut are hardcoded in smart contracts, auditable on-chain, and subject to DAO governance for any changes.</p>
                    </div>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="solution" title="Solution Overview" icon={Lightbulb}>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub combines blockchain tokenization, oracle-verified data, AI governance moderation, 
                  and community-first distribution to create an accessible, transparent real estate investment 
                  platform. Like SimCity — but real.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <FeatureCard 
                    icon={Coins}
                    title="Fractional Ownership"
                    description="ERC-1155 tokens starting at $12.50 minimum. Full ownership rights, quarterly dividends, and phase-weighted voting power."
                  />
                  <FeatureCard 
                    icon={Link2}
                    title="Oracle Verification"
                    description="Chainlink provides tamper-proof property valuations, reserve verification, and automated phase advancement."
                  />
                  <FeatureCard 
                    icon={Brain}
                    title="AI-Nudged Governance"
                    description="AI analyzes proposals for bias, detects whale manipulation, and optimizes engagement — without overriding community decisions."
                  />
                  <FeatureCard 
                    icon={Shield}
                    title="Investor Protection"
                    description="Failed funding triggers automatic 3% APR refunds from USDC escrow. Tokens are burned on refund. Transfers locked during funding."
                  />
                </div>

                <Subsection title="How It Works">
                  <div className="space-y-6">
                    {[
                      { step: 1, title: "Nominate & Verify", desc: "Community members nominate distressed properties via the wishlist. Chainlink oracles verify ownership from county registries." },
                      { step: 2, title: "Tokenize & Offer", desc: "ERC-1155 tokens are created with a 4-phase offering — county residents get first access at $12.50 per token with 1.5x voting power." },
                      { step: 3, title: "Govern & Vote", desc: "Token holders vote on development plans via AI-moderated DAO governance. Gasless voting via EIP-712 ensures everyone can participate." },
                      { step: 4, title: "Develop & Earn", desc: "Properties are developed per community votes. Quarterly dividends are distributed automatically. The community builds real wealth." },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <div className="pt-1">
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="ai-governance" title="AI-Nudged Governance" icon={Brain} alternate>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub pioneers the integration of AI with DAO governance — creating an "AI-Nudged RevitalDAO" 
                  that detects bias, prevents whale manipulation, and optimizes community engagement without 
                  overriding democratic decision-making.
                </p>

                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">AI Assists, Community Decides</h4>
                      <p className="text-sm text-muted-foreground">AI provides analysis and nudges — it never overrides votes or blocks proposals</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-glow">
                    <CardContent className="p-6">
                      <Eye className="h-6 w-6 text-primary mb-3" />
                      <h4 className="font-semibold mb-2">Bias Detection</h4>
                      <p className="text-sm text-muted-foreground">
                        AI analyzes proposals for geographic, demographic, and economic bias before community voting begins. Flagged proposals include transparency notes.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-glow">
                    <CardContent className="p-6">
                      <Activity className="h-6 w-6 text-primary mb-3" />
                      <h4 className="font-semibold mb-2">Engagement Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Behavioral nudges (like SimCity advisors) alert communities when engagement nears the 75% phase advancement threshold.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-glow">
                    <CardContent className="p-6">
                      <Shield className="h-6 w-6 text-primary mb-3" />
                      <h4 className="font-semibold mb-2">Whale Detection</h4>
                      <p className="text-sm text-muted-foreground">
                        AI monitors voting patterns for coordinated manipulation. Phase-weighted voting multipliers already limit whale influence by design.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-glow">
                    <CardContent className="p-6">
                      <BarChart3 className="h-6 w-6 text-primary mb-3" />
                      <h4 className="font-semibold mb-2">Demand Analytics</h4>
                      <p className="text-sm text-muted-foreground">
                        SimCity-inspired demand bars track community needs across categories (property development, treasury, governance parameters).
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="architecture" title="Smart Contract Architecture" icon={Layers}>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  Built on Base network (Coinbase L2) for low-cost, high-throughput transactions with full 
                  EVM compatibility. Five core contracts work together to manage the complete property lifecycle.
                </p>

                <div className="rounded-2xl border p-6 mb-8">
                  <h4 className="text-center font-bold text-lg mb-6 text-primary">Core Smart Contracts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                      <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h5 className="font-semibold text-sm">PropertyToken.sol</h5>
                      <p className="text-xs text-muted-foreground">ERC-1155 with phase tracking, voting multipliers, transfer locks, and burner role</p>
                    </div>
                    <div className="p-4 rounded-xl bg-chart-3/10 border border-chart-3/20 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                      <h5 className="font-semibold text-sm">Escrow.sol</h5>
                      <p className="text-xs text-muted-foreground">Token purchases, 3% APR refunds, token burning on failed offerings, compliance events</p>
                    </div>
                    <div className="p-4 rounded-xl bg-chart-1/10 border border-chart-1/20 text-center">
                      <Vote className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                      <h5 className="font-semibold text-sm">Governance.sol</h5>
                      <p className="text-xs text-muted-foreground">AI-moderated DAO voting, EIP-712 gasless votes, community polls, demand analytics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-chart-2/10 border border-chart-2/20 text-center">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                      <h5 className="font-semibold text-sm">PhaseManager.sol</h5>
                      <p className="text-xs text-muted-foreground">Chainlink Automation for 75% engagement-based phase advancement, vote-to-earn bonuses</p>
                    </div>
                    <div className="p-4 rounded-xl bg-chart-4/10 border border-chart-4/20 text-center">
                      <Landmark className="h-8 w-8 mx-auto mb-2 text-chart-4" />
                      <h5 className="font-semibold text-sm">Treasury.sol</h5>
                      <p className="text-xs text-muted-foreground">2-of-3 multi-sig, 1% founder vesting, relayer reimbursements, reserve verification</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-sm">
                    <strong>Security Stack:</strong> All contracts use OpenZeppelin v5.0 libraries (AccessControl, 
                    ReentrancyGuard, ERC-1155). Chainlink Automation provides decentralized, trustless phase 
                    advancement. Base network provides ~$0.01 transaction costs.
                  </p>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="tokenization" title="Tokenization Model" icon={Coins} alternate>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  Each property is tokenized as an ERC-1155 token with a unique ID. Token price escalates 
                  across four phases to reward early, local investors. Voting power is inversely weighted — 
                  those closest to the property have the strongest voice.
                </p>

                <div className="rounded-xl border overflow-hidden mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold">Phase</th>
                        <th className="text-left p-4 font-semibold">Token Price</th>
                        <th className="text-left p-4 font-semibold">Voting Multiplier</th>
                        <th className="text-left p-4 font-semibold">Eligibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-4 font-medium">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">County</Badge>
                        </td>
                        <td className="p-4 text-primary font-semibold">$12.50</td>
                        <td className="p-4 font-semibold">1.5x</td>
                        <td className="p-4 text-muted-foreground">Property's county residents</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4 font-medium">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">State</Badge>
                        </td>
                        <td className="p-4">$18.75 (+50%)</td>
                        <td className="p-4">1.25x</td>
                        <td className="p-4 text-muted-foreground">State residents</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4 font-medium">
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">National</Badge>
                        </td>
                        <td className="p-4">$28.13 (+50%)</td>
                        <td className="p-4">1.0x</td>
                        <td className="p-4 text-muted-foreground">US residents (KYC verified)</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4 font-medium">
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">International</Badge>
                        </td>
                        <td className="p-4">$37.50 (+33%)</td>
                        <td className="p-4">0.75x</td>
                        <td className="p-4 text-muted-foreground">Global investors (KYC/AML verified)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <CodeBlock 
                  title="PropertyToken.sol - Voting Power Calculation"
                  code={`// Phase multipliers: County 1.5x, State 1.25x, National 1.0x, Intl 0.75x
uint256[4] public phaseMultipliers = [15000, 12500, 10000, 7500];

function getVotingPower(uint256 propertyId, address voter) 
    public view returns (uint256) 
{
    uint256 totalPower = 0;
    for (uint256 phase = 0; phase < 4; phase++) {
        uint256 holdings = holdingsByPhase[propertyId][voter][phase];
        totalPower += (holdings * phaseMultipliers[phase]) / 10000;
    }
    return totalPower;
}`}
                />

                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-sm">
                    <strong>Example:</strong> Alice (county resident) with 100 tokens at $12.50 = $1,250 invested, 
                    150 voting power. Bob (international) with 100 tokens at $37.50 = $3,750 invested, 75 voting power. 
                    Alice invested less but has 2x the governance influence because she lives in the community.
                  </p>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="offering" title="Community-First Offering" icon={Users}>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  The 4-phase offering model ensures communities closest to a property get priority access 
                  at the lowest price. Phase advancement is triggered either by full subscription or by 
                  reaching the 75% engagement threshold — whichever comes first.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { phase: "Phase 1: County", duration: "30 days minimum", price: "$12.50", multiplier: "1.5x", desc: "Property's county residents get exclusive first access at the lowest price" },
                    { phase: "Phase 2: State", duration: "30 days minimum", price: "$18.75 (+50%)", multiplier: "1.25x", desc: "Opens to state-wide investors, early state supporters rewarded" },
                    { phase: "Phase 3: National", duration: "30 days minimum", price: "$28.13 (+50%)", multiplier: "1.0x", desc: "Available to all US investors with standard voting weight" },
                    { phase: "Phase 4: International", duration: "Until funded or deadline", price: "$37.50 (+33%)", multiplier: "0.75x", desc: "Global access — defers governance weight to local investors" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-glow">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold">{item.phase}</span>
                          <Badge variant="secondary">{item.duration}</Badge>
                          <Badge variant="outline">{item.price}</Badge>
                          <Badge className="bg-primary/10 text-primary border-primary/30">{item.multiplier} vote</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Funding Deadline
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Each property has a <strong className="text-foreground">1-year maximum funding deadline</strong>. 
                    If 100% of tokens are not sold within this period, the offering fails and all investors 
                    receive automatic refunds with 3% APR interest from the USDC escrow contract.
                  </p>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="engagement" title="Engagement & Phase Advancement" icon={Activity} alternate>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub uses a SimCity-inspired engagement model where community participation directly 
                  drives property advancement. When 75% of token holders actively participate in governance, 
                  the property automatically advances to the next pricing phase via Chainlink Automation.
                </p>

                <Subsection title="75% Engagement Threshold">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The PhaseManager contract tracks voter participation for each property. When the ratio 
                    of active voters to eligible voters reaches 75% (7500 basis points), and a minimum 
                    7-day engagement period has passed, phase advancement is triggered automatically.
                  </p>

                  <CodeBlock 
                    title="PhaseManager.sol - Engagement Calculation & Threshold"
                    code={`// 75% engagement required for early phase advancement
uint256 public constant ENGAGEMENT_THRESHOLD = 7500; // basis points
uint256 public constant MIN_ENGAGEMENT_PERIOD = 7 days;

function calculateEngagement(uint256 propertyId) public view returns (uint256) {
    PropertyEngagement storage engagement = propertyEngagement[propertyId];
    if (engagement.totalEligibleVoters == 0) return 0;
    // Returns in basis points (e.g., 7500 = 75%)
    return (engagement.activeVoters * 10000) / engagement.totalEligibleVoters;
}

function _checkPhaseAdvancement(uint256 propertyId, uint256 engagementPercent) internal {
    PropertyEngagement storage engagement = propertyEngagement[propertyId];
    if (block.timestamp < engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD) return;
    if (engagementPercent >= ENGAGEMENT_THRESHOLD) {
        _advancePhaseByEngagement(propertyId, engagementPercent);
    }
}`}
                  />
                </Subsection>

                <Subsection title="Chainlink Automation">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Phase advancement is fully decentralized through Chainlink Automation. The PhaseManager 
                    implements <code className="text-xs bg-muted px-1 py-0.5 rounded">AutomationCompatibleInterface</code>, 
                    with <code className="text-xs bg-muted px-1 py-0.5 rounded">checkUpkeep()</code> scanning all tracked 
                    properties and <code className="text-xs bg-muted px-1 py-0.5 rounded">performUpkeep()</code> executing 
                    advancement when thresholds are met. No centralized trigger required.
                  </p>

                  <CodeBlock 
                    title="PhaseManager.sol - Chainlink Automation Integration"
                    code={`function checkUpkeep(bytes calldata) external view override 
    returns (bool upkeepNeeded, bytes memory performData) 
{
    for (uint256 i = 0; i < trackedProperties.length; i++) {
        uint256 propertyId = trackedProperties[i];
        PropertyEngagement storage engagement = propertyEngagement[propertyId];
        if (!engagement.isTracking) continue;
        if (block.timestamp < engagement.phaseStartTime + MIN_ENGAGEMENT_PERIOD) continue;
        
        uint256 engagementPercent = calculateEngagement(propertyId);
        if (engagementPercent >= ENGAGEMENT_THRESHOLD) {
            return (true, abi.encode(propertyId, engagementPercent));
        }
    }
    return (false, "");
}`}
                  />
                </Subsection>

                <Subsection title="Vote-to-Earn & Behavioral Nudges">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Vote-to-Earn Bonus
                      </h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Active participants earn bonus tokens when 75% threshold is met</li>
                        <li>• Poll participants get 2x bonus (rewards early engagement)</li>
                        <li>• Claims tracked on-chain to prevent double-claiming</li>
                        <li>• Bonus tokens minted by PhaseManager (holds MINTER_ROLE)</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        SimCity-Style Nudges
                      </h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Below 25%: "urgent_participation" nudge</li>
                        <li>• 60-75%: "milestone_near" nudge</li>
                        <li>• 70-75%: "phase_closing" final push</li>
                        <li>• 24-hour cooldown prevents notification fatigue</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <p className="text-sm">
                      <strong>Poll Participation Bonus:</strong> Community polls (non-binding demand gauges) give 
                      participants 0.5x engagement credit, boosting the property toward the 75% threshold. 
                      Polls with &gt;30% support can be converted into formal governance proposals with a 
                      5% quorum reduction bonus.
                    </p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="revitaleague" title="RevitaLeague Competition" icon={Trophy}>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaLeague transforms every tokenized property into a competing virtual city, driving 
                  3-5x engagement through gamified leaderboards, seasonal competitions, and cross-county 
                  rivalries — all fully on-chain, oracle-driven, and zero extra platform cost.
                </p>

                <Subsection title="Four Live Leagues">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Every property is automatically ranked across four competitive leagues, each measuring 
                    a different dimension of revitalization impact. League scores are calculated from 
                    on-chain ImpactMetrics via Chainlink Functions running Forrester/Sterman/Meadows 
                    system dynamics models on public data.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FeatureCard
                      title="GDP Growth League"
                      description="Ranks cities by 5-year projected economic output derived from ImpactMetrics.economicScore and GDP multiplier calculations."
                      icon={TrendingUp}
                    />
                    <FeatureCard
                      title="Social Impact League"
                      description="Measures jobs created, affordable units delivered, and community benefit scores — weighted by ARC distress classification."
                      icon={Heart}
                    />
                    <FeatureCard
                      title="Engagement League"
                      description="Tracks phase advancement speed and governance voting participation rate — rewarding the most active communities."
                      icon={Zap}
                    />
                    <FeatureCard
                      title="Builder League"
                      description="Personal competition — ranks investors by their contribution across all cities: tokens held, properties invested, votes cast."
                      icon={Hammer}
                    />
                  </div>
                </Subsection>

                <Subsection title="RevitaCup Seasons">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Every 90 days, a new RevitaCup season begins. The top 10 cities in the combined 
                    leaderboard split a DAO-voted treasury bonus pool of extra tokens minted via 
                    PropertyToken. Seasonal trophies are recorded on-chain via the <code className="text-xs bg-muted px-1 py-0.5 rounded">seasonWins</code> mapping.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-3xl font-bold text-primary mb-1">90 days</p>
                      <p className="text-sm text-muted-foreground">Season Duration</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-3xl font-bold text-primary mb-1">Top 10</p>
                      <p className="text-sm text-muted-foreground">Cities Split Bonus Pool</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-3xl font-bold text-primary mb-1">+0.75%</p>
                      <p className="text-sm text-muted-foreground">Bonus APR for Top-50 Cities</p>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Cross-County Rivalries">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Rivalries are auto-generated between nearby counties in the same region. Users see 
                    their city glowing brighter on the competition map the higher it ranks. Click 
                    "Visit Rival City" to compare progress in real time. At Georgia full adoption 
                    (159 counties), this creates 79+ active rivalries driving continuous engagement.
                  </p>
                </Subsection>

                <Subsection title="On-Chain Integration">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The competition layer adds minimal gas overhead to existing contracts — just three 
                    fields and two functions across the five-contract architecture:
                  </p>

                  <CodeBlock
                    title="PropertyToken.sol - League Score & Season Wins"
                    code={`uint256 public leagueScore;           // auto-updated by PhaseManager
mapping(uint256 => uint256) public seasonWins; // for RevitaCup trophies

function updateLeagueScore(uint256 propertyId, uint256 newScore) 
    external onlyRole(PHASE_ADVANCER_ROLE) 
{
    properties[propertyId].leagueScore = newScore;
    emit LeagueScoreUpdated(propertyId, newScore);
}`}
                  />

                  <CodeBlock
                    title="PhaseManager.sol - Daily League Update (Chainlink Automation)"
                    code={`function runLeagueUpdate() external {  // called by Chainlink Automation daily
    for each tracked property {
        uint256 score = calculateForresterGDP(...) * socialScore / 10000;
        propertyToken.updateLeagueScore(propertyId, score);
        if (score > top10Threshold) emit LeagueLeaderChange(propertyId, score);
    }
}`}
                  />

                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <p className="text-sm text-muted-foreground">
                      All league scores are Chainlink-proven and IPFS-visual only. Rewards require 
                      Governance quorum (no founder discretion). Rankings are projected simulations 
                      based on public data models — not investment advice.
                    </p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="impact" title="Georgia Impact Simulation" icon={MapPin} alternate>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub includes a comprehensive Georgia county-level impact simulator that models 
                  GDP growth, job creation, and community benefit across adoption scenarios from 5% 
                  to 100% of the state's 159 counties. All projections use the Appalachian Regional 
                  Commission (ARC) distress classification system and Donella Meadows' Leverage Points framework.
                </p>

                <Subsection title="Impact Metrics (ImpactMetrics Struct)">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Every property generates an on-chain ImpactMetrics struct that feeds into league 
                    scoring, property detail cards, and the GDP simulator. These metrics are designed 
                    to eventually be populated by Chainlink Functions running system dynamics models.
                  </p>

                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Metric</th>
                          <th className="text-left p-4 font-semibold">Range</th>
                          <th className="text-left p-4 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">economicScore</td>
                          <td className="p-4">0–10,000</td>
                          <td className="p-4 text-muted-foreground">Jobs + GDP impact weighted by county distress</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">socialScore</td>
                          <td className="p-4">0–10,000</td>
                          <td className="p-4 text-muted-foreground">Affordability + community benefit metrics</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">leverageRank</td>
                          <td className="p-4">1–10</td>
                          <td className="p-4 text-muted-foreground">Meadows Leverage Points ranking (higher = more systemic impact)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">projectedAnnualROI</td>
                          <td className="p-4">BPS</td>
                          <td className="p-4 text-muted-foreground">Basis points ROI projection from revitalization</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">riskAdjustedScore</td>
                          <td className="p-4">0–100</td>
                          <td className="p-4 text-muted-foreground">Combined risk-adjusted viability score</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="Adoption Tiers">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The simulator models four adoption scenarios for Georgia, scaling from distressed 
                    counties to statewide full saturation. Each tier shows projected GDP impact, 
                    sample projects, and founder revenue scaling.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-2xl font-bold text-primary mb-1">5%</p>
                      <p className="text-xs text-muted-foreground">7 Counties</p>
                      <p className="text-xs text-muted-foreground">Pilot — Distressed Only</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-2xl font-bold text-primary mb-1">20%</p>
                      <p className="text-xs text-muted-foreground">32 Counties</p>
                      <p className="text-xs text-muted-foreground">Mid-Adoption</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-2xl font-bold text-primary mb-1">50%</p>
                      <p className="text-xs text-muted-foreground">79 Counties</p>
                      <p className="text-xs text-muted-foreground">Widespread</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-2xl font-bold text-primary mb-1">100%</p>
                      <p className="text-xs text-muted-foreground">159 Counties</p>
                      <p className="text-xs text-muted-foreground">Full Saturation</p>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Property-Level Economic Impact Cards">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Each property detail page displays an Economic Impact Analysis card showing the 
                    county's ARC distress classification, three radial score gauges (economic, social, 
                    risk-adjusted), GDP multiplier, leverage rank, and a Chainlink oracle proof placeholder. 
                    A companion "What Your $12.50 Does" card visualizes the ripple-effect chain from 
                    token purchase through property share, jobs supported, and 5-year GDP impact.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Economic Impact Analysis</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• County distress level badge (ARC classification)</li>
                        <li>• Economic, Social, Risk-Adjusted score gauges</li>
                        <li>• GDP Multiplier ("X.Xx Economic Ripple")</li>
                        <li>• Leverage Rank (1-10 Meadows scale)</li>
                        <li>• Chainlink Oracle Proof status badge</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">What Your $12.50 Does</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Token Price → Property Share → Jobs → GDP Impact</li>
                        <li>• Projected Year 1 Dividends</li>
                        <li>• Projected 5-Year ROI</li>
                        <li>• Economic and social summary</li>
                        <li>• "Not financial advice" disclaimer</li>
                      </ul>
                    </div>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="marketplace" title="Service Marketplace & Community Wishlist" icon={Store}>
                <Subsection title="Service Provider Marketplace">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    RevitaHub's service marketplace connects properties with qualified professionals — 
                    realtors, brokers, tax assessors, title companies, and property management firms. 
                    Service providers submit competitive bids on specific property service categories, 
                    and winners are selected by DAO governance vote with payments disbursed from the Treasury.
                  </p>

                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Service Category</th>
                          <th className="text-left p-4 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Title Work", "Title search, insurance, and closing services"],
                          ["Loan Structuring", "Financing structure and lender coordination"],
                          ["Property Assessment", "Valuation, inspection, and condition reports"],
                          ["Legal Services", "SPV formation, regulatory filings, compliance"],
                          ["Property Management", "Ongoing operations, tenant management, maintenance"],
                          ["Construction", "Renovation planning, contractor coordination, permits"],
                        ].map(([cat, desc], i) => (
                          <tr key={i} className="border-t">
                            <td className="p-4 font-medium">{cat}</td>
                            <td className="p-4 text-muted-foreground">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Competitive Bidding</span>
                        <p className="text-xs text-muted-foreground mt-1">Multiple providers bid, driving quality up and costs down</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Vote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">DAO Selection</span>
                        <p className="text-xs text-muted-foreground mt-1">Token holders vote to select winning bids via governance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Landmark className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Treasury Payments</span>
                        <p className="text-xs text-muted-foreground mt-1">Winning bids paid from Treasury via multi-sig approval</p>
                      </div>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Community Wishlist">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The Community Wishlist enables residents to signal what their neighborhoods need most. 
                    Users search by zip code and vote on predefined business categories — Grocery Store, 
                    Medical Clinic, Community Center, Daycare, and more. Vote percentages and progress 
                    bars surface the strongest community demand signals, informing which property types 
                    to prioritize for tokenization.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {["Grocery Store", "Medical Clinic", "Community Center", "Affordable Housing", "Daycare", "Job Training", "Senior Living", "Tech Hub"].map((cat, i) => (
                      <div key={i} className="p-3 rounded-xl border text-center">
                        <p className="text-sm font-medium">{cat}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <p className="text-sm text-muted-foreground">
                      Wishlist votes are non-binding demand signals. When a wish category reaches sufficient 
                      community support, it can be converted into a formal property nomination or governance 
                      proposal, creating a pipeline from community need to funded revitalization project.
                    </p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="professional-matching" title="Professional Matching & Verification" icon={Briefcase} alternate>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub connects revitalization projects with verified local professionals through a comprehensive 
                  matching, verification, and reputation system. The Professional Directory ensures every project has 
                  access to qualified contractors, realtors, attorneys, and other specialists — all verified by admin 
                  review and tracked through on-platform reputation scoring.
                </p>

                <Subsection title="Professional Directory & License Types">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Professionals apply through a multi-step onboarding wizard, providing license credentials, 
                    service areas, insurance information, and portfolio links. Admin review and verification 
                    ensure only qualified professionals appear in the directory.
                  </p>

                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">License Type</th>
                          <th className="text-left p-4 font-semibold">Role in Revitalization</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Contractor", "Renovation, construction management, and permitting"],
                          ["Realtor", "Property sourcing, valuation, and transaction coordination"],
                          ["Attorney", "SPV formation, regulatory filings, title work, and compliance"],
                          ["Engineer", "Structural assessment, environmental review, and site planning"],
                          ["Architect", "Design, adaptive reuse planning, and building code compliance"],
                          ["Lender", "Financing structure, loan origination, and capital stack advisory"],
                          ["Inspector", "Property condition assessments and code violation reporting"],
                          ["Appraiser", "Independent property valuation and market analysis"],
                        ].map(([type, role], i) => (
                          <tr key={i} className="border-t">
                            <td className="p-4 font-medium">{type}</td>
                            <td className="p-4 text-muted-foreground">{role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="Verification & Approval Workflow">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Every professional profile undergoes admin verification before appearing in the public directory. 
                    License numbers, insurance credentials, and service area claims are validated against state records 
                    where available.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <ClipboardList className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Application Submission</span>
                        <p className="text-xs text-muted-foreground mt-1">6-step wizard captures license, insurance, service areas, and portfolio</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <UserCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Admin Verification</span>
                        <p className="text-xs text-muted-foreground mt-1">Admin reviews credentials and approves or rejects with verification timestamp</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Directory Listing</span>
                        <p className="text-xs text-muted-foreground mt-1">Verified professionals appear in public directory with endorsements</p>
                      </div>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Service Areas & Endorsements">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Professionals define their service areas at the county level, enabling precise matching with 
                    properties in their geographic coverage. Other platform users and project participants can 
                    leave endorsements with ratings, building a transparent reputation trail.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">County-Based Service Areas</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Professionals specify counties they serve</li>
                        <li>• Active/inactive toggle per county</li>
                        <li>• Auto-matching with properties in covered counties</li>
                        <li>• Filter directory by county availability</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Endorsement System</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Authenticated users can endorse professionals</li>
                        <li>• Written comments from verified platform users</li>
                        <li>• Endorsement count visible on directory cards</li>
                      </ul>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Project Matching">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The platform supports two-way matching between projects and professionals. Admins can invite 
                    verified professionals to active token offerings based on needed roles, and professionals 
                    can independently express interest in opportunities within their service counties.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Admin-Initiated Matching</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Admin invites professionals to specific offerings</li>
                        <li>• Role specification (contractor, inspector, etc.)</li>
                        <li>• Optional token allocation percentage for professional</li>
                        <li>• Track invitation → response → selection pipeline</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Professional Self-Service</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Browse opportunities by county</li>
                        <li>• Express interest in active offerings</li>
                        <li>• View match status on Professional Dashboard</li>
                        <li>• Track holdings and completed projects</li>
                      </ul>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Reputation System">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    An event-based reputation scoring system tracks professional performance across multiple 
                    dimensions. Reputation events are recorded by admins and accumulate into a composite score 
                    visible on each professional's profile.
                  </p>

                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Event Type</th>
                          <th className="text-left p-4 font-semibold">Score Impact</th>
                          <th className="text-left p-4 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Project Completion", "+10", "Successfully delivered on a revitalization project"],
                          ["Positive Rating", "+5", "Received a 4-5 star endorsement from a project participant"],
                          ["On-Time Delivery", "+3", "Met project milestones within agreed timeline"],
                          ["Dispute Filed", "-5", "A dispute was raised regarding professional's work"],
                          ["Dispute Resolved", "+2", "Dispute resolved satisfactorily"],
                          ["License Renewal", "+1", "Updated license credentials proactively"],
                        ].map(([type, score, desc], i) => (
                          <tr key={i} className="border-t">
                            <td className="p-4 font-medium">{type}</td>
                            <td className={`p-4 font-semibold ${score.startsWith('+') ? 'text-primary' : 'text-destructive'}`}>{score}</td>
                            <td className="p-4 text-muted-foreground">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="Agent Tasks">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The Agent Task system provides an AI-assisted task queue for platform operations. Admin-created 
                    tasks automate and track key workflows across property sourcing, owner outreach, grant research, 
                    and contractor sourcing — ensuring no revitalization opportunity is missed.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Property Sourcing", icon: Building2 },
                      { label: "Owner Outreach", icon: Users },
                      { label: "Grant Research", icon: Landmark },
                      { label: "Contractor Sourcing", icon: Hammer },
                    ].map((task, i) => (
                      <div key={i} className="p-4 rounded-xl border text-center">
                        <task.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium">{task.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <p className="text-sm text-muted-foreground">
                      Agent tasks are admin-managed with priority levels and status tracking (queued, running, 
                      completed, failed, needs_human). Results and metadata are stored as structured JSON for 
                      downstream automation and reporting.
                    </p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="chainlink" title="Chainlink Integration" icon={Link2}>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub is a participant in the Chainlink Build Program, leveraging Chainlink's oracle 
                  infrastructure for secure, tamper-proof data feeds and decentralized automation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <FeatureCard 
                    icon={Database}
                    title="Price Feeds & Valuations"
                    description="Chainlink Functions fetch property valuations from verified data sources, ensuring token prices reflect real market conditions."
                  />
                  <FeatureCard 
                    icon={Shield}
                    title="Proof of Reserve"
                    description="Treasury.sol calls Chainlink oracles to verify USDC reserves match token obligations. Results recorded on-chain via ReservesVerified events."
                  />
                  <FeatureCard 
                    icon={RefreshCw}
                    title="Automation (Keepers)"
                    description="PhaseManager.sol implements AutomationCompatibleInterface for trustless, decentralized phase advancement when 75% engagement is reached."
                  />
                  <FeatureCard 
                    icon={Globe}
                    title="Cross-Chain (CCIP)"
                    description="Future multi-chain token bridging via Chainlink CCIP, enabling property tokens to be held and traded across supported networks."
                  />
                </div>

                <CodeBlock 
                  title="Treasury.sol - Chainlink Reserve Verification"
                  code={`interface IChainlinkFunctions {
    function getReserves(uint256 propertyId) external view returns (uint256);
}

function verifyAndRecordReserves(uint256 propertyId) external returns (uint256) {
    require(chainlinkOracle != address(0), "Oracle not configured");
    uint256 reserves = IChainlinkFunctions(chainlinkOracle).getReserves(propertyId);
    emit ReservesVerified(propertyId, reserves);
    return reserves;
}`}
                />
              </Section>

              <div className="divider-gradient" />

              <Section id="governance" title="DAO Governance" icon={Vote} alternate>
                <Subsection title="Phase-Weighted Voting">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Voting power is weighted by purchase phase, amplifying local community voices. 
                    A county resident with 100 tokens has 150 voting power, while an international investor 
                    with 100 tokens has 75 voting power — ensuring the people most affected by development 
                    decisions have the strongest say.
                  </p>

                  <CodeBlock 
                    title="Governance.sol - Voting with Phase Multipliers"
                    code={`function castVote(uint256 proposalId, bool support) external nonReentrant {
    Proposal storage proposal = proposals[proposalId];
    require(block.timestamp < proposal.endTime, "Voting ended");
    require(!proposal.hasVoted[msg.sender], "Already voted");
    
    // Get voting power from PropertyToken (includes phase multipliers)
    uint256 votingPower = propertyToken.getVotingPower(
        proposal.propertyId, msg.sender
    );
    require(votingPower > 0, "No voting power");
    
    proposal.hasVoted[msg.sender] = true;
    if (support) {
        proposal.forVotes += votingPower;
    } else {
        proposal.againstVotes += votingPower;
    }
    emit VoteCast(proposalId, msg.sender, support, votingPower);
}`}
                  />
                </Subsection>

                <Subsection title="Gasless Voting (EIP-712)">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Lower-income investors can participate in governance without paying gas fees. 
                    Using EIP-712 typed data signatures, investors sign their votes off-chain and 
                    authorized relayers submit them on-chain. The Treasury reimburses relayers from 
                    a dedicated pool (max 0.01 ETH per transaction).
                  </p>

                  <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 mb-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Financial Inclusion by Design
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Gas fees on some networks can exceed $5-20 per transaction, making voting prohibitively expensive 
                      for small token holders. On Base, fees are already low (~$0.01), but gasless voting ensures 
                      <strong className="text-foreground"> every investor's voice is heard</strong> regardless of their 
                      ETH balance.
                    </p>
                  </div>

                  <CodeBlock 
                    title="Governance.sol - Gasless Voting via EIP-712 Signatures"
                    code={`bytes32 public constant VOTE_TYPEHASH = keccak256(
    "Vote(uint256 proposalId,uint8 support,address voter,uint256 nonce,uint256 deadline)"
);

function castVoteBySignature(
    uint256 proposalId,
    uint8 support,       // 0=against, 1=for, 2=abstain
    address voter,
    uint256 deadline,
    uint8 v, bytes32 r, bytes32 s
) external onlyRole(RELAYER_ROLE) nonReentrant {
    require(block.timestamp <= deadline, "Signature expired");
    
    uint256 currentNonce = nonces[voter];
    nonces[voter]++;
    
    bytes32 structHash = keccak256(abi.encode(
        VOTE_TYPEHASH, proposalId, support, voter, currentNonce, deadline
    ));
    bytes32 digest = keccak256(abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, structHash));
    address signer = ECDSA.recover(digest, v, r, s);
    require(signer == voter, "Invalid signature");
    
    _castVote(proposalId, voter, support);
}`}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Replay Protection</span>
                        <p className="text-xs text-muted-foreground mt-1">Nonce-based signature tracking prevents vote replay</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Deadline Expiry</span>
                        <p className="text-xs text-muted-foreground mt-1">Signatures expire for security — stale votes rejected</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">RELAYER_ROLE</span>
                        <p className="text-xs text-muted-foreground mt-1">Only authorized submitters can relay votes</p>
                      </div>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Community Polls (Demand Gauges)">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Before formal proposals, community members can create lightweight polls to gauge demand for 
                    potential property listings or development ideas. Polls are non-binding but create valuable 
                    on-chain demand signals.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Poll Features</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• No token holdings required to create polls</li>
                        <li>• 1-30 day configurable duration</li>
                        <li>• Simple yes/no voting with participation tracking</li>
                        <li>• Property-specific or platform-wide scope</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Poll-to-Proposal Pipeline</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Polls with &gt;30% support → formal proposals</li>
                        <li>• 5% quorum reduction bonus for poll-backed proposals</li>
                        <li>• Poll voters get 0.5x engagement credit toward 75% threshold</li>
                        <li>• 2x bonus tokens for poll participants</li>
                      </ul>
                    </div>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="treasury" title="Treasury & Founder Economics" icon={Landmark}>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  The Treasury contract manages all DAO funds with institutional-grade security. Two execution 
                  paths exist: multi-sig for operational disbursements and direct DAO execution for governance-approved 
                  proposals. Both paths apply the 1% founder sustainability fee.
                </p>

                <Subsection title="2-of-3 Multi-Sig">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Operational disbursements require approval from 2 of 3 designated signers. Transactions 
                    are submitted, confirmed, and executed through a structured approval flow. Each signer can 
                    also revoke their confirmation before execution.
                  </p>

                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Step</th>
                          <th className="text-left p-4 font-semibold">Action</th>
                          <th className="text-left p-4 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-medium">1</td>
                          <td className="p-4 font-mono text-xs text-primary">submitTransaction()</td>
                          <td className="p-4 text-muted-foreground">Signer proposes transaction (auto-confirms for submitter)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">2</td>
                          <td className="p-4 font-mono text-xs text-primary">confirmTransaction()</td>
                          <td className="p-4 text-muted-foreground">Second signer reviews and confirms</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">3</td>
                          <td className="p-4 font-mono text-xs text-primary">executeTransaction()</td>
                          <td className="p-4 text-muted-foreground">With 2 confirmations, transaction executes (1% founder cut deducted)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="Founder Sustainability Fee — Full Transparency">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The founder sustainability model is designed for radical transparency. Every parameter is 
                    hardcoded in the smart contract and verifiable on-chain by any investor at any time.
                  </p>

                  <CodeBlock 
                    title="Treasury.sol - Founder Fee & Vesting"
                    code={`uint256 public constant FOUNDER_CUT_BPS = 100;     // 1% — cannot be changed
uint256 public constant VESTING_PERIOD = 730 days;  // 24 months
uint256 public constant VESTING_CLIFF = 90 days;    // 3 month cliff — zero claims before

function executeTransaction(uint256 txId) external onlyRole(SIGNER_ROLE) nonReentrant {
    Transaction storage txn = transactions[txId];
    require(txn.confirmationCount >= requiredConfirmations, "Not enough confirmations");
    
    txn.executed = true;
    
    // 1% founder cut deducted from every disbursement
    uint256 founderCut = (txn.value * FOUNDER_CUT_BPS) / 10000;
    uint256 amountToSend = txn.value - founderCut;
    
    if (founderCut > 0) {
        payable(founderWallet).call{value: founderCut}("");
        emit FounderCutSent(founderWallet, founderCut);
    }
    
    txn.target.call{value: amountToSend}(txn.data);
    emit TransactionExecuted(txId);
}

function getClaimableVested(address founder) public view returns (uint256) {
    if (vestingStart[founder] == 0) return 0;
    uint256 elapsed = block.timestamp - vestingStart[founder];
    if (elapsed < VESTING_CLIFF) return 0; // Nothing before 90-day cliff
    
    uint256 totalVested = vestedCuts[founder];
    uint256 vestedAmount = elapsed >= VESTING_PERIOD 
        ? totalVested 
        : (totalVested * elapsed) / VESTING_PERIOD; // Linear vesting
    
    return vestedAmount - claimedCuts[founder];
}`}
                  />

                  <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 mb-6">
                    <h4 className="font-semibold mb-3">Why 1%?</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>As a solo-founder project, the 1% fee is designed to be:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• <strong className="text-foreground">Sustainable</strong> — enough to fund ongoing development and operations</li>
                        <li>• <strong className="text-foreground">Modest</strong> — well below typical platform fees in the industry</li>
                        <li>• <strong className="text-foreground">Aligned</strong> — vesting ensures the founder only benefits as the platform succeeds over time</li>
                        <li>• <strong className="text-foreground">Immutable</strong> — FOUNDER_CUT_BPS is a constant, not a variable — it cannot be changed without a new contract deployment requiring DAO approval</li>
                      </ul>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Relayer Reimbursement Pool">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The Treasury maintains a dedicated pool to reimburse relayers who submit gasless votes 
                    on behalf of investors. This ensures the platform can subsidize governance participation 
                    for all token holders regardless of their ETH balance.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-2xl font-bold text-primary mb-1">0.01 ETH</p>
                      <p className="text-xs text-muted-foreground">Max reimbursement per transaction</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-2xl font-bold text-primary mb-1">EXECUTOR</p>
                      <p className="text-xs text-muted-foreground">Only Governance contract can trigger</p>
                    </div>
                    <div className="p-4 rounded-xl border text-center">
                      <p className="text-2xl font-bold text-primary mb-1">On-Chain</p>
                      <p className="text-xs text-muted-foreground">All reimbursements logged via events</p>
                    </div>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="protection" title="Investor Protections" icon={Shield} alternate>
                <Subsection title="3% APR Refund Guarantee">
                  <p className="leading-relaxed mb-4 text-muted-foreground">
                    If a property fails to reach 100% funding within its 1-year deadline:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Automatic refunds processed with 3% APR interest from USDC escrow</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>All property tokens burned on refund (prevents orphaned tokens)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Compliance events emitted for full regulatory audit trail</span>
                    </li>
                  </ul>

                  <CodeBlock 
                    title="Escrow.sol - Refund with 3% APR & Token Burning"
                    code={`function processRefunds(uint256 propertyId) external nonReentrant {
    require(block.timestamp > escrows[propertyId].deadline);
    require(!escrows[propertyId].funded); // Must have failed funding
    
    for (uint i = 0; i < contributors[propertyId].length; i++) {
        address investor = contributors[propertyId][i];
        uint256 principal = contributions[propertyId][investor];
        uint256 interest = (principal * 300 * daysHeld) / 36500 / 100;
        
        // Burn tokens before refund (prevents double-claims)
        propertyToken.burnFromOnFailure(propertyId, investor);
        payable(investor).transfer(principal + interest);
        
        emit RefundComplianceRecorded(propertyId, investor, principal, interest, block.timestamp);
    }
}`}
                  />
                </Subsection>

                <Subsection title="Transfer Locks During Funding">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Property tokens cannot be transferred during the funding period. This prevents 
                    speculative trading before a property is fully funded and protects the integrity 
                    of the community offering phases.
                  </p>

                  <CodeBlock 
                    title="PropertyToken.sol - Transfer Locks"
                    code={`function _update(
    address from, address to, 
    uint256[] memory ids, uint256[] memory values
) internal override {
    for (uint256 i = 0; i < ids.length; i++) {
        uint256 propertyId = ids[i];
        if (from != address(0) && to != address(0)) {
            require(properties[propertyId].isFunded, "Transfers locked during funding");
            require(whitelistedAddresses[to] != WhitelistStatus.None, "Recipient not whitelisted");
        }
    }
    super._update(from, to, ids, values);
}`}
                  />
                </Subsection>

                <Subsection title="Additional Security Measures">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "OpenZeppelin v5.0 security libraries (AccessControl, ReentrancyGuard, ERC-1155)",
                      "Chainlink Proof of Reserve verification for treasury audits",
                      "Content Security Policy (CSP) preventing XSS and unauthorized resource loading",
                      "Server-side identity injection on key create endpoints — prevents impersonation on properties, submissions, nominations, and purchases",
                      "Ownership authorization on submission mutations — only resource owners can edit, submit, or manage documents",
                      "Stripe webhook signature verification with constructEvent",
                      "Rate limiting on purchases, votes, and global writes (30 req/min per IP)",
                      "Authenticated file uploads — no anonymous storage access",
                      "Third-party smart contract audits (planned)",
                      "Bug bounty program (up to $100,000)"
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="compliance" title="Regulatory Compliance" icon={CheckCircle2}>
                <Subsection title="Securities Framework">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    RevitaHub is designed to operate within established US securities regulations. 
                    Token offerings may be structured under one or more of the following frameworks 
                    depending on the property and investor base:
                  </p>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation D (506c)</span>
                        <p className="text-sm text-muted-foreground">Accredited investors, general solicitation permitted. No offering cap.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation A+ (Tier 2)</span>
                        <p className="text-sm text-muted-foreground">Up to $75M annually, non-accredited investors welcome. SEC qualification required.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation CF</span>
                        <p className="text-sm text-muted-foreground">Crowdfunding up to $5M, broad investor access with per-investor limits.</p>
                      </div>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="KYC/AML Requirements">
                  <p className="leading-relaxed mb-4 text-muted-foreground">
                    All investors must complete identity verification before purchasing tokens. 
                    KYC status determines phase eligibility:
                  </p>
                  <ul className="space-y-2 mb-6">
                    {[
                      "Government-issued ID verification",
                      "Address verification (determines county/state phase eligibility)",
                      "Accreditation verification (for Regulation D offerings)",
                      "OFAC sanctions screening",
                      "On-chain KYCVerificationCompleted event for audit trail"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Subsection>

                <Subsection title="On-Chain Compliance Events">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Every transaction emits compliance events creating an immutable audit trail. 
                    These events enable real-time monitoring and simplify regulatory examinations.
                  </p>

                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Event</th>
                          <th className="text-left p-4 font-semibold">Trigger</th>
                          <th className="text-left p-4 font-semibold">Data Captured</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">CompliancePurchaseRecorded</td>
                          <td className="p-4 text-muted-foreground">Token purchase</td>
                          <td className="p-4 text-muted-foreground">Amount, totalPaid, transactionHash</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">InvestorLimitChecked</td>
                          <td className="p-4 text-muted-foreground">Each purchase</td>
                          <td className="p-4 text-muted-foreground">currentContribution, newContribution, withinLimit</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">RefundComplianceRecorded</td>
                          <td className="p-4 text-muted-foreground">Refund processing</td>
                          <td className="p-4 text-muted-foreground">Principal, interest, timestamp</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">KYCVerificationCompleted</td>
                          <td className="p-4 text-muted-foreground">Identity verification</td>
                          <td className="p-4 text-muted-foreground">Account, timestamp, verificationId</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">FounderCutSent</td>
                          <td className="p-4 text-muted-foreground">Treasury disbursement</td>
                          <td className="p-4 text-muted-foreground">Founder address, amount</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-mono text-xs text-primary">ComplianceCheckpoint</td>
                          <td className="p-4 text-muted-foreground">Periodic audits</td>
                          <td className="p-4 text-muted-foreground">totalHolders, totalSupplyMinted, timestamp</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-chart-3/5 border border-chart-3/20">
                    <p className="text-sm">
                      <strong>Audit Functions:</strong> Compliance officers can call <code className="text-xs bg-muted px-1 py-0.5 rounded">getPurchaseForAudit()</code>, 
                      <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">getInvestorContribution()</code>, and 
                      <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">getVestingInfo()</code> to retrieve 
                      detailed transaction and founder vesting data for regulatory examinations.
                    </p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="technical" title="Technical Implementation" icon={Code} alternate>
                <Subsection title="Technology Stack">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Blockchain</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Base Network (Coinbase L2) — ~$0.01 tx cost</li>
                        <li>• Solidity ^0.8.20</li>
                        <li>• OpenZeppelin v5.0 (AccessControl, ReentrancyGuard)</li>
                        <li>• Chainlink (Automation, Functions, CCIP)</li>
                        <li>• ERC-1155 multi-token standard</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Platform</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• React 18 + TypeScript (frontend)</li>
                        <li>• Node.js + Express (backend API)</li>
                        <li>• PostgreSQL + Drizzle ORM (data layer)</li>
                        <li>• RainbowKit + wagmi (wallet connection)</li>
                        <li>• Vite (build tooling)</li>
                      </ul>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Escrow Purchase Flow">
                  <CodeBlock 
                    title="Escrow.sol - Token Purchase"
                    code={`function purchase(uint256 propertyId, uint256 tokenAmount) 
    external payable nonReentrant 
{
    require(block.timestamp <= escrows[propertyId].deadline, "Offering expired");
    uint256 price = propertyToken.getCurrentPrice(propertyId);
    require(msg.value >= price * tokenAmount, "Insufficient payment");
    
    // Mint tokens to buyer
    propertyToken.mintTokens(propertyId, msg.sender, tokenAmount);
    contributions[propertyId][msg.sender] += msg.value;
    
    // Compliance events for audit trail
    emit CompliancePurchaseRecorded(propertyId, msg.sender, tokenAmount, msg.value, 
        keccak256(abi.encodePacked(block.number, msg.sender, propertyId)));
    emit Purchase(propertyId, msg.sender, tokenAmount, msg.value);
}`}
                  />
                </Subsection>

                <Subsection title="Smart Contract Security">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {[
                      "ReentrancyGuard on all state-changing functions",
                      "AccessControl with granular role management",
                      "Multi-party computation for key management",
                      "Formal verification of critical logic (planned)",
                      "Third-party security audits (planned)",
                      "Bug bounty program (up to $100,000)"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </Subsection>

                <Subsection title="Platform Security">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Beyond smart contracts, the platform backend enforces defense-in-depth security at every layer 
                    of the API and data access pipeline.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Content Security Policy (CSP) enabled via Helmet.js — restricts script, style, connect, and frame sources to trusted domains only",
                      "Auth middleware on sensitive write endpoints — property creation, submissions, nominations, purchases, governance proposals, and admin actions require authenticated session",
                      "Server-side identity injection on key create endpoints — userId, ownerId, and nominatorId set from session on properties, submissions, nominations, and purchases",
                      "Ownership authorization on submission mutations — edit, submit, document upload, and document delete verify resource ownership and return 403 for non-owners",
                      "Admin-only gating — owner lookup, tokenization, phase advancement, refund processing, KYC management, and reconciliation restricted to admin role",
                      "Stripe webhook signature verification via constructEvent with STRIPE_WEBHOOK_SECRET and raw body capture",
                      "Rate limiting — global write rate limit (30 req/min per IP), plus endpoint-specific limits on purchases and votes",
                      "Session hardening — sameSite lax cookies, 8-hour expiration, encrypted with SESSION_SECRET",
                      "Authenticated file uploads — signed upload URLs require login, preventing anonymous storage abuse",
                      "Audit logging — significant actions logged to audit_log table with userId, action, IP, and timestamp"
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="tokenomics" title="Tokenomics" icon={Database}>
                <Subsection title="RVTA Governance Token">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Total Supply: <strong className="text-foreground">100,000,000 RVTA</strong> (fixed, no inflation mechanism)
                  </p>
                  
                  <div className="rounded-xl border overflow-hidden mb-8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Allocation</th>
                          <th className="text-left p-4 font-semibold">%</th>
                          <th className="text-left p-4 font-semibold">Tokens</th>
                          <th className="text-left p-4 font-semibold">Vesting</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Community Treasury</td>
                          <td className="p-4 text-primary font-semibold">40%</td>
                          <td className="p-4">40,000,000</td>
                          <td className="p-4 text-muted-foreground">DAO-controlled, governance-approved releases</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Investor Airdrop</td>
                          <td className="p-4">20%</td>
                          <td className="p-4">20,000,000</td>
                          <td className="p-4 text-muted-foreground">Proportional to investment history & engagement</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Founder & Advisors</td>
                          <td className="p-4">15%</td>
                          <td className="p-4">15,000,000</td>
                          <td className="p-4 text-muted-foreground">4-year vesting, 1-year cliff</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Development Fund</td>
                          <td className="p-4">12%</td>
                          <td className="p-4">12,000,000</td>
                          <td className="p-4 text-muted-foreground">Milestone-based releases</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Ecosystem Incentives</td>
                          <td className="p-4">5%</td>
                          <td className="p-4">5,000,000</td>
                          <td className="p-4 text-muted-foreground">Chainlink integration & community rewards</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Liquidity</td>
                          <td className="p-4">8%</td>
                          <td className="p-4">8,000,000</td>
                          <td className="p-4 text-muted-foreground">DEX liquidity provision</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="Fee Structure">
                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Fee Type</th>
                          <th className="text-left p-4 font-semibold">Amount</th>
                          <th className="text-left p-4 font-semibold">Distribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Primary Investment</td>
                          <td className="p-4">2.5%</td>
                          <td className="p-4 text-muted-foreground">Community Treasury + stakers</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Secondary Trading</td>
                          <td className="p-4">1.0%</td>
                          <td className="p-4 text-muted-foreground">50% protocol treasury, 50% property DAO</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Asset Management</td>
                          <td className="p-4">1.5%/year</td>
                          <td className="p-4 text-muted-foreground">Property operations & maintenance</td>
                        </tr>
                        <tr className="border-t bg-primary/5">
                          <td className="p-4 font-medium">Founder Sustainability</td>
                          <td className="p-4 text-primary font-semibold">1.0%</td>
                          <td className="p-4 text-muted-foreground">Per disbursement, 24-mo vesting, 90-day cliff</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <p className="text-sm text-muted-foreground">
                      All fees are transparent and verifiable on-chain. The founder sustainability fee is 
                      the only fee that accrues to Build Our Community, LLC. All other fees flow to the 
                      Community Treasury, property DAOs, or operational funds as specified above.
                    </p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="risks" title="Risk Factors" icon={AlertTriangle} alternate>
                <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <h4 className="font-semibold">Important Disclosures</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prospective investors should carefully consider the following risk factors. This litepaper 
                    is not investment advice. Consult qualified financial and legal advisors before investing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Market Risk", desc: "Real estate values fluctuate based on economic conditions, local markets, and broader macroeconomic factors." },
                    { title: "Liquidity Risk", desc: "Secondary market for property tokens may have limited trading volume, especially during early phases." },
                    { title: "Regulatory Risk", desc: "Securities laws and cryptocurrency regulations may change, potentially affecting token status and platform operations." },
                    { title: "Smart Contract Risk", desc: "Despite security audits and OpenZeppelin libraries, smart contracts may contain undiscovered vulnerabilities." },
                    { title: "Development Risk", desc: "Property revitalization projects may face delays, cost overruns, or unforeseen complications." },
                    { title: "Counterparty Risk", desc: "Third-party service providers (property managers, contractors) may fail to perform as expected." },
                    { title: "Solo Founder Risk", desc: "As a solo-founder project, key person dependency exists. Vesting schedule and on-chain governance provide mitigation." },
                    { title: "Technology Risk", desc: "Base network, Chainlink, or other infrastructure dependencies may experience outages or changes." },
                  ].map((risk, i) => (
                    <Card key={i} className="border-destructive/10">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">{risk.title}</h4>
                        <p className="text-sm text-muted-foreground">{risk.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="roadmap" title="Roadmap" icon={Calendar}>
                <div className="space-y-6">
                  {[
                    { quarter: "Q1 2026", status: "current", items: [
                      "Smart contract development (PropertyToken, Escrow, Governance, PhaseManager, Treasury)",
                      "Chainlink Build Program integration",
                      "Platform MVP with interactive property maps (Leaflet + Mapbox)",
                      "Community wishlist with zip-code voting and nomination system",
                      "Service provider marketplace with competitive bidding",
                      "Georgia county-level GDP impact simulator (159 counties, 4 adoption tiers)",
                      "RevitaLeague competition layer (4 leagues, RevitaCup, cross-county rivalries)",
                      "Economic impact cards on property detail with ARC distress classification",
                      "Professional matching system — 8 license types, verification workflow, county-based service areas, endorsements",
                      "Agent task queue — AI-assisted property sourcing, owner outreach, grant research, contractor sourcing",
                      "Reputation system — event-based scoring for project completions, ratings, and disputes",
                      "Platform security hardening — CSP, auth middleware on all write endpoints, ownership authorization, server-side identity injection, Stripe webhook verification, authenticated file uploads"
                    ]},
                    { quarter: "Q2 2026", status: "upcoming", items: [
                      "Security audits (third-party)",
                      "Base Sepolia testnet deployment",
                      "First property tokenization (Cherokee County, GA)",
                      "KYC/AML integration and community onboarding"
                    ]},
                    { quarter: "Q3 2026", status: "upcoming", items: [
                      "Base mainnet deployment",
                      "Regulatory qualification (Reg A+ / Reg CF)",
                      "Gasless voting activation",
                      "Mobile-responsive optimization"
                    ]},
                    { quarter: "Q4 2026", status: "upcoming", items: [
                      "RVTA governance token launch",
                      "Multi-property expansion beyond Cherokee County",
                      "Chainlink CCIP cross-chain exploration",
                      "Community governance activation"
                    ]},
                    { quarter: "2027", status: "upcoming", items: [
                      "State-level expansion across Georgia",
                      "National phase rollout",
                      "Secondary market for funded property tokens",
                      "International phase planning"
                    ]},
                  ].map((phase, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          phase.status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        {i < 4 && <div className="w-0.5 h-full bg-border mt-2" />}
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{phase.quarter}</span>
                          {phase.status === 'current' && <Badge>Current</Badge>}
                        </div>
                        <ul className="space-y-1">
                          {phase.items.map((item, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="legal" title="Legal Disclosures" icon={Scale} alternate>
                <div className="space-y-6">
                  <div className="p-6 rounded-xl border">
                    <h4 className="font-semibold mb-3">Forward-Looking Statements</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This litepaper contains forward-looking statements regarding RevitaHub's planned 
                      features, development roadmap, and business objectives. These statements are based on 
                      current expectations and assumptions, and actual results may differ materially due to 
                      various factors including market conditions, regulatory changes, and technical challenges.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl border">
                    <h4 className="font-semibold mb-3">Not Investment Advice</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This document is for informational purposes only and does not constitute an offer to sell, 
                      a solicitation of an offer to buy, or a recommendation for any security or investment. 
                      Prospective investors should conduct their own due diligence and consult with qualified 
                      financial, legal, and tax advisors before making any investment decisions.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl border">
                    <h4 className="font-semibold mb-3">Intellectual Property</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      RevitaHub and all associated intellectual property are owned by Build Our Community, LLC. 
                      The platform architecture, smart contract designs, AI-nudged governance model, 4-phase 
                      community-first offering system, and engagement-driven phase advancement mechanism are 
                      original works created by Build Our Community, LLC.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl border">
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>Build Our Community, LLC</strong><br />
                      Cherokee County, Georgia<br />
                      DEmery@buildourcommunity.co
                    </p>
                  </div>
                </div>
              </Section>

              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  RevitaHub Technical Litepaper v3.2 (Alpha) — March 2026
                </p>
                <p className="text-xs text-muted-foreground">
                  &copy; {new Date().getFullYear()} Build Our Community, LLC. All rights reserved.
                </p>
              </div>

            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
