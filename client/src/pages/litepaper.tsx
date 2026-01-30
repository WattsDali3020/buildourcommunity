import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  ExternalLink,
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
  ArrowRight,
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
  ChevronRight,
  Sparkles,
  Clock,
  Layers
} from "lucide-react";

const tableOfContents = [
  { id: "executive", title: "Executive Summary", icon: Sparkles },
  { id: "problem", title: "Problem Statement", icon: AlertTriangle },
  { id: "market", title: "Market Analysis", icon: BarChart3 },
  { id: "solution", title: "Solution Overview", icon: Lightbulb },
  { id: "ai-governance", title: "AI-Nudged Governance", icon: Brain },
  { id: "architecture", title: "Platform Architecture", icon: Layers },
  { id: "tokenization", title: "Tokenization Model", icon: Coins },
  { id: "offering", title: "Community-First Offering", icon: Users },
  { id: "chainlink", title: "Chainlink Integration", icon: Link2 },
  { id: "governance", title: "DAO Governance", icon: Vote },
  { id: "protection", title: "Investor Protections", icon: Shield },
  { id: "compliance", title: "Regulatory Compliance", icon: CheckCircle2 },
  { id: "technical", title: "Technical Architecture", icon: Code },
  { id: "tokenomics", title: "Tokenomics", icon: Database },
  { id: "risks", title: "Risk Factors", icon: AlertTriangle },
  { id: "roadmap", title: "Roadmap", icon: Calendar },
];

function Section({ id, title, icon: Icon, children, alternate = false }: { 
  id: string; 
  title: string; 
  icon?: React.ElementType;
  children: React.ReactNode;
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold mb-4 text-foreground/90">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon?: React.ElementType }) {
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

function FeatureCard({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
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
        <section className="relative bg-gradient-hero glow-blue py-20 lg:py-28 print:py-8 print:bg-white overflow-hidden">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-6 print:hidden">
                <FileText className="h-4 w-4" />
                Technical Litepaper v1.4
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="litepaper-title">
                <span className="text-gradient-animated">Ownership in Every Acre</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground mb-3 max-w-2xl mx-auto">
                Tokenizing Communities for Lasting Growth
              </p>
              
              <p className="text-sm text-muted-foreground mb-8">
                January 2026 | Chainlink Build Program Participant
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-12 print:hidden">
                <Button onClick={handlePrint} variant="outline" size="lg" data-testid="button-download-pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <a href="https://chain.link/build-program" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Chainlink Build
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto print:hidden">
              <StatCard value="$12.50" label="Minimum Investment" icon={Coins} />
              <StatCard value="8.2%" label="Target Annual Returns" icon={TrendingUp} />
              <StatCard value="4-Phase" label="Community-First Offering" icon={Users} />
              <StatCard value="3% APR" label="Refund Protection" icon={Shield} />
            </div>
          </div>
        </section>

        <div className="border-b">
          <div className="mx-auto max-w-6xl px-4">
            <div className="py-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Key Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">4-phase distribution with local investor priority</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1.5x voting power for county residents</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Chainlink-powered oracle verification</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">AI-moderated DAO with gasless voting</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">2-of-3 multi-sig treasury controls</span>
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
                  RevitaHub is a blockchain-powered platform revolutionizing real estate revitalization by enabling 
                  community-led fractional ownership of vacant properties. Starting at just <strong className="text-foreground">$12.50 per token</strong>, 
                  investors gain equity, voting rights, and quarterly dividends in projects transforming blighted assets 
                  into thriving community developments.
                </p>

                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 mb-8">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Platform Differentiators
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Community-First Distribution</p>
                        <p className="text-sm text-muted-foreground">4-phase system prioritizing local investors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Voting Multipliers</p>
                        <p className="text-sm text-muted-foreground">1.5x power for county residents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Oracle Verification</p>
                        <p className="text-sm text-muted-foreground">Chainlink-powered valuations and reserves</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Investor Protection</p>
                        <p className="text-sm text-muted-foreground">3% APR refunds on failed offerings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="problem" title="Problem Statement" icon={AlertTriangle} alternate>
                <Subsection title="The Vacant Property Crisis">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Across the United States, 17+ million vacant properties represent $500B in lost value. 
                    These abandoned lots drain municipal resources while communities lack capital mechanisms to transform them.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard value="17M+" label="Vacant Properties" icon={Building2} />
                    <StatCard value="$500B" label="Lost Value" icon={TrendingUp} />
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
                        <p className="text-sm text-muted-foreground">$25K-$100K+ minimums exclude 90% of Americans from real estate investment.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-destructive">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Illiquidity</p>
                        <p className="text-sm text-muted-foreground">5-10 year lock-ups with no secondary market for traditional real estate.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-destructive">3</span>
                      </div>
                      <div>
                        <p className="font-medium">No Community Voice</p>
                        <p className="text-sm text-muted-foreground">Communities lack input on development decisions, often leading to gentrification.</p>
                      </div>
                    </div>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="market" title="Market Analysis" icon={BarChart3}>
                <Subsection title="RWA Market Growth">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The tokenized real estate market is experiencing explosive growth, with Real World Assets (RWAs) 
                    reaching $30B in 2025 and projected to hit <strong className="text-foreground">$10 trillion by 2030</strong> (Boston Consulting Group).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard value="$30B" label="RWA Market 2025" icon={BarChart3} />
                    <StatCard value="$10T" label="Projected 2030" icon={TrendingUp} />
                    <StatCard value="42%" label="ESG Growth YoY" icon={Target} />
                  </div>
                </Subsection>

                <Subsection title="Competitive Landscape">
                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Feature</th>
                          <th className="text-left p-4 font-semibold text-primary">RevitaHub</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">Competitors</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Min. Investment</td>
                          <td className="p-4 text-primary font-semibold">$12.50</td>
                          <td className="p-4 text-muted-foreground">$50-$100+</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Community Governance</td>
                          <td className="p-4 text-primary font-semibold">DAO with voting multipliers</td>
                          <td className="p-4 text-muted-foreground">Limited or none</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Local Priority</td>
                          <td className="p-4 text-primary font-semibold">4-phase system</td>
                          <td className="p-4 text-muted-foreground">First-come basis</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Investor Protection</td>
                          <td className="p-4 text-primary font-semibold">3% APR refunds</td>
                          <td className="p-4 text-muted-foreground">Varies</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="solution" title="Solution Overview" icon={Lightbulb} alternate>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub combines blockchain tokenization, oracle-verified data, and community-first governance 
                  to create an accessible, transparent real estate investment platform.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <FeatureCard 
                    icon={Coins}
                    title="Fractional Ownership"
                    description="ERC-1155 tokens with $12.50 minimum, full ownership rights and quarterly dividends."
                  />
                  <FeatureCard 
                    icon={Link2}
                    title="Oracle Verification"
                    description="Chainlink provides tamper-proof valuations and automated dividend calculations."
                  />
                  <FeatureCard 
                    icon={Vote}
                    title="DAO Governance"
                    description="Token holders vote on development with community multipliers amplifying local voices."
                  />
                  <FeatureCard 
                    icon={Shield}
                    title="Investor Protection"
                    description="Failed funding triggers automatic 3% APR refunds from USDC escrow."
                  />
                </div>

                <Subsection title="How It Works">
                  <div className="space-y-6">
                    {[
                      { step: 1, title: "Nomination & Verification", desc: "Community nominates properties; Chainlink verifies ownership from county registries." },
                      { step: 2, title: "Tokenization & Phased Offering", desc: "ERC-1155 tokens created with 4-phase offering prioritizing local investors." },
                      { step: 3, title: "Governance", desc: "Token holders vote on development plans with phase-based voting multipliers." },
                      { step: 4, title: "Development & Returns", desc: "Properties developed per community votes; quarterly dividends distributed automatically." },
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

              <Section id="ai-governance" title="AI-Nudged Governance" icon={Brain}>
                <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub pioneers the integration of AI with DAO governance—creating an "AI-Nudged RevitalDAO" 
                  that detects bias, prevents whale manipulation, and optimizes community engagement.
                </p>

                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Novel AI + DAO Combination</h4>
                      <p className="text-sm text-muted-foreground">First real estate platform combining AI governance with community tokenization</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-glow">
                    <CardContent className="p-6">
                      <Eye className="h-6 w-6 text-primary mb-3" />
                      <h4 className="font-semibold mb-2">Bias Detection</h4>
                      <p className="text-sm text-muted-foreground">
                        AI analyzes proposals for geographic, demographic, and economic bias before community voting.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-glow">
                    <CardContent className="p-6">
                      <Activity className="h-6 w-6 text-primary mb-3" />
                      <h4 className="font-semibold mb-2">Engagement Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Vote-to-earn bonus APR incentivizes active participation in governance decisions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="architecture" title="Platform Architecture" icon={Layers} alternate>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  Built on Base network (Coinbase L2) for low-cost, high-throughput transactions with full EVM compatibility.
                </p>

                <div className="rounded-2xl border p-6 mb-8">
                  <h4 className="text-center font-bold text-lg mb-6 text-primary">Core Smart Contracts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                      <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h5 className="font-semibold text-sm">PropertyToken</h5>
                      <p className="text-xs text-muted-foreground">ERC-1155 with phase tracking</p>
                    </div>
                    <div className="p-4 rounded-xl bg-chart-3/10 border border-chart-3/20 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                      <h5 className="font-semibold text-sm">Escrow</h5>
                      <p className="text-xs text-muted-foreground">Purchases & 3% APR refunds</p>
                    </div>
                    <div className="p-4 rounded-xl bg-chart-1/10 border border-chart-1/20 text-center">
                      <Vote className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                      <h5 className="font-semibold text-sm">Governance</h5>
                      <p className="text-xs text-muted-foreground">AI-moderated DAO voting</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-chart-2/10 border border-chart-2/20 text-center">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                      <h5 className="font-semibold text-sm">PhaseManager</h5>
                      <p className="text-xs text-muted-foreground">Chainlink Automation for phase advancement</p>
                    </div>
                    <div className="p-4 rounded-xl bg-chart-4/10 border border-chart-4/20 text-center">
                      <Database className="h-8 w-8 mx-auto mb-2 text-chart-4" />
                      <h5 className="font-semibold text-sm">Treasury</h5>
                      <p className="text-xs text-muted-foreground">DAO-controlled fund execution</p>
                    </div>
                  </div>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="tokenization" title="Tokenization Model" icon={Coins}>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  Each property is tokenized as an ERC-1155 token with unique ID, enabling fractional ownership 
                  while maintaining full property rights and governance participation.
                </p>

                <div className="rounded-xl border overflow-hidden mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold">Phase</th>
                        <th className="text-left p-4 font-semibold">Price</th>
                        <th className="text-left p-4 font-semibold">Voting Multiplier</th>
                        <th className="text-left p-4 font-semibold">Eligibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-4 font-medium">County</td>
                        <td className="p-4 text-primary font-semibold">$12.50</td>
                        <td className="p-4">1.5x</td>
                        <td className="p-4 text-muted-foreground">Local residents</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4 font-medium">State</td>
                        <td className="p-4">$18.75</td>
                        <td className="p-4">1.25x</td>
                        <td className="p-4 text-muted-foreground">State residents</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4 font-medium">National</td>
                        <td className="p-4">$28.13</td>
                        <td className="p-4">1.0x</td>
                        <td className="p-4 text-muted-foreground">US residents</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4 font-medium">International</td>
                        <td className="p-4">$37.50</td>
                        <td className="p-4">0.75x</td>
                        <td className="p-4 text-muted-foreground">Global investors</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="offering" title="Community-First Offering" icon={Users} alternate>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  Our 4-phase offering system ensures local communities get priority access to investment opportunities, 
                  with automatic phase advancement based on 75% engagement thresholds.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { phase: "Phase 1: County", duration: "30 days", price: "$12.50", desc: "Property's county residents get first access" },
                    { phase: "Phase 2: State", duration: "30 days", price: "$18.75 (+50%)", desc: "Opens to state-wide investors" },
                    { phase: "Phase 3: National", duration: "30 days", price: "$28.13 (+50%)", desc: "Available to all US investors" },
                    { phase: "Phase 4: International", duration: "Until funded", price: "$37.50 (+33%)", desc: "Global investor access" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-glow">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{item.phase}</span>
                          <Badge variant="secondary">{item.duration}</Badge>
                          <Badge variant="outline">{item.price}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="chainlink" title="Chainlink Integration" icon={Link2}>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  RevitaHub leverages Chainlink's oracle network for secure, tamper-proof data feeds and automation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <FeatureCard 
                    icon={Database}
                    title="Price Feeds"
                    description="Real-time property valuations from verified data sources."
                  />
                  <FeatureCard 
                    icon={Shield}
                    title="Proof of Reserve"
                    description="Verification that USDC reserves match token obligations."
                  />
                  <FeatureCard 
                    icon={RefreshCw}
                    title="Automation"
                    description="Automatic phase advancement based on engagement thresholds."
                  />
                  <FeatureCard 
                    icon={Globe}
                    title="Cross-Chain"
                    description="CCIP for future multi-chain token bridging."
                  />
                </div>
              </Section>

              <div className="divider-gradient" />

              <Section id="governance" title="DAO Governance" icon={Vote} alternate>
                <Subsection title="Voting Power Multipliers">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Voting power is weighted by purchase phase, amplifying local community voices in governance decisions.
                  </p>
                  <div className="rounded-xl border overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Phase</th>
                          <th className="text-left p-4 font-semibold">Multiplier</th>
                          <th className="text-left p-4 font-semibold">Rationale</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-medium">County</td>
                          <td className="p-4 text-primary font-semibold">1.5x</td>
                          <td className="p-4 text-muted-foreground">Local stakeholders shape outcomes</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">State</td>
                          <td className="p-4">1.25x</td>
                          <td className="p-4 text-muted-foreground">Regional context understanding</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">National</td>
                          <td className="p-4">1.0x</td>
                          <td className="p-4 text-muted-foreground">Standard voting weight</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">International</td>
                          <td className="p-4">0.75x</td>
                          <td className="p-4 text-muted-foreground">Defers to local expertise</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <p className="text-sm">
                      <strong>Example:</strong> Alice (county resident) with 100 tokens = 150 voting power. 
                      Bob (international) with 100 tokens = 75 voting power. Local voices are amplified.
                    </p>
                  </div>
                </Subsection>

                <Subsection title="Smart Contract Implementation">
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
                </Subsection>

                <Subsection title="Gasless Voting (EIP-712)">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Lower-income investors can participate in governance without paying gas fees. 
                    Using EIP-712 signature verification, investors sign their votes off-chain and 
                    authorized relayers submit them to the blockchain on their behalf.
                  </p>

                  <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 mb-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Financial Inclusion by Design
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Gas fees on Ethereum mainnet can exceed $5-20 per transaction, making voting prohibitively expensive 
                      for small token holders. Our gasless voting system ensures <strong className="text-foreground">every investor's voice is heard</strong>, 
                      regardless of their holdings size.
                    </p>
                  </div>

                  <CodeBlock 
                    title="Governance.sol - Gasless Voting via Signatures"
                    code={`// EIP-712 typed data for secure off-chain voting
bytes32 public constant VOTE_TYPEHASH = keccak256(
    "Vote(uint256 proposalId,uint8 support,address voter,uint256 nonce,uint256 deadline)"
);

function castVoteBySignature(
    uint256 proposalId,
    uint8 support,       // 0=against, 1=for, 2=abstain
    address voter,       // Voter signs off-chain
    uint256 deadline,
    uint8 v, bytes32 r, bytes32 s
) external onlyRole(RELAYER_ROLE) nonReentrant {
    require(block.timestamp <= deadline, "Signature expired");
    
    uint256 currentNonce = nonces[voter];
    nonces[voter]++; // Increment nonce to prevent replay
    
    // Verify signature matches voter
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
                        <p className="text-xs text-muted-foreground mt-1">Nonce-based signature tracking</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Deadline Expiry</span>
                        <p className="text-xs text-muted-foreground mt-1">Signatures expire for security</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">RELAYER_ROLE</span>
                        <p className="text-xs text-muted-foreground mt-1">Authorized submitters only</p>
                      </div>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Community Polls (Demand Gauges)">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Before formal proposals, community members can create lightweight polls to gauge demand for potential 
                    property listings or development ideas. Polls are non-binding but provide valuable market signals.
                  </p>

                  <div className="rounded-2xl border-2 border-chart-3/20 bg-chart-3/5 p-6 mb-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-chart-3" />
                      Poll-to-Proposal Pipeline
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Polls with <strong className="text-foreground">&gt;30% support</strong> can be converted into formal governance proposals 
                      with a <strong className="text-foreground">5% quorum reduction bonus</strong>. This incentivizes community 
                      engagement while ensuring popular ideas get fast-tracked.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Poll Features</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• No token holdings required to create polls</li>
                        <li>• 1-30 day configurable duration</li>
                        <li>• Simple yes/no voting</li>
                        <li>• Property-specific or platform-wide</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2">Poll Bonuses</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Poll voters get 0.5x engagement credit</li>
                        <li>• 2x bonus tokens for poll participants</li>
                        <li>• High-demand polls boost funding targets</li>
                        <li>• Dynamic pricing for popular properties</li>
                      </ul>
                    </div>
                  </div>

                  <CodeBlock 
                    title="Governance.sol - Poll-to-Proposal Conversion"
                    code={`// Polls with >30% support get 5% quorum bonus when converted
uint256 public constant POLL_PROPOSAL_THRESHOLD = 3000; // 30%
uint256 public constant POLL_QUORUM_BONUS = 500; // 5% reduction

function createProposalFromPoll(
    uint256 pollId,
    ProposalType proposalType,
    bytes memory executionData
) external onlyRole(PROPOSER_ROLE) returns (uint256) {
    Poll storage poll = polls[pollId];
    require(poll.status == PollStatus.Ended, "Poll must be ended first");
    
    uint256 totalVotes = poll.votesFor + poll.votesAgainst;
    uint256 supportPercent = (poll.votesFor * 10000) / totalVotes;
    require(supportPercent >= POLL_PROPOSAL_THRESHOLD, "Insufficient support");
    
    // Apply quorum bonus for poll-backed proposals
    uint256 adjustedQuorum = baseQuorum - POLL_QUORUM_BONUS;
    
    // Create proposal with reduced quorum requirement
    // ... proposal creation with poll.question as title
}`}
                  />
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="protection" title="Investor Protections" icon={Shield}>
                <Subsection title="Refund Guarantee">
                  <p className="leading-relaxed mb-4 text-muted-foreground">
                    If 100% funding target not reached within 1 year:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Automatic refunds with 3% APR from USDC escrow</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Option to transfer to follow-on offerings</span>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="2-of-3 Multi-Sig Treasury">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Operational disbursements from the Treasury require approval from 2 of 3 designated signers, 
                    providing institutional-grade security against unauthorized fund transfers.
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
                          <td className="p-4 text-primary font-mono text-xs">submitTransaction()</td>
                          <td className="p-4 text-muted-foreground">Signer proposes a disbursement</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">2</td>
                          <td className="p-4 text-primary font-mono text-xs">confirmTransaction()</td>
                          <td className="p-4 text-muted-foreground">Second signer reviews and approves</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">3</td>
                          <td className="p-4 text-primary font-mono text-xs">executeTransaction()</td>
                          <td className="p-4 text-muted-foreground">With 2 confirmations, funds are released</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <CodeBlock 
                    title="Treasury.sol - Multi-Sig Execution"
                    code={`uint256 public requiredConfirmations = 2; // Configurable 2-of-3 default
uint256 public constant FOUNDER_CUT_BPS = 100; // 1% founder cut

function executeTransaction(uint256 txId) external onlyRole(SIGNER_ROLE) {
    Transaction storage txn = transactions[txId];
    require(!txn.executed, "Transaction already executed");
    require(txn.confirmationCount >= requiredConfirmations, "Not enough confirmations");
    require(address(this).balance >= txn.value, "Insufficient treasury balance");
    
    txn.executed = true;
    
    // Calculate and transfer founder cut
    uint256 founderCut = (txn.value * FOUNDER_CUT_BPS) / 10000;
    uint256 remaining = txn.value - founderCut;
    
    payable(founderWallet).transfer(founderCut);
    (bool success, ) = txn.target.call{value: remaining}(txn.data);
    require(success, "Transaction failed");
    
    emit TransactionExecuted(txId, msg.sender);
}`}
                  />

                  <div className="p-4 rounded-xl bg-muted/30 border mt-6">
                    <p className="text-sm">
                      <strong>Dual Execution Paths:</strong> Multi-sig protects operational funds, while DAO-approved proposals 
                      execute directly through the Governance contract (which holds EXECUTOR_ROLE). This provides both 
                      security and democratic governance.
                    </p>
                  </div>
                </Subsection>

                <Subsection title="Founder Vesting & Relayer Subsidies">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    The 1% founder sustainability fee vests over 24 months with a 3-month cliff, ensuring long-term 
                    alignment with investor interests. The Treasury also subsidizes gasless voting through relayer reimbursements.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        24-Month Vesting
                      </h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• 3-month cliff before any claims</li>
                        <li>• Linear vesting after cliff</li>
                        <li>• Founder can claim accrued cuts monthly</li>
                        <li>• Aligns incentives with platform success</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-chart-3" />
                        Relayer Reimbursement Pool
                      </h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Treasury funds gasless voting subsidies</li>
                        <li>• Max 0.01 ETH per transaction</li>
                        <li>• Reimburses authorized relayers</li>
                        <li>• Ensures financial inclusion for all voters</li>
                      </ul>
                    </div>
                  </div>

                  <CodeBlock 
                    title="Treasury.sol - Vesting Schedule"
                    code={`uint256 public constant VESTING_PERIOD = 730 days; // 24 months
uint256 public constant VESTING_CLIFF = 90 days; // 3 month cliff

function getClaimableVested(address founder) public view returns (uint256) {
    if (vestingStart[founder] == 0) return 0;
    
    uint256 elapsed = block.timestamp - vestingStart[founder];
    if (elapsed < VESTING_CLIFF) return 0;
    
    uint256 totalVested = vestedCuts[founder];
    uint256 vestedAmount = elapsed >= VESTING_PERIOD 
        ? totalVested 
        : (totalVested * elapsed) / VESTING_PERIOD;
    
    return vestedAmount - claimedCuts[founder];
}`}
                  />
                </Subsection>

                <Subsection title="Additional Security Measures">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Multi-signature cold storage for all assets</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Third-party smart contract audits</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Link2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Chainlink Proof of Reserve verification</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Coins className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Buyback reserve for market stability</span>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="Transfer Lock Implementation">
                  <CodeBlock 
                    title="PropertyToken.sol - Transfer Locks During Funding"
                    code={`function _update(
    address from, address to, 
    uint256[] memory ids, uint256[] memory values
) internal override {
    for (uint256 i = 0; i < ids.length; i++) {
        uint256 propertyId = ids[i];
        
        // Block transfers during funding period (investor protection)
        if (from != address(0) && to != address(0)) {
            require(properties[propertyId].isFunded, 
                "Transfers locked during funding");
            require(whitelistedAddresses[to] != WhitelistStatus.None,
                "Recipient not whitelisted");
        }
    }
    super._update(from, to, ids, values);
}`}
                  />
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="compliance" title="Regulatory Compliance" icon={CheckCircle2} alternate>
                <Subsection title="Securities Framework">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation D (506c)</span>
                        <p className="text-sm text-muted-foreground">Accredited investors, general solicitation permitted</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation A+ (Tier 2)</span>
                        <p className="text-sm text-muted-foreground">Up to $75M annually, non-accredited investors welcome</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation CF</span>
                        <p className="text-sm text-muted-foreground">Crowdfunding via Republic Crypto up to $5M</p>
                      </div>
                    </div>
                  </div>
                </Subsection>

                <Subsection title="KYC/AML Requirements">
                  <ul className="space-y-2 mb-6">
                    {[
                      "Government-issued ID verification",
                      "Address verification (determines phase eligibility)",
                      "Accreditation verification (for Reg D)",
                      "OFAC sanctions screening"
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
                    Every transaction emits compliance events that create an immutable audit trail for regulatory reporting. 
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
                          <td className="p-4 font-mono text-xs text-primary">ComplianceCheckpoint</td>
                          <td className="p-4 text-muted-foreground">Periodic audits</td>
                          <td className="p-4 text-muted-foreground">totalHolders, totalSupplyMinted, timestamp</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <CodeBlock 
                    title="Escrow.sol - Compliance Events on Purchase"
                    code={`event CompliancePurchaseRecorded(
    uint256 indexed propertyId, address indexed buyer,
    uint256 amount, uint256 totalPaid, bytes32 transactionHash
);

event InvestorLimitChecked(
    uint256 indexed propertyId, address indexed investor,
    uint256 currentContribution, uint256 newContribution, bool withinLimit
);

// Emitted in purchase() for regulatory audit trail
emit CompliancePurchaseRecorded(
    propertyId, msg.sender, tokenAmount, totalPaid,
    keccak256(abi.encodePacked(block.number, msg.sender, propertyId))
);

emit InvestorLimitChecked(
    propertyId, msg.sender, previousContribution, contributions[propertyId][msg.sender], withinLimit
);`}
                  />

                  <div className="p-4 rounded-xl bg-chart-3/5 border border-chart-3/20 mt-6">
                    <p className="text-sm">
                      <strong>Audit Functions:</strong> Compliance officers can call <code className="text-xs bg-muted px-1 py-0.5 rounded">getPurchaseForAudit()</code> and 
                      <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">getInvestorContribution()</code> to retrieve detailed transaction data for regulatory examinations.
                    </p>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="technical" title="Technical Architecture" icon={Code}>
                <Subsection title="Escrow & Token Transfer">
                  <CodeBlock 
                    title="Escrow.sol - Purchase & Refund with Token Burning"
                    code={`function purchase(uint256 propertyId, uint256 tokenAmount) 
    external payable nonReentrant 
{
    require(block.timestamp <= escrows[propertyId].deadline);
    uint256 price = propertyToken.getCurrentPrice(propertyId);
    require(msg.value >= price * tokenAmount);
    
    // Mint tokens to buyer
    propertyToken.mintTokens(propertyId, msg.sender, tokenAmount);
    contributions[propertyId][msg.sender] += msg.value;
    emit Purchase(propertyId, msg.sender, tokenAmount, msg.value);
}

function processRefunds(uint256 propertyId) external nonReentrant {
    require(block.timestamp > escrows[propertyId].deadline);
    require(!escrows[propertyId].funded); // Must have failed funding
    
    for (uint i = 0; i < contributors[propertyId].length; i++) {
        address investor = contributors[propertyId][i];
        uint256 principal = contributions[propertyId][investor];
        uint256 interest = (principal * 300 * daysHeld) / 36500 / 100;
        
        // Burn tokens before refund
        propertyToken.burnFromOnFailure(propertyId, investor);
        payable(investor).transfer(principal + interest);
    }
}`}
                  />
                </Subsection>

                <Subsection title="Security Practices">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Multi-party computation for key management",
                      "Third-party security audits",
                      "Bug bounty program (up to $100,000)",
                      "Formal verification of critical logic",
                      "24/7 monitoring and incident response",
                      "OpenZeppelin v5.0 security libraries"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="tokenomics" title="Tokenomics" icon={Database} alternate>
                <Subsection title="RVTA Governance Token">
                  <p className="leading-relaxed mb-6 text-muted-foreground">
                    Total Supply: <strong className="text-foreground">100,000,000 RVTA</strong> (fixed, no inflation)
                  </p>
                  
                  <div className="rounded-xl border overflow-hidden mb-8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold">Allocation</th>
                          <th className="text-left p-4 font-semibold">%</th>
                          <th className="text-left p-4 font-semibold">Vesting</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Community Treasury</td>
                          <td className="p-4 text-primary font-semibold">40%</td>
                          <td className="p-4 text-muted-foreground">DAO-controlled</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Investor Airdrop</td>
                          <td className="p-4">20%</td>
                          <td className="p-4 text-muted-foreground">Based on investment history</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Team & Advisors</td>
                          <td className="p-4">15%</td>
                          <td className="p-4 text-muted-foreground">4-year, 1-year cliff</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Development Fund</td>
                          <td className="p-4">12%</td>
                          <td className="p-4 text-muted-foreground">Milestone-based</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Chainlink/Canton</td>
                          <td className="p-4">5%</td>
                          <td className="p-4 text-muted-foreground">Ecosystem incentives</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Liquidity</td>
                          <td className="p-4">8%</td>
                          <td className="p-4 text-muted-foreground">DEX provision</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="Fee Structure">
                  <div className="rounded-xl border overflow-hidden">
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
                          <td className="p-4 text-muted-foreground">Treasury + stakers</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Secondary Trading</td>
                          <td className="p-4">1.0%</td>
                          <td className="p-4 text-muted-foreground">50% protocol, 50% property DAO</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-4 font-medium">Asset Management</td>
                          <td className="p-4">1.5%/year</td>
                          <td className="p-4 text-muted-foreground">Property operations</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>
              </Section>

              <div className="divider-gradient" />

              <Section id="risks" title="Risk Factors" icon={AlertTriangle}>
                <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <h4 className="font-semibold">Important Disclosures</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prospective investors should carefully consider the following risks. Consult financial and legal advisors before investing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Market Risk", desc: "Real estate values fluctuate based on economic conditions." },
                    { title: "Liquidity Risk", desc: "Secondary market may have limited trading volume." },
                    { title: "Regulatory Risk", desc: "Securities laws may change affecting token status." },
                    { title: "Technology Risk", desc: "Smart contracts may contain undiscovered vulnerabilities." },
                    { title: "Development Risk", desc: "Projects may face delays or cost overruns." },
                    { title: "Counterparty Risk", desc: "Third-party service providers may fail to perform." },
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

              <Section id="roadmap" title="Roadmap" icon={Calendar} alternate>
                <div className="space-y-6">
                  {[
                    { quarter: "Q1 2026", status: "current", items: ["Smart contract development", "Chainlink Build integration", "Security audits"] },
                    { quarter: "Q2 2026", status: "upcoming", items: ["Platform beta launch", "First property tokenization", "Community governance activation"] },
                    { quarter: "Q3 2026", status: "upcoming", items: ["Reg A+ qualification", "Mobile app development", "Multi-property expansion"] },
                    { quarter: "Q4 2026", status: "upcoming", items: ["RVTA governance token launch", "Cross-chain deployment", "International expansion planning"] },
                  ].map((phase, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          phase.status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        {i < 3 && <div className="w-0.5 h-full bg-border mt-2" />}
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{phase.quarter}</span>
                          {phase.status === 'current' && <Badge>Current</Badge>}
                        </div>
                        <ul className="space-y-1">
                          {phase.items.map((item, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ChevronRight className="h-3 w-3" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="py-16 text-center">
                <p className="text-muted-foreground mb-6">
                  Ready to transform vacant properties into community assets?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button size="lg" asChild>
                    <a href="https://buildourcommunity.co" target="_blank" rel="noopener noreferrer">
                      Join Waitlist
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="https://chain.link/build-program" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Chainlink Build Program
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
