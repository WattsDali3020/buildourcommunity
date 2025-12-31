import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Eye
} from "lucide-react";

const tableOfContents = [
  { id: "executive", title: "1. Executive Summary" },
  { id: "problem", title: "2. Problem Statement" },
  { id: "market", title: "3. Market Analysis" },
  { id: "solution", title: "4. Solution Overview" },
  { id: "ai-governance", title: "5. AI-Nudged Governance" },
  { id: "architecture", title: "6. Platform Architecture" },
  { id: "tokenization", title: "7. Tokenization Model" },
  { id: "offering", title: "8. Community-First Offering" },
  { id: "chainlink", title: "9. Chainlink & Canton Integration" },
  { id: "governance", title: "10. Governance & DAO" },
  { id: "protection", title: "11. Investor Protections" },
  { id: "compliance", title: "12. Regulatory Compliance" },
  { id: "technical", title: "13. Technical Architecture" },
  { id: "tokenomics", title: "14. Tokenomics" },
  { id: "risks", title: "15. Risk Factors" },
  { id: "roadmap", title: "16. Roadmap" },
  { id: "team", title: "17. Team" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <h2 className="text-2xl lg:text-3xl font-bold mb-6">{title}</h2>
      {children}
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Litepaper() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-muted/30 py-16 lg:py-24 print:py-8 print:bg-white">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4 print:hidden">
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Technical Litepaper</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4" data-testid="litepaper-title">
                Ownership in Every Acre
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Tokenizing Communities for Lasting Growth
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Version 1.1 | December 2025
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                Beta Prototype - Join the waitlist at buildourcommunity.co
              </p>
              <div className="flex items-center justify-center gap-4 print:hidden">
                <Button onClick={handlePrint} variant="outline" data-testid="button-download-pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="ghost" asChild>
                  <a href="https://chain.link/build-program" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Chainlink Build Program
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <nav className="lg:w-64 flex-shrink-0 print:hidden">
              <div className="lg:sticky lg:top-24">
                <h3 className="font-semibold mb-4">Table of Contents</h3>
                <ul className="space-y-2">
                  {tableOfContents.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`toc-${item.id}`}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <article className="flex-1 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:scroll-mt-24">
              <Section id="executive" title="1. Executive Summary">
                <p className="text-lg leading-relaxed mb-6">
                  RevitaHub is a blockchain-powered platform revolutionizing real estate revitalization by enabling community-led fractional ownership of vacant properties. Starting at just <span className="font-bold">$12.50 per token</span>, investors gain equity, voting rights, and quarterly dividends (avg. 8.2% annual returns) in projects transforming blighted assets into thriving community developments.
                </p>
                <Card className="bg-primary/5 border-primary/20 mb-6">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">$12.50</p>
                        <p className="text-xs text-muted-foreground">Min. Investment</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">8.2%</p>
                        <p className="text-xs text-muted-foreground">Target Annual Returns</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">4-Phase</p>
                        <p className="text-xs text-muted-foreground">Community-First Offering</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">3% APR</p>
                        <p className="text-xs text-muted-foreground">Refund Protection</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Key Differentiators</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>4-phase community-first distribution with local investor priority</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Voting multipliers amplifying local influence (1.5x for county residents)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Chainlink-powered valuations and proof of reserve verification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>100% funding threshold with 3% APR refunds on failed offerings</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Section>

              <Separator className="my-12" />

              <Section id="problem" title="2. Problem Statement">
                <Subsection title="2.1 The Vacant Property Crisis">
                  <p className="leading-relaxed mb-4">
                    Across the United States, 17+ million vacant properties represent $500B in lost value (HUD data). These abandoned lots drain municipal resources while communities lack capital mechanisms to transform them.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">17M+</p>
                        <p className="text-sm text-muted-foreground">Vacant Properties</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">$500B</p>
                        <p className="text-sm text-muted-foreground">Lost Value</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">3,000+</p>
                        <p className="text-sm text-muted-foreground">Counties Affected</p>
                      </CardContent>
                    </Card>
                  </div>
                </Subsection>

                <Subsection title="2.2 Barriers to Community Investment">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm font-medium">1</span>
                      </div>
                      <div>
                        <span className="font-medium">High Capital Requirements:</span>
                        <span className="text-muted-foreground"> $25K-$100K+ minimums exclude 90% of Americans.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm font-medium">2</span>
                      </div>
                      <div>
                        <span className="font-medium">Illiquidity:</span>
                        <span className="text-muted-foreground"> 5-10 year lock-ups with no secondary market.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm font-medium">3</span>
                      </div>
                      <div>
                        <span className="font-medium">No Voice:</span>
                        <span className="text-muted-foreground"> Communities lack input on development, leading to gentrification.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="market" title="3. Market Analysis">
                <Subsection title="3.1 RWA Market Growth">
                  <p className="leading-relaxed mb-4">
                    The tokenized real estate market is experiencing explosive growth, with Real World Assets (RWAs) reaching $30B in 2025 and projected to hit <span className="font-bold">$10 trillion by 2030</span> (Boston Consulting Group). ESG-focused investments are up 42% YoY, with rising demand for community-driven developments.
                  </p>
                  <Card className="bg-chart-2/10 border-chart-2/30 mb-6">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                          <p className="text-2xl font-bold">$30B</p>
                          <p className="text-xs text-muted-foreground">RWA Market 2025</p>
                        </div>
                        <div>
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                          <p className="text-2xl font-bold">$10T</p>
                          <p className="text-xs text-muted-foreground">Projected by 2030</p>
                        </div>
                        <div>
                          <Target className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                          <p className="text-2xl font-bold">42%</p>
                          <p className="text-xs text-muted-foreground">ESG Growth YoY</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Subsection>

                <Subsection title="3.2 Competitive Landscape">
                  <p className="leading-relaxed mb-4">
                    Platforms like RealT, Propy, and Lofty focus on fractional ownership but lack deep community governance. RevitaHub differentiates with:
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Feature</th>
                          <th className="text-left p-3 border-b">RevitaHub</th>
                          <th className="text-left p-3 border-b">Competitors</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">Min. Investment</td>
                          <td className="p-3 border-b text-primary font-semibold">$12.50</td>
                          <td className="p-3 border-b text-muted-foreground">$50-$100+</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Community Governance</td>
                          <td className="p-3 border-b text-primary font-semibold">DAO with voting multipliers</td>
                          <td className="p-3 border-b text-muted-foreground">Limited or none</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Local Priority</td>
                          <td className="p-3 border-b text-primary font-semibold">4-phase system</td>
                          <td className="p-3 border-b text-muted-foreground">First-come basis</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Investor Protection</td>
                          <td className="p-3 text-primary font-semibold">3% APR refunds</td>
                          <td className="p-3 text-muted-foreground">Varies</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="3.3 Competitive Advantage">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">vs. Centralized REITs:</span>
                        <span className="text-muted-foreground"> On-chain transparency, community voting, lower fees</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">vs. Other RWA Platforms:</span>
                        <span className="text-muted-foreground"> Local voting multipliers, community nomination system</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Social Impact:</span>
                        <span className="text-muted-foreground"> Web3 REIT for the people with measurable community benefits</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="solution" title="4. Solution Overview">
                <p className="text-lg leading-relaxed mb-6">
                  RevitaHub combines blockchain tokenization, oracle-verified data, and community-first governance to create an accessible, transparent real estate investment platform.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                        <Coins className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Fractional Ownership</h4>
                      <p className="text-sm text-muted-foreground">
                        ERC-1155 tokens with $12.50 minimum, full ownership rights and quarterly dividends.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                        <Link2 className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Oracle Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainlink provides tamper-proof valuations and automated dividend calculations.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                        <Vote className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">DAO Governance</h4>
                      <p className="text-sm text-muted-foreground">
                        Token holders vote on development with community multipliers amplifying local voices.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Investor Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        Failed funding triggers automatic 3% APR refunds from USDC escrow.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Subsection title="4.1 How It Works">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">1</div>
                      <div>
                        <p className="font-medium">Nomination & Verification</p>
                        <p className="text-sm text-muted-foreground">Community nominates properties; Chainlink verifies ownership from county registries.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">2</div>
                      <div>
                        <p className="font-medium">Tokenization & Phased Offering</p>
                        <p className="text-sm text-muted-foreground">ERC-1155 tokens created with 4-phase offering prioritizing local investors.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">3</div>
                      <div>
                        <p className="font-medium">Governance</p>
                        <p className="text-sm text-muted-foreground">Token holders vote on development plans with phase-based voting multipliers.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">4</div>
                      <div>
                        <p className="font-medium">Development & Returns</p>
                        <p className="text-sm text-muted-foreground">Properties developed per community votes; quarterly dividends distributed automatically.</p>
                      </div>
                    </li>
                  </ol>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="ai-governance" title="5. AI-Nudged Governance">
                <p className="text-lg leading-relaxed mb-6">
                  RevitaHub pioneers the integration of AI with DAO governance—creating an "AI-Nudged RevitalDAO" that detects bias, prevents whale manipulation, and optimizes community engagement through behavioral economics.
                </p>

                <Card className="bg-primary/5 border-primary/20 mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-semibold">Novel AI + DAO Combination</h4>
                        <p className="text-sm text-muted-foreground">First real estate platform combining AI governance with community tokenization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Subsection title="5.1 Theoretical Framework">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">Boden Combination</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI + DAO creates novel governance structures. AI moderates voting to detect biases and suggests balanced options—a new combination in real estate investment.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-5 w-5 text-chart-2" />
                          <h4 className="font-semibold">Behavioral Economics</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Nudges like "Vote to earn bonus APR" fix herding behavior and overconfidence. Gentle prompts increase participation without manipulation.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-5 w-5 text-chart-3" />
                          <h4 className="font-semibold">Complexity Theory</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI balances the system at the "edge of chaos"—enough structure for stability, enough flexibility for innovation and community-driven adaptation.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-chart-4" />
                          <h4 className="font-semibold">Tipping Point Acceleration</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Nudges accelerate adoption past critical thresholds. Once participation reaches tipping points, network effects compound community growth.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </Subsection>

                <Subsection title="5.2 AI Bias Detection">
                  <p className="leading-relaxed mb-4">
                    The AI governance engine continuously monitors voting patterns to identify and mitigate biases:
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Herding Detection:</span>
                        <span className="text-muted-foreground"> Identifies when early votes disproportionately influence later voters</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Whale Prediction:</span>
                        <span className="text-muted-foreground"> AI monitors concentration risk and potential manipulation attempts</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Vote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Balanced Options:</span>
                        <span className="text-muted-foreground"> Suggests alternative proposals when voting shows extreme polarization</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="5.3 Behavioral Nudges">
                  <p className="leading-relaxed mb-4">
                    Strategic prompts increase participation while respecting user autonomy:
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Nudge Type</th>
                          <th className="text-left p-3 border-b">Trigger</th>
                          <th className="text-left p-3 border-b">Expected Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">Vote-to-Earn</td>
                          <td className="p-3 border-b text-muted-foreground">Active proposal, user hasn't voted</td>
                          <td className="p-3 border-b text-primary font-semibold">+0.5% bonus APR</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Milestone Alert</td>
                          <td className="p-3 border-b text-muted-foreground">Near quorum threshold</td>
                          <td className="p-3 border-b text-primary font-semibold">+52% participation</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Phase Closing</td>
                          <td className="p-3 border-b text-muted-foreground">3 days before phase ends</td>
                          <td className="p-3 border-b text-primary font-semibold">+34% investment</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Community Bonus</td>
                          <td className="p-3 text-muted-foreground">Monthly active participation</td>
                          <td className="p-3 text-primary font-semibold">+1.2% APR</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="5.4 Dynamic Phase Advancement">
                  <p className="leading-relaxed mb-4">
                    Unlike fixed timelines, phases advance based on real engagement metrics:
                  </p>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-sm mb-3">
                        <span className="font-medium">Engagement Threshold:</span> Phase advances when 75% of token holders have participated in governance OR allocation is fully subscribed.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This data-driven approach ensures phases advance when communities are ready, not on arbitrary timelines. High-engagement properties move faster; slower properties get additional nudge support.
                      </p>
                    </CardContent>
                  </Card>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="architecture" title="6. Platform Architecture">
                <p className="leading-relaxed mb-6">
                  Hybrid on-chain/off-chain architecture combining smart contracts with traditional infrastructure for regulatory compliance.
                </p>

                <Subsection title="6.1 On-Chain Components">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">ERC-1155 Property Tokens:</span>
                        <span className="text-muted-foreground"> Fractional ownership with dividend distribution and transfer restrictions.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Vote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Governance Contracts:</span>
                        <span className="text-muted-foreground"> Token-weighted voting with phase-based multipliers.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Multi-Sig Treasuries:</span>
                        <span className="text-muted-foreground"> Escrow holding acquisition funds with milestone-based release.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Dividend Automation:</span>
                        <span className="text-muted-foreground"> Quarterly distributions via Chainlink Automation.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="6.2 Off-Chain Infrastructure">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">PostgreSQL:</span>
                        <span className="text-muted-foreground"> Property metadata, documents, images.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">KYC APIs:</span>
                        <span className="text-muted-foreground"> Identity verification with licensed providers.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">RESTful Gateway:</span>
                        <span className="text-muted-foreground"> API serving property data and user dashboards.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="6.3 Multi-Chain Strategy">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm">
                        Deploy on <span className="font-medium">Base</span> (low fees) with Chainlink CCIP for cross-chain expansion. Canton Network integration enables institutional-grade privacy for enterprise partnerships.
                      </p>
                    </CardContent>
                  </Card>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="tokenization" title="7. Tokenization Model">
                <Subsection title="7.1 Property Token Structure">
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Attribute</th>
                          <th className="text-left p-3 border-b">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">Standard</td>
                          <td className="p-3 border-b text-muted-foreground">ERC-1155 with ERC-1400 security extensions</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Supply</td>
                          <td className="p-3 border-b text-muted-foreground">Fixed per property valuation</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Min. Investment</td>
                          <td className="p-3 border-b text-muted-foreground">$12.50 (Phase 1)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Restrictions</td>
                          <td className="p-3 text-muted-foreground">KYC-gated transfers, whitelist-only</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="7.2 Pricing for Financial Inclusion">
                  <p className="leading-relaxed mb-4">
                    $12.50 base price rewards early community risk. Phases markup 50% progressively:
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Phase</th>
                          <th className="text-left p-3 border-b">Base</th>
                          <th className="text-left p-3 border-b">Multiplier</th>
                          <th className="text-left p-3 border-b">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">County</td>
                          <td className="p-3 border-b text-muted-foreground">$12.50</td>
                          <td className="p-3 border-b text-muted-foreground">1.0x</td>
                          <td className="p-3 border-b font-semibold text-primary">$12.50</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">State</td>
                          <td className="p-3 border-b text-muted-foreground">$12.50</td>
                          <td className="p-3 border-b text-muted-foreground">1.5x</td>
                          <td className="p-3 border-b font-semibold">$18.75</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">National</td>
                          <td className="p-3 border-b text-muted-foreground">$12.50</td>
                          <td className="p-3 border-b text-muted-foreground">2.25x</td>
                          <td className="p-3 border-b font-semibold">$28.13</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">International</td>
                          <td className="p-3 text-muted-foreground">$12.50</td>
                          <td className="p-3 text-muted-foreground">3.0x</td>
                          <td className="p-3 font-semibold">$37.50</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Example:</span> A $500K property creates ~21,767 tokens at weighted average price of $22.97.
                      </p>
                    </CardContent>
                  </Card>
                </Subsection>

                <Subsection title="7.3 Property Types">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Vacant Land</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Historic Buildings</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Commercial</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Mixed-Use</p>
                      </CardContent>
                    </Card>
                  </div>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="offering" title="8. Community-First Token Offering">
                <Subsection title="8.1 Phase Structure">
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Phase</th>
                          <th className="text-left p-3 border-b">Price</th>
                          <th className="text-left p-3 border-b">Limit/Person</th>
                          <th className="text-left p-3 border-b">Voting Power</th>
                          <th className="text-left p-3 border-b">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-primary/5">
                          <td className="p-3 border-b font-medium">County</td>
                          <td className="p-3 border-b">$12.50</td>
                          <td className="p-3 border-b">100</td>
                          <td className="p-3 border-b text-primary font-semibold">1.5x</td>
                          <td className="p-3 border-b">30 days</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">State</td>
                          <td className="p-3 border-b">$18.75</td>
                          <td className="p-3 border-b">250</td>
                          <td className="p-3 border-b">1.25x</td>
                          <td className="p-3 border-b">30 days</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">National</td>
                          <td className="p-3 border-b">$28.13</td>
                          <td className="p-3 border-b">500</td>
                          <td className="p-3 border-b">1.0x</td>
                          <td className="p-3 border-b">60 days</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">International</td>
                          <td className="p-3">$37.50</td>
                          <td className="p-3">1,000</td>
                          <td className="p-3">0.75x</td>
                          <td className="p-3">90 days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Card className="bg-chart-5/10 border-chart-5/30 mb-6">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-chart-5" />
                        Private Offering Mode
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Separate from public phases, property owners can create invite-only offerings with custom terms via email invites and access codes.
                      </p>
                    </CardContent>
                  </Card>
                </Subsection>

                <Subsection title="8.2 Phase Advancement">
                  <p className="leading-relaxed mb-4">
                    Chainlink Automation triggers phase advancement when:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Current phase allocation fully subscribed</li>
                    <li>Phase time limit expires</li>
                  </ul>
                </Subsection>

                <Subsection title="8.3 Funding & Investor Protection">
                  <Card className="bg-primary/5 border-primary/20 mb-4">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        100% Funding Threshold
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        1-year deadline. Loans only issued when 100% target reached—no dilution guarantee.
                      </p>
                      <div className="bg-background p-4 rounded-md mb-3">
                        <p className="text-sm font-mono text-center">
                          Refund = P + (P × 0.03 × D/365)
                        </p>
                      </div>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                        <li><span className="font-medium text-foreground">Success:</span> Funds released, investors receive property tokens</li>
                        <li><span className="font-medium text-foreground">Failure:</span> Automatic refunds with 3% APR interest</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="chainlink" title="9. Chainlink & Canton Integration">
                <Card className="bg-primary/5 border-primary/20 mb-8">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-primary" />
                      Chainlink Build Program
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      RevitaHub allocates 3% token supply and 10% network fees to Chainlink ecosystem.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-2xl font-bold text-primary">3%</p>
                        <p className="text-xs text-muted-foreground">Token Supply</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-2xl font-bold text-primary">10%</p>
                        <p className="text-xs text-muted-foreground">Network Fees</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Subsection title="9.1 Chainlink Services">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <TrendingUp className="h-6 w-6 text-primary mb-2" />
                        <h4 className="font-medium mb-1">Data Feeds</h4>
                        <p className="text-sm text-muted-foreground">Real-time property valuations from 3+ independent sources</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Shield className="h-6 w-6 text-primary mb-2" />
                        <h4 className="font-medium mb-1">Proof of Reserve</h4>
                        <p className="text-sm text-muted-foreground">Cryptographic verification of asset backing</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Zap className="h-6 w-6 text-primary mb-2" />
                        <h4 className="font-medium mb-1">Functions</h4>
                        <p className="text-sm text-muted-foreground">Secure off-chain data from county registries</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <RefreshCw className="h-6 w-6 text-primary mb-2" />
                        <h4 className="font-medium mb-1">Automation</h4>
                        <p className="text-sm text-muted-foreground">Dividends, phase advancement, refund triggers</p>
                      </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                      <CardContent className="p-4">
                        <Globe className="h-6 w-6 text-primary mb-2" />
                        <h4 className="font-medium mb-1">CCIP</h4>
                        <p className="text-sm text-muted-foreground">Cross-chain token transfers and unified governance across networks</p>
                      </CardContent>
                    </Card>
                  </div>
                </Subsection>

                <Subsection title="9.2 Canton Network Integration">
                  <Card className="bg-chart-2/10 border-chart-2/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Institutional-Grade Privacy</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Canton Network enables enterprise partnerships with privacy-preserving workflows:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                        <li>Daml contracts for confidential multi-party workflows</li>
                        <li>Global Synchronizer for atomic settlements</li>
                        <li>Confidential data sharing for appraisals and audits</li>
                        <li>Cross-network governance and dividend distribution</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="governance" title="10. Governance & DAO">
                <Subsection title="10.1 Voting Power">
                  <p className="leading-relaxed mb-4">
                    Voting power = Token Holdings × Phase Multiplier
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Phase</th>
                          <th className="text-left p-3 border-b">Multiplier</th>
                          <th className="text-left p-3 border-b">Rationale</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">County</td>
                          <td className="p-3 border-b text-primary font-semibold">1.5x</td>
                          <td className="p-3 border-b text-muted-foreground">Local stakeholders shape outcomes</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">State</td>
                          <td className="p-3 border-b text-primary">1.25x</td>
                          <td className="p-3 border-b text-muted-foreground">Regional context understanding</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">National</td>
                          <td className="p-3 border-b">1.0x</td>
                          <td className="p-3 border-b text-muted-foreground">Standard voting weight</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">International</td>
                          <td className="p-3">0.75x</td>
                          <td className="p-3 text-muted-foreground">Defers to local expertise</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-sm">
                        <span className="font-medium">Example:</span> Alice (county resident) with 100 tokens = 150 voting power. Bob (international) with 100 tokens = 75 voting power. Local voices are amplified.
                      </p>
                    </CardContent>
                  </Card>
                </Subsection>

                <Subsection title="10.2 Proposal Types">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Development Plans:</span>
                        <span className="text-muted-foreground"> Affordable housing, commercial, green space</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Contractor Selection:</span>
                        <span className="text-muted-foreground"> Choose from vetted developers</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Dividend Policy:</span>
                        <span className="text-muted-foreground"> Reinvestment vs. distribution ratios</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Property Sale:</span>
                        <span className="text-muted-foreground"> Major decisions requiring supermajority</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="10.3 Smart Contract Pseudocode">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Code className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">GovernanceDAO.sol</h4>
                      </div>
                      <pre className="text-xs bg-background p-4 rounded-md overflow-x-auto">
{`function castVote(uint256 proposalId, bool support) external {
    require(proposals[proposalId].deadline > block.timestamp);
    uint256 tokens = balanceOf(msg.sender, proposalId);
    uint256 multiplier = getPhaseMultiplier(msg.sender);
    uint256 votingPower = tokens * multiplier / 100;
    
    if (support) {
        proposals[proposalId].forVotes += votingPower;
    } else {
        proposals[proposalId].againstVotes += votingPower;
    }
    emit VoteCast(msg.sender, proposalId, support, votingPower);
}`}
                      </pre>
                    </CardContent>
                  </Card>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="protection" title="11. Investor Protections">
                <Subsection title="11.1 Refund Guarantee">
                  <p className="leading-relaxed mb-4">
                    If 100% funding target not reached within 1 year:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Automatic refunds with 3% APR from USDC escrow</li>
                    <li>Option to transfer to follow-on offerings</li>
                  </ul>
                </Subsection>

                <Subsection title="11.2 Security Measures">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Multi-signature cold storage for all assets</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Third-party smart contract audits</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Link2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Chainlink Proof of Reserve verification</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Coins className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Buyback reserve for market stability</span>
                    </li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="compliance" title="12. Regulatory Compliance">
                <Subsection title="12.1 Securities Framework">
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation D (506c):</span>
                        <span className="text-muted-foreground"> Accredited investors, general solicitation permitted</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation A+ (Tier 2):</span>
                        <span className="text-muted-foreground"> Up to $75M annually, non-accredited investors welcome</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation CF:</span>
                        <span className="text-muted-foreground"> Crowdfunding via Republic Crypto up to $5M</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="12.2 KYC/AML Requirements">
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Government-issued ID verification</li>
                    <li>Address verification (determines phase eligibility)</li>
                    <li>Accreditation verification (for Reg D)</li>
                    <li>OFAC sanctions screening</li>
                  </ul>
                </Subsection>

                <Subsection title="12.3 Transfer Restrictions">
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Whitelist-only transfers to verified addresses</li>
                    <li>1-year holding period for Reg D</li>
                    <li>Per-investor ownership limits</li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="technical" title="13. Technical Architecture">
                <Subsection title="13.1 Smart Contract System">
                  <Card className="border-2 border-primary/30 mb-6">
                    <CardContent className="p-6">
                      <h4 className="text-center font-bold text-lg mb-6 text-primary">Core Contracts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-md bg-primary/10 border border-primary/20 text-center">
                          <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h5 className="font-semibold text-sm">PropertyTokenFactory</h5>
                          <p className="text-xs text-muted-foreground">ERC-1155 minting</p>
                        </div>
                        <div className="p-4 rounded-md bg-chart-3/10 border border-chart-3/20 text-center">
                          <Lock className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                          <h5 className="font-semibold text-sm">FundingEscrow</h5>
                          <p className="text-xs text-muted-foreground">USDC refunds</p>
                        </div>
                        <div className="p-4 rounded-md bg-chart-1/10 border border-chart-1/20 text-center">
                          <Vote className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                          <h5 className="font-semibold text-sm">GovernanceDAO</h5>
                          <p className="text-xs text-muted-foreground">Token-weighted voting</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Subsection>

                <Subsection title="13.2 Escrow Pseudocode">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Code className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">FundingEscrow.sol</h4>
                      </div>
                      <pre className="text-xs bg-background p-4 rounded-md overflow-x-auto">
{`function invest(uint256 propertyId, uint256 amount) external {
    require(USDC.transferFrom(msg.sender, address(this), amount));
    investments[propertyId][msg.sender] += amount;
    totalFunding[propertyId] += amount;
    
    if (totalFunding[propertyId] >= fundingTarget[propertyId]) {
        _releaseFunds(propertyId);
    }
    emit Investment(msg.sender, propertyId, amount);
}

function claimRefund(uint256 propertyId) external {
    require(block.timestamp > deadline[propertyId]);
    require(totalFunding[propertyId] < fundingTarget[propertyId]);
    
    uint256 principal = investments[propertyId][msg.sender];
    uint256 interest = principal * 3 * daysHeld / 36500;
    USDC.transfer(msg.sender, principal + interest);
}`}
                      </pre>
                    </CardContent>
                  </Card>
                </Subsection>

                <Subsection title="13.3 Security Practices">
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Multi-party computation for key management</li>
                    <li>Third-party security audits</li>
                    <li>Bug bounty program (up to $100,000)</li>
                    <li>Formal verification of critical logic</li>
                    <li>24/7 monitoring and incident response</li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="tokenomics" title="14. Tokenomics">
                <Subsection title="14.1 RVTA Governance Token">
                  <p className="leading-relaxed mb-4">
                    Total Supply: <span className="font-bold">100,000,000 RVTA</span> (fixed, no inflation)
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Allocation</th>
                          <th className="text-left p-3 border-b">%</th>
                          <th className="text-left p-3 border-b">Vesting</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">Community Treasury</td>
                          <td className="p-3 border-b">40%</td>
                          <td className="p-3 border-b text-muted-foreground">DAO-controlled</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Investor Airdrop</td>
                          <td className="p-3 border-b">20%</td>
                          <td className="p-3 border-b text-muted-foreground">Based on investment history</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Team & Advisors</td>
                          <td className="p-3 border-b">15%</td>
                          <td className="p-3 border-b text-muted-foreground">4-year, 1-year cliff</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Development Fund</td>
                          <td className="p-3 border-b">12%</td>
                          <td className="p-3 border-b text-muted-foreground">Milestone-based</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Chainlink/Canton</td>
                          <td className="p-3 border-b">5%</td>
                          <td className="p-3 border-b text-muted-foreground">Ecosystem incentives</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Liquidity</td>
                          <td className="p-3">8%</td>
                          <td className="p-3 text-muted-foreground">DEX provision</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="14.2 Token Utility">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Vote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Protocol Governance:</span>
                        <span className="text-muted-foreground"> Vote on upgrades, fees, features</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Coins className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Fee Discounts:</span>
                        <span className="text-muted-foreground"> Stakers receive reduced platform fees</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Revenue Sharing:</span>
                        <span className="text-muted-foreground"> Share of protocol fees for stakers</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="14.3 Fee Structure">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Fee Type</th>
                          <th className="text-left p-3 border-b">Amount</th>
                          <th className="text-left p-3 border-b">Distribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">Primary Investment</td>
                          <td className="p-3 border-b">2.5%</td>
                          <td className="p-3 border-b text-muted-foreground">Treasury + stakers</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Secondary Trading</td>
                          <td className="p-3 border-b">1.0%</td>
                          <td className="p-3 border-b text-muted-foreground">50% protocol, 50% property DAO</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Asset Management</td>
                          <td className="p-3">1.5%/year</td>
                          <td className="p-3 text-muted-foreground">Property operations</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="14.4 Deflationary Mechanics">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Buyback & Burn:</span> 25% of platform fees used to buy back and burn RVTA, creating deflationary pressure aligned with platform growth.
                      </p>
                    </CardContent>
                  </Card>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="risks" title="15. Risk Factors">
                <Card className="bg-destructive/5 border-destructive/20 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <h4 className="font-semibold">Important Disclosures</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Prospective investors should carefully consider the following risks. Consult financial and legal advisors before investing.
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Market Risk</h4>
                      <p className="text-sm text-muted-foreground">
                        Real estate values may fluctuate; token prices may not reflect underlying asset value. Economic downturns could impact rental income and property valuations.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Regulatory Risk</h4>
                      <p className="text-sm text-muted-foreground">
                        SEC rules may change; jurisdictional bans possible. Securities regulations evolve and could affect token trading or platform operations.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Technical Risk</h4>
                      <p className="text-sm text-muted-foreground">
                        Smart contract bugs possible despite audits. Blockchain network congestion or failures could affect operations.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Liquidity Risk</h4>
                      <p className="text-sm text-muted-foreground">
                        Secondary markets may develop slowly; tokens may be difficult to sell. Transfer restrictions limit trading options.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Operational Risk</h4>
                      <p className="text-sm text-muted-foreground">
                        Development delays; property management challenges; low adoption. Platform depends on continued team execution.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </Section>

              <Separator className="my-12" />

              <Section id="roadmap" title="16. Roadmap">
                <div className="space-y-6">
                  <Card className="border-l-4 border-l-chart-3">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-chart-3" />
                        <h4 className="font-semibold">Q1 2026: MVP Launch</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-chart-3" />
                          Launch MVP with Republic Crypto raise ($1M target)
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-chart-3" />
                          First Canton Network pilot with 1 institutional partner
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-chart-3" />
                          5 pilot properties tokenized across 3 Georgia counties
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Q2-Q3 2026: Expansion</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          50 properties across 10 states; $25M tokenized
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          RVTA governance token launch
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Partner with 10 municipalities for property nominations
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-chart-2">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-chart-2" />
                        <h4 className="font-semibold">Q4 2026: Scale</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Cross-chain deployment via Chainlink CCIP
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          $100M in tokenized real estate
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Secondary trading platform live
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-chart-4">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-chart-4" />
                        <h4 className="font-semibold">2027+: Global</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          International expansion to EU/APAC
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Multi-chain presence via CCIP
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Traditional finance integrations
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </Section>

              <Separator className="my-12" />

              <Section id="team" title="17. Team">
                <Card className="bg-muted/30 mb-8">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-12 w-12 text-primary" />
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-xl font-semibold mb-1">Daniel Emery</h4>
                        <p className="text-primary font-medium mb-2">Founder & CEO</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Georgia-based entrepreneur with blockchain and real estate expertise. Founder of Build Our Community, LLC. Passionate about leveraging technology to create accessible investment opportunities for underserved communities.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 mb-8">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Advisory Positions (Seeking)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-md bg-background">
                        <p className="font-medium">Blockchain Advisor</p>
                        <p className="text-sm text-muted-foreground">Chainlink ecosystem expertise</p>
                      </div>
                      <div className="p-4 rounded-md bg-background">
                        <p className="font-medium">Legal Advisor</p>
                        <p className="text-sm text-muted-foreground">Securities & real estate law</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="h-6 w-6 text-primary" />
                      <h4 className="font-semibold">Build Our Community, LLC</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Georgia, USA
                    </p>
                    <Button variant="outline" asChild>
                      <a href="mailto:info@buildourcommunity.co">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Contact Us
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </Section>

              <Separator className="my-12" />

              <section className="mb-16">
                <h2 className="text-2xl lg:text-3xl font-bold mb-6">Disclaimer</h2>
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      This litepaper is for informational purposes only and does not constitute an offer to sell or solicitation to buy securities. RevitaHub property tokens are securities subject to applicable laws. Investments are speculative, illiquid, and involve significant risk of loss. Past performance does not guarantee future results.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      All forward-looking statements involve risks and uncertainties. Actual results may differ materially from projections. Token prices may not reflect underlying asset values. Investors should review all risk factors and consult financial and legal advisors before investing.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      RevitaHub is not available in jurisdictions where prohibited. Geographic and regulatory restrictions apply. Build Our Community, LLC reserves the right to modify this document.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <Card className="bg-primary/5 border-primary/20 text-center">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Join the Revitalization Movement</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Be part of the community transforming vacant properties into thriving neighborhood assets.
                  </p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Button asChild data-testid="button-explore-properties">
                      <a href="/properties">Explore Properties</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://buildourcommunity.co" target="_blank" rel="noopener noreferrer">
                        Join Waitlist
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
