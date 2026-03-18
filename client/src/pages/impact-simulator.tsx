import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Globe,
  Building2,
  Briefcase,
  TrendingUp,
  Home,
  GraduationCap,
  Zap,
  Sprout,
  Factory,
  Rocket,
  TreePine,
  Warehouse,
  HeartPulse,
  ShieldAlert,
  Lock,
  Vote,
  Layers,
  DollarSign,
  AlertTriangle,
  Users,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react";
import {
  STATE_GDP,
  TOTAL_COUNTIES,
  ADOPTION_TIERS,
  generateProjects,
  calculateTierImpact,
  calculateFounderRevenue,
  getDistressColor,
  getDistressLabel,
  formatCurrency,
  type AdoptionTier,
  type GeneratedProject,
  type ProjectType,
} from "@/lib/georgia-impact-data";

const PROJECT_ICONS: Record<ProjectType, typeof Home> = {
  "Affordable Housing": Home,
  "Vocational Training": GraduationCap,
  "Renewable Energy": Zap,
  "Agri-Tech": Sprout,
  "Manufacturing Upgrade": Factory,
  "Small Business Incubator": Rocket,
  "Tourism Eco-Lodge": TreePine,
  "Logistics Warehouse": Warehouse,
  "Community Health Center": HeartPulse,
  "Disaster Recovery Hub": ShieldAlert,
};

const CONTRACT_CARDS = [
  {
    name: "PropertyToken",
    icon: Building2,
    description: "ERC-1155 multi-token contract representing fractional ownership in community properties.",
    enhancements: [
      "ImpactMetrics struct stored on-chain per property (economicScore, socialScore, leverageRank)",
      "getClearInvestmentPreview() returns projected ROI, GDP multiplier, and social impact summary",
      "Oracle-fed distress classification updates from Chainlink for each county",
    ],
  },
  {
    name: "Escrow",
    icon: Lock,
    description: "Milestone-based escrow releasing funds as development phases complete.",
    enhancements: [
      "Impact-weighted milestone verification — higher distress counties get priority disbursement",
      "Automatic refund triggers if ImpactMetrics fall below threshold after 12 months",
      "Chainlink Automation monitors milestone deadlines and triggers escrow releases",
    ],
  },
  {
    name: "Governance",
    icon: Vote,
    description: "DAO governance with demand-driven quorum and phase-aware voting weights.",
    enhancements: [
      "Proposal scoring integrates ImpactMetrics — high-leverage projects get quorum boosts",
      "Dynamic quorum adjusts based on community demand signals per category",
      "Phase advancement auto-triggers when engagement threshold hits 75%",
    ],
  },
  {
    name: "PhaseManager",
    icon: Layers,
    description: "Controls investment phases from County to International with regulatory gates.",
    enhancements: [
      "Impact-based phase progression — counties with strong metrics advance faster",
      "Cross-phase GDP aggregation calculates cumulative state-wide economic impact",
      "Regulatory compliance checkpoints integrated with oracle-verified county data",
    ],
  },
  {
    name: "Treasury",
    icon: DollarSign,
    description: "Community treasury managing funds with Chainlink price feeds and founder vesting.",
    enhancements: [
      "Founder revenue (1% + 0.25%) scales with verified impact metrics, not just TVL",
      "Chainlink Functions fetch real-time county economic data for treasury allocation decisions",
      "Impact-weighted distribution prioritizes high-leverage, high-distress investments",
    ],
  },
];

export default function ImpactSimulator() {
  const [selectedTierIndex, setSelectedTierIndex] = useState(1);

  const selectedTier = ADOPTION_TIERS[selectedTierIndex];
  const tierImpact = useMemo(() => calculateTierImpact(selectedTier), [selectedTier]);

  const sampleProjects = useMemo(
    () => generateProjects(selectedTier, 5),
    [selectedTier]
  );

  const founderRevenues = useMemo(
    () => ADOPTION_TIERS.map((tier) => {
      const impact = calculateTierImpact(tier);
      return {
        tier,
        estimatedRaised: impact.estimatedRaised,
        ...calculateFounderRevenue(impact.estimatedRaised),
      };
    }),
    []
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-16 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold" data-testid="text-simulator-title">
                Georgia County Impact Simulator
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-simulator-subtitle">
              GDP projections calibrated against BEA RIMS II multipliers and ARC distress classifications.
              Explore how tokenized community development could transform Georgia counties.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">State GDP</p>
                <p className="text-2xl font-bold" data-testid="text-state-gdp">
                  {formatCurrency(STATE_GDP, true)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Counties Covered</p>
                <p className="text-2xl font-bold" data-testid="text-counties-covered">
                  {selectedTier.counties}
                  <span className="text-sm font-normal text-muted-foreground"> / {TOTAL_COUNTIES}</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
                <p className="text-2xl font-bold" data-testid="text-total-projects">
                  {selectedTier.projects}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Projected 5-Year Impact</p>
                <p className="text-2xl font-bold" data-testid="text-five-year-impact">
                  {formatCurrency(tierImpact.totalGDP, true)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Adoption Tier</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ADOPTION_TIERS.map((tier, idx) => (
                <Card
                  key={tier.percent}
                  className={`cursor-pointer transition-colors ${
                    idx === selectedTierIndex
                      ? "border-primary ring-1 ring-primary"
                      : "hover-elevate"
                  }`}
                  onClick={() => setSelectedTierIndex(idx)}
                  data-testid={`button-tier-${tier.percent}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <Badge variant={idx === selectedTierIndex ? "default" : "secondary"}>
                        {tier.percent}%
                      </Badge>
                      <span className="text-sm font-semibold">{tier.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{tier.description}</p>
                    <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                      <span>{tier.counties} counties</span>
                      <span>{tier.projects} projects</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Scenario Summary
              </CardTitle>
              <CardDescription>
                Projected outcomes for {selectedTier.percent}% adoption ({selectedTier.label})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Counties</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Projects</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Total GDP Impact</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Avg Impact/Project</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">% of State GDP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr data-testid="row-scenario-summary">
                      <td className="py-3 pr-4 font-semibold">{selectedTier.counties}</td>
                      <td className="py-3 pr-4 font-semibold">{selectedTier.projects}</td>
                      <td className="py-3 pr-4 font-semibold" data-testid="text-total-gdp-impact">
                        {formatCurrency(tierImpact.totalGDP, true)}
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {formatCurrency(tierImpact.avgPerProject, true)}
                      </td>
                      <td className="py-3 font-semibold">
                        {tierImpact.percentOfStateGDP.toFixed(4)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h2 className="text-xl font-semibold">Sample Projects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleProjects.map((project, idx) => {
                const Icon = PROJECT_ICONS[project.projectType] || Building2;
                return (
                  <Card key={idx} data-testid={`card-project-${idx}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{project.county.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getDistressColor(project.county.distressLevel)}`}
                          >
                            {getDistressLabel(project.county.distressLevel)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{project.projectType}</span>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold">{formatCurrency(project.budget)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">5-Year GDP Impact</p>
                          <p className="font-semibold">{formatCurrency(project.gdpImpact, true)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Jobs Created</p>
                          <p className="font-semibold">{project.projectedJobs}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Multiplier</p>
                          <Badge variant="secondary">{project.multiplier}x</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Founder Revenue Scaling
              </CardTitle>
              <CardDescription>
                How 1% treasury cut + 0.25% certification fee scales across adoption tiers.
                You get paid more when the community wins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Tier</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Estimated Raised</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">1% Cut</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">0.25% Fee</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {founderRevenues.map((row, idx) => (
                      <tr
                        key={row.tier.percent}
                        className={idx === selectedTierIndex ? "bg-primary/5" : ""}
                        data-testid={`row-founder-${row.tier.percent}`}
                      >
                        <td className="py-3 pr-4">
                          <Badge variant={idx === selectedTierIndex ? "default" : "outline"}>
                            {row.tier.percent}% — {row.tier.label}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-semibold">{formatCurrency(row.estimatedRaised, true)}</td>
                        <td className="py-3 pr-4">{formatCurrency(row.treasuryCut)}</td>
                        <td className="py-3 pr-4">{formatCurrency(row.certificationFee)}</td>
                        <td className="py-3 font-semibold text-primary">{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Contract Integration
            </h2>
            <p className="text-muted-foreground mb-4">
              How ImpactMetrics flows through each smart contract in the RevitaHub system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTRACT_CARDS.map((contract) => {
                const Icon = contract.icon;
                return (
                  <Card key={contract.name} data-testid={`card-contract-${contract.name}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="h-5 w-5 text-primary shrink-0" />
                        {contract.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {contract.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {contract.enhancements.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                RevitaScore API
              </CardTitle>
              <CardDescription>
                The same deterministic scoring engine that powers this simulator is available as a B2B API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Banks, CDFIs, municipal planners, and impact investors can access county-level
                impact scoring programmatically via authenticated REST endpoints.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Discovery</p>
                  <p className="font-mono text-xs text-primary" data-testid="text-api-discovery">/api/revitascore/counties</p>
                  <p className="text-xs text-muted-foreground mt-1">No auth required</p>
                </div>
                <div className="p-3 rounded-lg border bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Scoring</p>
                  <p className="font-mono text-xs text-primary" data-testid="text-api-scoring">/api/revitascore/:county/:projectType</p>
                  <p className="text-xs text-muted-foreground mt-1">API key required</p>
                </div>
                <div className="p-3 rounded-lg border bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Tiers</p>
                  <p className="text-sm font-semibold" data-testid="text-api-tiers">Free / Pro / Enterprise</p>
                  <p className="text-xs text-muted-foreground mt-1">3/day free, unlimited pro+</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                <span>Data sources: BEA RIMS II, DOL/HUD, CDC SVI, ARC Classifications</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold" data-testid="text-disclaimer-title">Compliance Disclaimer</h3>
                  <p className="text-sm text-muted-foreground">
                    All projections displayed on this page are modeled estimates for educational
                    purposes only. Scoring methodology uses BEA RIMS II regional multipliers,
                    DOL/HUD employment benchmarks, CDC Social Vulnerability Index data, and
                    Appalachian Regional Commission (ARC) county distress classifications.
                    Past performance does not equal future results. This is not financial advice.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Investment in tokenized real estate involves risk. Consult a qualified
                    financial advisor before making investment decisions. RevitaHub operates under
                    Regulation D / Regulation CF exemptions where applicable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
