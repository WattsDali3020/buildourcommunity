import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Lock,
  Calendar,
  Building2,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
  Shield,
  BarChart3,
  Heart,
} from "lucide-react";
import { Link } from "wouter";
import type { Property } from "@shared/schema";

export default function FounderDashboard() {
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: stats } = useQuery<{
    totalProperties: number;
    totalUsers: number;
    totalInvested: string;
    activeProposals: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const totalInvested = parseFloat(stats?.totalInvested || "0");
  const totalProperties = stats?.totalProperties || properties.length || 0;
  const totalUsers = stats?.totalUsers || 0;

  const founderCutBps = 100;
  const founderCutPercent = founderCutBps / 100;
  const totalTreasuryOutflows = totalInvested * 0.7;
  const founderEarningsToDate = totalTreasuryOutflows * (founderCutPercent / 100);

  const vestingStartDate = new Date("2025-12-01");
  const vestingCliffDate = new Date(vestingStartDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  const vestingEndDate = new Date(vestingStartDate.getTime() + 730 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const vestingElapsed = Math.max(0, now.getTime() - vestingStartDate.getTime());
  const vestingTotal = vestingEndDate.getTime() - vestingStartDate.getTime();
  const vestingPercent = Math.min(100, Math.round((vestingElapsed / vestingTotal) * 100));
  const pastCliff = now >= vestingCliffDate;
  const claimablePercent = pastCliff ? vestingPercent : 0;

  const projections = [
    { tvl: 1000000, label: "$1M", founderRev: 7000 },
    { tvl: 5000000, label: "$5M", founderRev: 35000 },
    { tvl: 10000000, label: "$10M", founderRev: 70000 },
    { tvl: 50000000, label: "$50M", founderRev: 350000 },
    { tvl: 100000000, label: "$100M", founderRev: 700000 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-semibold" data-testid="text-founder-title">
                  Founder Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground">
                Build Our Community, LLC — Platform sustainability metrics
              </p>
            </div>
            <Link href="/demand">
              <Button variant="outline" data-testid="link-demand-dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Community Control Panel
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founder Earnings</p>
                  <p className="text-xl font-semibold" data-testid="text-founder-earnings">
                    ${founderEarningsToDate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform TVL</p>
                  <p className="text-xl font-semibold" data-testid="text-platform-tvl">
                    ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Properties</p>
                  <p className="text-xl font-semibold" data-testid="text-properties-count">
                    {totalProperties}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Community Members</p>
                  <p className="text-xl font-semibold" data-testid="text-community-members">
                    {totalUsers}
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
                    <Lock className="h-5 w-5" />
                    Founder Vesting Schedule
                  </CardTitle>
                  <CardDescription>
                    24-month linear vesting with 90-day cliff — aligned with long-term community success
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium">Vesting Progress</span>
                      <span className="text-sm font-mono font-semibold">{vestingPercent}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={vestingPercent} className="h-4" />
                      <div
                        className="absolute top-0 h-4 w-0.5 bg-destructive"
                        style={{ left: `${(90 / 730) * 100}%` }}
                        title="90-day cliff"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>Start: {vestingStartDate.toLocaleDateString()}</span>
                      <span className="text-destructive">Cliff: {vestingCliffDate.toLocaleDateString()}</span>
                      <span>End: {vestingEndDate.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-md bg-muted/50 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">Cliff Status</p>
                      <p className="text-sm font-semibold">
                        {pastCliff ? (
                          <Badge variant="default">Passed</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </p>
                    </div>
                    <div className="p-4 rounded-md bg-muted/50 text-center">
                      <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">Claimable</p>
                      <p className="text-sm font-semibold">{claimablePercent}%</p>
                    </div>
                    <div className="p-4 rounded-md bg-muted/50 text-center">
                      <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                      <p className="text-sm font-semibold">{Math.max(0, 730 - Math.floor(vestingElapsed / (24 * 60 * 60 * 1000)))} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Projections
                  </CardTitle>
                  <CardDescription>
                    Founder revenue at 1% of treasury outflows — scales with platform success
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
                      <span>Platform TVL</span>
                      <span>Treasury Outflows (est. 70%)</span>
                      <span>Founder Revenue (1%)</span>
                    </div>
                    {projections.map((proj) => (
                      <div key={proj.label} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-sm font-medium">{proj.label}</span>
                        <span className="text-sm text-muted-foreground">
                          ${(proj.tvl * 0.7).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            ${proj.founderRev.toLocaleString()}
                          </span>
                          {proj.tvl <= totalInvested * 2 && totalInvested > 0 && (
                            <Badge variant="outline" className="text-xs">Current pace</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="p-3 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      Revenue is 1% of all treasury disbursements (FOUNDER_CUT_BPS = 100). This includes
                      property development funds, dividend distributions, and operational expenses approved
                      by the DAO. If projects fail and refunds are issued, no founder revenue is generated.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground">Properties Tokenized</span>
                      <span className="text-sm font-semibold">{totalProperties}</span>
                    </div>
                    <Progress value={Math.min((totalProperties / 100) * 100, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 100 properties</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground">Community Members</span>
                      <span className="text-sm font-semibold">{totalUsers}</span>
                    </div>
                    <Progress value={Math.min((totalUsers / 1000) * 100, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 1,000 members</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground">TVL Growth</span>
                      <span className="text-sm font-semibold">
                        ${totalInvested.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={Math.min((totalInvested / 10000000) * 100, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: $10M TVL</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Alignment Model
                  </CardTitle>
                  <CardDescription>
                    Why 1% works for everyone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 shrink-0">1%</Badge>
                    <p className="text-muted-foreground">
                      Founder cut on treasury outflows. No upfront token allocation, no pre-mine.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 shrink-0">0%</Badge>
                    <p className="text-muted-foreground">
                      If projects fail, refunds protect investors and founder earns nothing.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 shrink-0">24mo</Badge>
                    <p className="text-muted-foreground">
                      Vesting schedule with 90-day cliff ensures long-term commitment.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 shrink-0">DAO</Badge>
                    <p className="text-muted-foreground">
                      All treasury outflows are DAO-approved. Transparent and auditable via Chainlink.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contact</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Build Our Community, LLC</p>
                  <p>Daniel Emery, Founder</p>
                  <p>DEmery@buildourcommunity.co</p>
                  <p>Cherokee County, GA</p>
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
