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
  RefreshCw
} from "lucide-react";

const tableOfContents = [
  { id: "abstract", title: "1. Abstract" },
  { id: "problem", title: "2. Problem Statement" },
  { id: "solution", title: "3. Solution Overview" },
  { id: "platform", title: "4. Platform Architecture" },
  { id: "tokenization", title: "5. Tokenization Model" },
  { id: "offering", title: "6. Community-First Token Offering" },
  { id: "chainlink", title: "7. Chainlink Integration" },
  { id: "governance", title: "8. Governance & DAO" },
  { id: "protection", title: "9. Investor Protections" },
  { id: "compliance", title: "10. Legal & Regulatory Compliance" },
  { id: "technical", title: "11. Technical Architecture" },
  { id: "tokenomics", title: "12. Tokenomics" },
  { id: "roadmap", title: "13. Roadmap" },
  { id: "team", title: "14. Team" },
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

export default function Whitepaper() {
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
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Technical Whitepaper</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4" data-testid="whitepaper-title">
                RevitaHub Protocol
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Decentralized Real Estate Tokenization for Community Revitalization
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Version 1.0 | December 2024
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
              <Section id="abstract" title="1. Abstract">
                <p className="text-lg leading-relaxed mb-6">
                  RevitaHub is a decentralized protocol enabling fractional ownership of real-world real estate assets through blockchain tokenization. The platform democratizes access to property investment through an intentionally low entry price of <span className="font-bold">$12.50 per token</span> in Phase 1, designed specifically for financial inclusion of lower-income investors who are typically excluded from real estate opportunities. This enables participation in community revitalization projects while providing institutional-grade security, regulatory compliance, and transparent governance.
                </p>
                <p className="leading-relaxed mb-6">
                  Built on EVM-compatible blockchain infrastructure and leveraging Chainlink's decentralized oracle network for verified real-world data, RevitaHub creates a trust-minimized bridge between physical real estate assets and on-chain token ownership. The protocol implements a novel 5-phase community-first offering system that prioritizes local stakeholders while ensuring broad accessibility, combined with robust investor protection mechanisms including guaranteed returns on failed funding rounds.
                </p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Key Innovations</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Community-first 5-phase token distribution prioritizing local investors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Chainlink-powered property valuations and proof of reserve verification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>DAO governance enabling token holders to shape property development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>3% APR investor protection on failed funding rounds</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Section>

              <Separator className="my-12" />

              <Section id="problem" title="2. Problem Statement">
                <Subsection title="2.1 The Vacant Property Crisis">
                  <p className="leading-relaxed mb-4">
                    Across the United States, an estimated 17 million vacant properties represent both a crisis and an opportunity. These abandoned lots, historic buildings, and commercial sites drain municipal resources through increased crime, reduced property values, and ongoing maintenance costs. Meanwhile, communities lack the capital and mechanisms to transform these liabilities into assets.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">17M+</p>
                        <p className="text-sm text-muted-foreground">Vacant Properties in US</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">$500B</p>
                        <p className="text-sm text-muted-foreground">Estimated Lost Value</p>
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
                  <p className="leading-relaxed mb-4">
                    Traditional real estate investment mechanisms exclude the vast majority of potential participants:
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm font-medium">1</span>
                      </div>
                      <div>
                        <span className="font-medium">High Capital Requirements:</span>
                        <span className="text-muted-foreground"> Minimum investments of $25,000-$100,000+ exclude 90% of Americans from direct real estate ownership.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm font-medium">2</span>
                      </div>
                      <div>
                        <span className="font-medium">Illiquidity:</span>
                        <span className="text-muted-foreground"> Real estate investments typically lock capital for 5-10 years with no secondary market.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm font-medium">3</span>
                      </div>
                      <div>
                        <span className="font-medium">Geographic Restrictions:</span>
                        <span className="text-muted-foreground"> Investors cannot easily participate in revitalization of their own communities from afar.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm font-medium">4</span>
                      </div>
                      <div>
                        <span className="font-medium">No Voice in Development:</span>
                        <span className="text-muted-foreground"> Communities have no input on how properties are developed, often leading to gentrification and displacement.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="2.3 Trust Deficits in Real Estate Investment">
                  <p className="leading-relaxed mb-4">
                    Current real estate investment structures suffer from opacity and centralized control:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Property valuations rely on single appraisers with potential conflicts of interest</li>
                    <li>Fund managers have unilateral control over investment decisions</li>
                    <li>Distribution of returns lacks transparency and verifiability</li>
                    <li>No on-chain proof that tokens are backed by real assets</li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="solution" title="3. Solution Overview">
                <p className="text-lg leading-relaxed mb-6">
                  RevitaHub addresses these challenges through a decentralized protocol that combines blockchain tokenization, oracle-verified real-world data, and community-first governance to create an accessible, transparent, and impactful real estate investment platform.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                        <Coins className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Fractional Ownership</h4>
                      <p className="text-sm text-muted-foreground">
                        Tokenize any property into divisible ERC-20 tokens enabling $12.50 minimum investments with full ownership rights and dividend distributions.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                        <Link2 className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Oracle-Verified Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainlink oracles provide tamper-proof property valuations, ownership verification, and automated dividend calculations.
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
                        Token holders vote on property development decisions, ensuring communities shape revitalization outcomes.
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
                        Failed funding rounds trigger automatic refunds with 3% APR interest, protecting investor capital.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Subsection title="3.1 How It Works">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">1</div>
                      <div>
                        <p className="font-medium">Property Nomination & Verification</p>
                        <p className="text-sm text-muted-foreground">Community members nominate vacant or underutilized properties. Chainlink oracles verify ownership records and property data from county registries.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">2</div>
                      <div>
                        <p className="font-medium">Tokenization & Offering</p>
                        <p className="text-sm text-muted-foreground">Approved properties are tokenized into ERC-20 tokens. A 5-phase offering prioritizes local community investors before opening to broader participation.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">3</div>
                      <div>
                        <p className="font-medium">DAO Governance</p>
                        <p className="text-sm text-muted-foreground">Token holders vote on development plans, contractor selection, and community benefit allocations through on-chain governance.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">4</div>
                      <div>
                        <p className="font-medium">Development & Returns</p>
                        <p className="text-sm text-muted-foreground">Properties are developed according to community votes. Rental income and appreciation are distributed as quarterly dividends to token holders.</p>
                      </div>
                    </li>
                  </ol>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="platform" title="4. Platform Architecture">
                <p className="leading-relaxed mb-6">
                  RevitaHub implements a hybrid architecture combining on-chain smart contracts for tokenization and governance with off-chain systems for property management and regulatory compliance.
                </p>

                <Subsection title="4.1 On-Chain Components">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Property Token Contracts:</span>
                        <span className="text-muted-foreground"> ERC-20 tokens representing fractional ownership with built-in dividend distribution and transfer restrictions for compliance.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Vote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Governance Contracts:</span>
                        <span className="text-muted-foreground"> Token-weighted voting with phase-based multipliers ensuring local stakeholders maintain influence.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Coins className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Treasury Contracts:</span>
                        <span className="text-muted-foreground"> Multi-sig escrow holding property acquisition funds with automated release based on milestone completion.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Dividend Distribution:</span>
                        <span className="text-muted-foreground"> Automated quarterly distributions triggered by Chainlink Automation based on verified income reports.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="4.2 Blockchain Infrastructure">
                  <p className="leading-relaxed mb-4">
                    RevitaHub is designed for deployment on EVM-compatible blockchains, with infrastructure selection based on the following criteria:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Low transaction costs for retail investor accessibility</li>
                    <li>High throughput for governance voting and dividend distributions</li>
                    <li>Strong Chainlink oracle support and service availability</li>
                    <li>Regulatory clarity and institutional acceptance</li>
                    <li>Cross-chain interoperability via Chainlink CCIP</li>
                  </ul>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm">
                        <span className="font-medium">Multi-Chain Strategy:</span> Initial deployment will target a primary EVM chain with cross-chain expansion enabled by Chainlink CCIP, allowing token holders on different networks to participate in unified governance and receive dividends.
                      </p>
                    </CardContent>
                  </Card>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="tokenization" title="5. Tokenization Model">
                <Subsection title="5.1 Property Token Structure">
                  <p className="leading-relaxed mb-4">
                    Each property on RevitaHub is represented by a unique ERC-20 token contract with the following characteristics:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Attribute</th>
                          <th className="text-left p-3 border-b">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">Token Standard</td>
                          <td className="p-3 border-b text-muted-foreground">ERC-20 with ERC-1400 security token extensions</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Total Supply</td>
                          <td className="p-3 border-b text-muted-foreground">Fixed at issuance based on property valuation</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Minimum Investment</td>
                          <td className="p-3 border-b text-muted-foreground">$12.50 per token (Phase 1 County price)</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Transfer Restrictions</td>
                          <td className="p-3 border-b text-muted-foreground">KYC/AML verification required for all holders</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Dividend Rights</td>
                          <td className="p-3 text-muted-foreground">Pro-rata distribution of property income</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="5.2 Low-Entry Token Pricing for Financial Inclusion">
                  <p className="leading-relaxed mb-4">
                    RevitaHub implements an intentionally low entry price of <span className="font-bold text-primary">$12.50 per token</span> in Phase 1, designed specifically to enable participation from a wide range of investors, including those with lower incomes who are typically excluded from real estate investment opportunities.
                  </p>
                  <Card className="bg-chart-3/10 border-chart-3/30 mb-6">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3">Democratized Ownership Through Accessible Pricing</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        By setting tokens at $12.50, even small investments (e.g., buying just a few tokens) allow everyday residents to become fractional owners, share in automated dividends from rental income, property appreciation, and community revenue streams. This fosters inclusive wealth-building tied to local development.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This low barrier aligns with our vision of community-driven growth, preserving open space while generating passive returns for token holders nationwide via a regulated securities framework compliant across all 50 states.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <h4 className="font-medium mb-3">Algorithmic Phase Pricing</h4>
                  <p className="leading-relaxed mb-4">
                    Token prices increase algorithmically across phases, calculated to reach the total funding target while rewarding early community investors:
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Phase</th>
                          <th className="text-left p-3 border-b">Base Price</th>
                          <th className="text-left p-3 border-b">Multiplier</th>
                          <th className="text-left p-3 border-b">Token Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">County</td>
                          <td className="p-3 border-b text-muted-foreground">$12.50</td>
                          <td className="p-3 border-b text-muted-foreground">1.0x</td>
                          <td className="p-3 border-b font-semibold text-chart-3">$12.50</td>
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
                  <p className="text-sm text-muted-foreground">
                    This pricing structure ensures local community members receive the best pricing while later-phase investors pay premiums that help reach funding targets. Valuations are updated quarterly via Chainlink oracle feeds incorporating multiple independent appraisals.
                  </p>
                </Subsection>

                <Subsection title="5.3 Property Types">
                  <p className="leading-relaxed mb-4">
                    RevitaHub supports tokenization of diverse property types without restrictions on size or category:
                  </p>
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
                        <p className="text-sm font-medium">Commercial Sites</p>
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

              <Section id="offering" title="6. Community-First Token Offering">
                <p className="leading-relaxed mb-6">
                  RevitaHub implements a novel 5-phase offering system designed to prioritize community stakeholders while enabling broad participation. This structure ensures that those most affected by property development have first access to investment opportunities.
                </p>

                <Subsection title="6.1 Phase Structure">
                  <div className="space-y-4 mb-6">
                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Phase 1: County</h4>
                          <span className="text-sm text-muted-foreground">1.5x Voting Power</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Exclusive access for investors residing in the same county as the property.</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-primary font-medium">Duration: 30 days</span>
                          <span>Per-person cap: $25,000</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-chart-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Phase 2: State</h4>
                          <span className="text-sm text-muted-foreground">1.25x Voting Power</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Opens to all investors within the same state.</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-chart-2 font-medium">Duration: 30 days</span>
                          <span>Per-person cap: $50,000</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-chart-3">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Phase 3: National</h4>
                          <span className="text-sm text-muted-foreground">1.0x Voting Power</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Available to all US-based investors.</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-chart-3 font-medium">Duration: 60 days</span>
                          <span>Per-person cap: $100,000</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-chart-4">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Phase 4: International</h4>
                          <span className="text-sm text-muted-foreground">0.75x Voting Power</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Global participation from eligible jurisdictions.</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-chart-4 font-medium">Duration: 90 days</span>
                          <span>Per-person cap: $250,000</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-chart-5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Phase 5: Private Offering</h4>
                          <span className="text-sm text-muted-foreground">Custom Terms</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Property owners can create invite-only offerings for specific investors or businesses via email invites and private access codes.</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-chart-5 font-medium">Duration: Flexible</span>
                          <span>Per-person cap: Customizable</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Subsection>

                <Subsection title="6.2 Phase Advancement">
                  <p className="leading-relaxed mb-4">
                    Phases advance automatically when either condition is met:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Current phase token allocation is fully subscribed</li>
                    <li>Phase time limit expires</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Chainlink Automation monitors phase conditions and triggers advancement, ensuring trustless execution of the offering timeline.
                  </p>
                </Subsection>

                <Subsection title="6.3 Funding Timeline">
                  <p className="leading-relaxed mb-4">
                    Each property offering operates under a 1-year funding deadline. If 100% of the funding target is not reached, the offering is cancelled and investors receive automatic refunds with 3% APR interest on their contributions.
                  </p>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="chainlink" title="7. Chainlink Integration">
                <p className="text-lg leading-relaxed mb-6">
                  RevitaHub leverages multiple Chainlink services to create a secure, transparent, and automated real estate tokenization platform. This deep integration with Chainlink's decentralized oracle network is fundamental to our trust-minimized architecture.
                </p>

                <Card className="bg-primary/5 border-primary/20 mb-8">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-primary" />
                      Chainlink Build Program Participation
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      RevitaHub is committed to the Chainlink ecosystem and intends to participate in the Chainlink Build Program, allocating a percentage of protocol revenue and token supply to Chainlink service providers and LINK stakers.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-2xl font-bold text-primary">3%</p>
                        <p className="text-xs text-muted-foreground">Token Supply to Chainlink Ecosystem</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-2xl font-bold text-primary">10%</p>
                        <p className="text-xs text-muted-foreground">Network Fees to Service Providers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Subsection title="7.1 Chainlink Data Feeds">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Real-Time Property Valuations</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainlink Data Feeds aggregate property valuations from multiple independent appraisers, real estate data providers, and market indices to provide tamper-proof on-chain valuations. This eliminates single points of failure and conflicts of interest in property pricing.
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Aggregated data from 3+ independent appraisal sources</li>
                    <li>Quarterly valuation updates with deviation thresholds</li>
                    <li>Integration with commercial real estate indices</li>
                  </ul>
                </Subsection>

                <Subsection title="7.2 Chainlink Proof of Reserve">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Asset Backing Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainlink Proof of Reserve provides cryptographic verification that property tokens are backed by real-world assets. This includes verification of property ownership records, title insurance, and escrow balances.
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>On-chain attestation of property deed registration</li>
                    <li>Real-time escrow balance verification</li>
                    <li>Automated alerts for collateralization ratio changes</li>
                  </ul>
                </Subsection>

                <Subsection title="7.3 Chainlink Functions">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Off-Chain Property Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainlink Functions enables secure retrieval of property data from county registries, title companies, and property management systems without exposing sensitive APIs on-chain.
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>County registry ownership verification</li>
                    <li>Property tax status and lien checks</li>
                    <li>Rental income and occupancy data retrieval</li>
                    <li>Insurance policy verification</li>
                  </ul>
                </Subsection>

                <Subsection title="7.4 Chainlink Automation">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Automated Protocol Operations</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainlink Automation powers trustless execution of critical protocol functions, removing the need for centralized operators.
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Quarterly dividend distributions to all token holders</li>
                    <li>Phase advancement when conditions are met</li>
                    <li>Funding deadline enforcement and refund triggers</li>
                    <li>Governance proposal execution after voting periods</li>
                  </ul>
                </Subsection>

                <Subsection title="7.5 Chainlink CCIP">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Cross-Chain Interoperability</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainlink CCIP (Cross-Chain Interoperability Protocol) enables property tokens to be held and traded across multiple blockchain networks while maintaining unified governance.
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Cross-chain token transfers with unified ownership records</li>
                    <li>Multi-chain governance voting aggregation</li>
                    <li>Dividend distribution to holders on any supported chain</li>
                    <li>Future expansion to additional EVM chains without token fragmentation</li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="governance" title="8. Governance & DAO">
                <p className="leading-relaxed mb-6">
                  RevitaHub implements property-level DAO governance, giving token holders direct control over development decisions while ensuring local community voices are amplified.
                </p>

                <Subsection title="8.1 Voting Power">
                  <p className="leading-relaxed mb-4">
                    Voting power is calculated based on token holdings multiplied by phase-based multipliers:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Purchase Phase</th>
                          <th className="text-left p-3 border-b">Multiplier</th>
                          <th className="text-left p-3 border-b">Rationale</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">County</td>
                          <td className="p-3 border-b text-primary">1.5x</td>
                          <td className="p-3 border-b text-muted-foreground">Local stakeholders have outsized impact</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">State</td>
                          <td className="p-3 border-b text-primary">1.25x</td>
                          <td className="p-3 border-b text-muted-foreground">Regional investors understand local context</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">National</td>
                          <td className="p-3 border-b">1.0x</td>
                          <td className="p-3 border-b text-muted-foreground">Standard voting weight</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">International</td>
                          <td className="p-3">0.75x</td>
                          <td className="p-3 text-muted-foreground">Remote investors defer to local expertise</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="8.2 Proposal Types">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Development Plans:</span>
                        <span className="text-muted-foreground"> Vote on proposed uses - affordable housing, commercial space, green space, etc.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Contractor Selection:</span>
                        <span className="text-muted-foreground"> Choose from vetted developers and construction firms.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Dividend Policy:</span>
                        <span className="text-muted-foreground"> Determine reinvestment vs. distribution ratios.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Property Sale:</span>
                        <span className="text-muted-foreground"> Supermajority (67%) required to approve exit events.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="8.3 Proposal Lifecycle">
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">1</span>
                      <span>Proposal submitted with 1% token threshold</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">2</span>
                      <span>7-day discussion period</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">3</span>
                      <span>7-day voting period</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">4</span>
                      <span>2-day timelock before execution</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">5</span>
                      <span>Chainlink Automation executes approved proposals</span>
                    </li>
                  </ol>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="protection" title="9. Investor Protections">
                <p className="leading-relaxed mb-6">
                  RevitaHub implements multiple layers of investor protection to ensure participant security and confidence in the platform.
                </p>

                <Subsection title="9.1 Funding Guarantee">
                  <Card className="bg-chart-3/10 border-chart-3/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-8 w-8 text-chart-3" />
                        <div>
                          <h4 className="font-semibold">3% APR Refund Protection</h4>
                          <p className="text-sm text-muted-foreground">Your investment is protected if funding fails</p>
                        </div>
                      </div>
                      <p className="text-sm mb-4">
                        If a property fails to reach 100% of its funding target within the 1-year funding period, the offering is cancelled. All investors receive automatic refunds with 3% APR interest calculated from their investment date. Property loans are only issued once 100% funding is achieved.
                      </p>
                      <div className="bg-background/50 p-3 rounded-md font-mono text-sm">
                        Refund = Principal + (Principal × 0.03 × Days Held / 365)
                      </div>
                    </CardContent>
                  </Card>
                </Subsection>

                <Subsection title="9.2 Alternative Exit: Share Transfer">
                  <p className="leading-relaxed mb-4">
                    If a property reaches between 60-100% of its funding target but cannot proceed to development, investors may opt to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Receive a full refund with 3% APR interest, OR</li>
                    <li>Transfer shares to a follow-on offering for the same or similar property</li>
                  </ul>
                </Subsection>

                <Subsection title="9.3 Security Measures">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Multi-Sig Treasury:</span>
                        <span className="text-muted-foreground"> Property acquisition funds held in multi-signature escrow requiring 3-of-5 approval.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Audited Smart Contracts:</span>
                        <span className="text-muted-foreground"> All protocol contracts audited by leading blockchain security firms.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Insurance Coverage:</span>
                        <span className="text-muted-foreground"> Protocol-level coverage for smart contract vulnerabilities.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Chainlink Proof of Reserve:</span>
                        <span className="text-muted-foreground"> Real-time verification that tokens are backed by real assets.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="compliance" title="10. Legal & Regulatory Compliance">
                <Subsection title="10.1 Securities Compliance">
                  <p className="leading-relaxed mb-4">
                    RevitaHub property tokens are structured as securities under US law and comply with applicable regulations:
                  </p>
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation D (506c):</span>
                        <span className="text-muted-foreground"> Offerings to accredited investors with general solicitation permitted.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation A+ (Tier 2):</span>
                        <span className="text-muted-foreground"> Qualified offerings up to $75M annually open to non-accredited investors.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Regulation CF:</span>
                        <span className="text-muted-foreground"> Crowdfunding offerings for smaller properties up to $5M.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="10.2 KYC/AML Requirements">
                  <p className="leading-relaxed mb-4">
                    All platform participants must complete identity verification before investing:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Government-issued ID verification</li>
                    <li>Address verification (determines phase eligibility)</li>
                    <li>Accreditation verification (for Reg D offerings)</li>
                    <li>OFAC sanctions screening</li>
                    <li>Ongoing transaction monitoring</li>
                  </ul>
                </Subsection>

                <Subsection title="10.3 Transfer Restrictions">
                  <p className="leading-relaxed mb-4">
                    Property tokens may only be transferred to verified addresses that have completed KYC. Smart contracts enforce:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Whitelist-only transfers</li>
                    <li>Holding period requirements (1 year for Reg D)</li>
                    <li>Per-investor ownership limits</li>
                    <li>Geographic restrictions where required</li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="technical" title="11. Technical Architecture">
                <Subsection title="11.1 Smart Contract Architecture">
                  <div className="bg-muted/30 p-4 rounded-md mb-4">
                    <pre className="text-sm overflow-x-auto">
{`┌─────────────────────────────────────────────────────────┐
│                    RevitaHub Protocol                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Property   │  │  Offering   │  │ Governance  │     │
│  │   Token     │  │   Manager   │  │    DAO      │     │
│  │  (ERC-20)   │  │             │  │             │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │  Treasury   │                       │
│                   │  (Multi-Sig)│                       │
│                   └──────┬──────┘                       │
│                          │                              │
├──────────────────────────┼──────────────────────────────┤
│           Chainlink Services Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Data    │  │  Proof   │  │ Functions│  │  CCIP  │  │
│  │  Feeds   │  │of Reserve│  │          │  │        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │ Automation  │                       │
│                   └─────────────┘                       │
└─────────────────────────────────────────────────────────┘`}
                    </pre>
                  </div>
                </Subsection>

                <Subsection title="11.2 Off-Chain Infrastructure">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Property Database:</span>
                        <span className="text-muted-foreground"> PostgreSQL database storing property metadata, documents, and images.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Identity Service:</span>
                        <span className="text-muted-foreground"> KYC/AML verification integrated with licensed identity providers.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">API Gateway:</span>
                        <span className="text-muted-foreground"> RESTful API serving property data and user dashboards.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="11.3 Security Practices">
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Multi-party computation for private key management</li>
                    <li>Regular third-party security audits</li>
                    <li>Bug bounty program with rewards up to $100,000</li>
                    <li>Formal verification of critical contract logic</li>
                    <li>Incident response plan with 24/7 monitoring</li>
                  </ul>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="tokenomics" title="12. Tokenomics">
                <Subsection title="12.1 RVTA Governance Token">
                  <p className="leading-relaxed mb-4">
                    In addition to property-specific tokens, RevitaHub will issue a platform governance token (RVTA) for protocol-level decisions:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Allocation</th>
                          <th className="text-left p-3 border-b">Percentage</th>
                          <th className="text-left p-3 border-b">Vesting</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border-b font-medium">Community Treasury</td>
                          <td className="p-3 border-b">40%</td>
                          <td className="p-3 border-b text-muted-foreground">DAO-controlled distribution</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Property Investors (Airdrop)</td>
                          <td className="p-3 border-b">20%</td>
                          <td className="p-3 border-b text-muted-foreground">Based on investment history</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Team & Advisors</td>
                          <td className="p-3 border-b">15%</td>
                          <td className="p-3 border-b text-muted-foreground">4-year vesting, 1-year cliff</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Development Fund</td>
                          <td className="p-3 border-b">12%</td>
                          <td className="p-3 border-b text-muted-foreground">Milestone-based release</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Chainlink Ecosystem</td>
                          <td className="p-3 border-b">3%</td>
                          <td className="p-3 border-b text-muted-foreground">Build Program commitment</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Liquidity & Market Making</td>
                          <td className="p-3">10%</td>
                          <td className="p-3 text-muted-foreground">DEX liquidity provision</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>

                <Subsection title="12.2 Token Utility">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Vote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Protocol Governance:</span>
                        <span className="text-muted-foreground"> Vote on platform upgrades, fee structures, and new features.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Coins className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Fee Discounts:</span>
                        <span className="text-muted-foreground"> RVTA stakers receive reduced platform fees on property investments.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Revenue Sharing:</span>
                        <span className="text-muted-foreground"> Staked RVTA earns a share of protocol fees.</span>
                      </div>
                    </li>
                  </ul>
                </Subsection>

                <Subsection title="12.3 Fee Structure">
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
                          <td className="p-3 border-b text-muted-foreground">Protocol treasury + stakers</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-b font-medium">Secondary Trading</td>
                          <td className="p-3 border-b">1.0%</td>
                          <td className="p-3 border-b text-muted-foreground">50% protocol, 50% property DAO</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Asset Management</td>
                          <td className="p-3">1.5% annually</td>
                          <td className="p-3 text-muted-foreground">Property operations fund</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Subsection>
              </Section>

              <Separator className="my-12" />

              <Section id="roadmap" title="13. Roadmap">
                <div className="space-y-6">
                  <Card className="border-l-4 border-l-chart-3">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-chart-3" />
                        <h4 className="font-semibold">Phase 1: Foundation (Q1 2025)</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          Platform MVP launch with property nomination system
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          KYC/AML integration
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          Chainlink Data Feed integration for property valuations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          First pilot property tokenization
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Phase 2: Expansion (Q2-Q3 2025)</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          5-phase offering system deployment
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          DAO governance implementation
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Chainlink Automation for dividends
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          10+ properties across 5 states
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Chainlink Build Program application
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-chart-2">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-chart-2" />
                        <h4 className="font-semibold">Phase 3: Scale (Q4 2025 - Q1 2026)</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          RVTA governance token launch
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Chainlink CCIP cross-chain deployment
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Secondary market trading platform
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          50+ properties nationwide
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Institutional investor onboarding
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-chart-4">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="h-5 w-5 text-chart-4" />
                        <h4 className="font-semibold">Phase 4: Global (2026+)</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          International expansion to EU/APAC markets
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Multi-chain presence via CCIP
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Integration with traditional financial systems
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          $100M+ in tokenized real estate
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </Section>

              <Separator className="my-12" />

              <Section id="team" title="14. Team">
                <p className="leading-relaxed mb-6">
                  RevitaHub is built by a team of experienced professionals in real estate, blockchain technology, and community development.
                </p>
                <Card className="bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Team information coming soon.</p>
                    <Button variant="outline" asChild>
                      <a href="mailto:team@revitahub.com">
                        Contact Us
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <div className="mt-12 p-6 border rounded-md">
                  <h3 className="font-semibold mb-4">Disclaimer</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This whitepaper is for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any securities. Investment in tokenized real estate involves significant risks, including the potential loss of principal. Past performance does not guarantee future results. Prospective investors should consult with legal, tax, and financial advisors before making investment decisions. RevitaHub makes no representations or warranties regarding the accuracy or completeness of the information contained herein.
                  </p>
                </div>
              </Section>
            </article>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:py-8 {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          body {
            font-size: 11pt;
            line-height: 1.5;
            color: #000 !important;
            background: #fff !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, footer, nav {
            display: none !important;
          }
          section {
            page-break-inside: avoid;
          }
          h1 {
            font-size: 24pt;
            page-break-after: avoid;
          }
          h2 {
            font-size: 18pt;
            page-break-after: avoid;
            margin-top: 1.5rem;
          }
          h3 {
            font-size: 14pt;
            page-break-after: avoid;
          }
          h4 {
            font-size: 12pt;
            page-break-after: avoid;
          }
          table {
            page-break-inside: avoid;
          }
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 9pt;
          }
          a {
            text-decoration: none;
            color: inherit !important;
          }
          .bg-primary\\/5,
          .bg-muted\\/30,
          .bg-muted\\/50,
          .bg-chart-3\\/10 {
            background-color: #f5f5f5 !important;
          }
          @page {
            margin: 0.75in;
            size: letter;
          }
        }
      `}</style>
    </div>
  );
}
