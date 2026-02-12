import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Landmark,
  Settings2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  BarChart3,
  Heart,
  Target,
  MessageSquare,
  Vote,
} from "lucide-react";
import { Link } from "wouter";
import type { Proposal as ProposalSchema } from "@shared/schema";

interface DemandBar {
  type: string;
  label: string;
  icon: typeof Building2;
  value: number;
  color: string;
  quorum: number;
  effectiveQuorum: number;
  description: string;
}

interface AdvisorNudge {
  type: string;
  severity: "info" | "warning" | "urgent";
  message: string;
  action: string;
  actionLink: string;
}

export default function DemandDashboard() {
  const { data: proposals = [] } = useQuery<ProposalSchema[]>({
    queryKey: ["/api/proposals"],
  });

  const { data: stats } = useQuery<{
    totalProperties: number;
    totalUsers: number;
    totalInvested: string;
    activeProposals: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const activeProposals = proposals.filter((p) => p.status === "active");
  const passedProposals = proposals.filter((p) => p.status === "passed" || p.status === "executed");
  const totalVotes = proposals.reduce((sum, p) => sum + (p.votesFor || 0) + (p.votesAgainst || 0), 0);

  const categorize = (p: ProposalSchema): string => {
    const text = ((p.title || "") + " " + (p.description || "")).toLowerCase();
    if (/treasury|fund|budget|allocat|spend|financ/.test(text)) return "treasury";
    if (/parameter|setting|rule|config|threshold|quorum/.test(text)) return "parameter";
    if (/emergency|urgent|safety|critical|security/.test(text)) return "emergency";
    return "property";
  };

  const votesByCategory = proposals.reduce((acc, p) => {
    const cat = categorize(p);
    const votes = (p.votesFor || 0) + (p.votesAgainst || 0);
    acc[cat] = (acc[cat] || 0) + votes;
    return acc;
  }, {} as Record<string, number>);

  const propertyDevVotes = votesByCategory["property"] || 0;
  const treasuryVotes = votesByCategory["treasury"] || 0;
  const parameterVotes = votesByCategory["parameter"] || 0;
  const emergencyVotes = votesByCategory["emergency"] || 0;

  const safeTotal = totalVotes || 1;

  const demandBars: DemandBar[] = [
    {
      type: "PropertyDevelopment",
      label: "Property Development",
      icon: Building2,
      value: Math.round((propertyDevVotes / safeTotal) * 100) || 35,
      color: "hsl(var(--chart-1))",
      quorum: 20,
      effectiveQuorum: propertyDevVotes / safeTotal > 0.5 ? 15 : 20,
      description: "Building and renovating community properties",
    },
    {
      type: "TreasuryAllocation",
      label: "Treasury Spending",
      icon: Landmark,
      value: Math.round((treasuryVotes / safeTotal) * 100) || 28,
      color: "hsl(var(--chart-2))",
      quorum: 30,
      effectiveQuorum: treasuryVotes / safeTotal > 0.5 ? 25 : 30,
      description: "Allocating community funds for improvements",
    },
    {
      type: "ParameterChange",
      label: "Platform Parameters",
      icon: Settings2,
      value: Math.round((parameterVotes / safeTotal) * 100) || 22,
      color: "hsl(var(--chart-3))",
      quorum: 25,
      effectiveQuorum: parameterVotes / safeTotal > 0.5 ? 20 : 25,
      description: "Adjusting platform rules and settings",
    },
    {
      type: "Emergency",
      label: "Emergency Actions",
      icon: AlertTriangle,
      value: Math.round((emergencyVotes / safeTotal) * 100) || 15,
      color: "hsl(var(--chart-4))",
      quorum: 50,
      effectiveQuorum: emergencyVotes / safeTotal > 0.5 ? 45 : 50,
      description: "Urgent community safety measures",
    },
  ];

  const healthScore = calculateHealthScore(demandBars);
  const nudges = generateAdvisorNudges(demandBars, healthScore, activeProposals.length);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-semibold" data-testid="text-dashboard-title">
                  Community Control Panel
                </h1>
              </div>
              <p className="text-muted-foreground">
                Real-time community demand signals — like SimCity's advisor panel for your DAO
              </p>
            </div>
            <Link href="/governance">
              <Button data-testid="link-governance">
                <Vote className="h-4 w-4 mr-2" />
                Go to Governance
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Community Health</p>
                  <p className="text-xl font-semibold" data-testid="text-health-score">
                    {healthScore}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Proposals</p>
                  <p className="text-xl font-semibold" data-testid="text-active-proposals">
                    {activeProposals.length || stats?.activeProposals || 3}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-xl font-semibold" data-testid="text-total-participants">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proposals Passed</p>
                  <p className="text-xl font-semibold" data-testid="text-passed-proposals">
                    {passedProposals.length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Community Demand Meters
                  </CardTitle>
                  <CardDescription>
                    What the community is voting for — higher bars mean stronger demand.
                    Types with over 50% demand get a quorum boost (easier to pass proposals).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {demandBars.map((bar) => (
                    <div key={bar.type} className="space-y-2" data-testid={`demand-bar-${bar.type}`}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <bar.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{bar.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold">{bar.value}%</span>
                          {bar.value > 50 && (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Boosted
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={bar.value} className="h-4" />
                        <div
                          className="absolute top-0 h-4 w-0.5 bg-foreground/30"
                          style={{ left: `${bar.quorum}%` }}
                          title={`Base quorum: ${bar.quorum}%`}
                        />
                        {bar.effectiveQuorum !== bar.quorum && (
                          <div
                            className="absolute top-0 h-4 w-0.5 bg-primary"
                            style={{ left: `${bar.effectiveQuorum}%` }}
                            title={`Effective quorum: ${bar.effectiveQuorum}%`}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground">{bar.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Quorum: {bar.effectiveQuorum}%
                          {bar.effectiveQuorum !== bar.quorum && (
                            <span className="text-primary ml-1">
                              (was {bar.quorum}%)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Phase Engagement Tracker
                  </CardTitle>
                  <CardDescription>
                    Community engagement level — 75% unlocks automatic phase advancement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium">Overall Engagement</span>
                      <span className="text-sm font-mono font-semibold">
                        {Math.min(healthScore + 10, 100)}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={Math.min(healthScore + 10, 100)} className="h-6" />
                      <div
                        className="absolute top-0 h-6 w-0.5 bg-primary"
                        style={{ left: "75%" }}
                        title="Phase advancement threshold: 75%"
                      />
                      <span className="absolute top-0 right-0 -mt-5 text-xs text-muted-foreground">
                        75% threshold
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      {["County", "State", "National", "International"].map((phase, idx) => (
                        <div key={phase} className="text-center p-3 rounded-md bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Phase {idx + 1}</p>
                          <p className="text-sm font-semibold">{phase}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {idx === 0 ? "1.5x" : idx === 1 ? "1.25x" : idx === 2 ? "1.0x" : "0.75x"} vote weight
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Advisor Nudges
                  </CardTitle>
                  <CardDescription>
                    Smart recommendations based on community activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {nudges.map((nudge, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-md border ${
                        nudge.severity === "urgent"
                          ? "border-destructive/50 bg-destructive/5"
                          : nudge.severity === "warning"
                            ? "border-yellow-500/50 bg-yellow-500/5"
                            : "border-primary/50 bg-primary/5"
                      }`}
                      data-testid={`nudge-${nudge.type}`}
                    >
                      <div className="flex items-start gap-2">
                        {nudge.severity === "urgent" ? (
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        ) : nudge.severity === "warning" ? (
                          <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        ) : (
                          <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        )}
                        <div className="space-y-1">
                          <p className="text-sm">{nudge.message}</p>
                          <Link href={nudge.actionLink}>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                              {nudge.action}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {nudges.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Community is healthy. No nudges needed.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Community Health
                  </CardTitle>
                  <CardDescription>
                    Balanced demand diversity = healthier community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative h-28 w-28">
                      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60" cy="60" r="50"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                        />
                        <circle
                          cx="60" cy="60" r="50"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="12"
                          strokeDasharray={`${(healthScore / 100) * 314} 314`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{healthScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Demand Diversity</span>
                      <span className="font-medium">
                        {healthScore >= 70 ? "Balanced" : healthScore >= 40 ? "Moderate" : "Concentrated"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Participation</span>
                      <span className="font-medium">
                        {totalVotes > 0 ? "Active" : "Growing"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Governance Activity</span>
                      <span className="font-medium">
                        {activeProposals.length > 0 ? `${activeProposals.length} active` : "No active proposals"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">How Demand Meters Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    Like SimCity's R/C/I demand bars, these meters show what the community
                    wants. When you vote on proposals, your vote weight adds to the demand
                    signal for that category.
                  </p>
                  <Separator />
                  <p>
                    Categories with over 50% demand get a quorum boost — making
                    it easier to pass what the community clearly wants.
                  </p>
                  <Separator />
                  <p>
                    When engagement reaches 75%, phases automatically advance, opening
                    investment to wider audiences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function calculateHealthScore(bars: DemandBar[]): number {
  const total = bars.reduce((sum, b) => sum + b.value, 0);
  if (total === 0) return 65;

  let diversityScore = 0;
  const ideal = 25;
  for (const bar of bars) {
    const deviation = Math.abs(bar.value - ideal);
    diversityScore += (25 - deviation);
  }
  const normalized = Math.round((diversityScore / 100) * 80) + 20;
  return Math.min(normalized, 100);
}

function generateAdvisorNudges(
  bars: DemandBar[],
  healthScore: number,
  activeCount: number
): AdvisorNudge[] {
  const nudges: AdvisorNudge[] = [];

  const highDemand = bars.find(b => b.value > 50);
  if (highDemand) {
    nudges.push({
      type: "high-demand",
      severity: "info",
      message: `Strong demand for ${highDemand.label} (${highDemand.value}%). Proposals in this area have reduced quorum requirements.`,
      action: "Create a proposal",
      actionLink: "/governance",
    });
  }

  const lowDemand = bars.find(b => b.value < 10);
  if (lowDemand) {
    nudges.push({
      type: "low-demand",
      severity: "warning",
      message: `Low activity in ${lowDemand.label}. Consider creating a poll to gauge community interest.`,
      action: "Start a community poll",
      actionLink: "/governance",
    });
  }

  if (activeCount === 0) {
    nudges.push({
      type: "no-proposals",
      severity: "urgent",
      message: "No active proposals. The community needs proposals to vote on to drive engagement and phase advancement.",
      action: "Nominate a property",
      actionLink: "/nominate",
    });
  }

  if (healthScore < 40) {
    nudges.push({
      type: "low-health",
      severity: "urgent",
      message: "Community health is low. Encourage diverse participation across all proposal types for balanced growth.",
      action: "View governance",
      actionLink: "/governance",
    });
  }

  if (healthScore >= 70 && activeCount > 0) {
    nudges.push({
      type: "healthy",
      severity: "info",
      message: "Community is thriving with balanced engagement across categories. Keep up the momentum!",
      action: "View your dashboard",
      actionLink: "/dashboard",
    });
  }

  return nudges;
}
