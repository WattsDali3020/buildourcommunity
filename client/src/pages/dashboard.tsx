import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TransactionHistory } from "@/components/TransactionHistory";
import { KYCVerification } from "@/components/KYCVerification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Settings, Bell, Wallet, TrendingUp, Vote, DollarSign, Award, Target, Users, Zap, Shield, Star, Lock, CheckCircle, Trophy, Hammer, Crown, ArrowRight } from "lucide-react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import { Link } from "wouter";
import type { User, TokenHolding } from "@shared/schema";
import { generateLeagueCities, getBuilderProfile, getRankBadge, type BuilderProfile as BuilderProfileType } from "@/lib/league-data";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Award;
  category: "investment" | "community" | "governance" | "milestone";
  earned: boolean;
  progress: number;
  maxProgress: number;
  earnedDate?: string;
}

function getAchievements(holdings: TokenHolding[], totalTokens: number, totalVotingPower: number): Achievement[] {
  const hasInvestment = holdings.length > 0;
  const propertyCount = holdings.length;

  return [
    {
      id: "first-investment",
      title: "First Investment",
      description: "Make your first token purchase",
      icon: DollarSign,
      category: "investment",
      earned: hasInvestment,
      progress: hasInvestment ? 1 : 0,
      maxProgress: 1,
      earnedDate: hasInvestment ? "Earned" : undefined,
    },
    {
      id: "diversified-portfolio",
      title: "Diversified Portfolio",
      description: "Invest in 3 different properties",
      icon: Target,
      category: "investment",
      earned: propertyCount >= 3,
      progress: Math.min(propertyCount, 3),
      maxProgress: 3,
      earnedDate: propertyCount >= 3 ? "Earned" : undefined,
    },
    {
      id: "phase-pioneer",
      title: "Phase Pioneer",
      description: "Participate in a county-level phase before it advances",
      icon: Zap,
      category: "investment",
      earned: hasInvestment,
      progress: hasInvestment ? 1 : 0,
      maxProgress: 1,
      earnedDate: hasInvestment ? "Earned" : undefined,
    },
    {
      id: "community-champion",
      title: "Community Champion",
      description: "Accumulate 100 tokens across all properties",
      icon: Users,
      category: "community",
      earned: totalTokens >= 100,
      progress: Math.min(totalTokens, 100),
      maxProgress: 100,
      earnedDate: totalTokens >= 100 ? "Earned" : undefined,
    },
    {
      id: "governance-voter",
      title: "Governance Voter",
      description: "Cast your first governance vote",
      icon: Vote,
      category: "governance",
      earned: totalVotingPower > 0 && hasInvestment,
      progress: totalVotingPower > 0 && hasInvestment ? 1 : 0,
      maxProgress: 1,
      earnedDate: totalVotingPower > 0 && hasInvestment ? "Earned" : undefined,
    },
    {
      id: "diamond-hands",
      title: "Diamond Hands",
      description: "Hold tokens for 30+ days",
      icon: Shield,
      category: "milestone",
      earned: false,
      progress: 0,
      maxProgress: 30,
    },
    {
      id: "whale-investor",
      title: "Whale Investor",
      description: "Own 500+ tokens total",
      icon: Star,
      category: "milestone",
      earned: totalTokens >= 500,
      progress: Math.min(totalTokens, 500),
      maxProgress: 500,
      earnedDate: totalTokens >= 500 ? "Earned" : undefined,
    },
    {
      id: "active-participant",
      title: "Active Participant",
      description: "Participate in 5 governance votes",
      icon: Award,
      category: "governance",
      earned: false,
      progress: 0,
      maxProgress: 5,
    },
  ];
}

const CATEGORY_LABELS: Record<Achievement["category"], string> = {
  investment: "Investment",
  community: "Community",
  governance: "Governance",
  milestone: "Milestone",
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon;
  const progressPercent = achievement.maxProgress > 0 ? (achievement.progress / achievement.maxProgress) * 100 : 0;

  return (
    <div
      className={`relative flex items-start gap-3 p-3 rounded-md border ${
        achievement.earned
          ? "bg-primary/5 border-primary/20"
          : "bg-muted/30 border-border"
      }`}
      data-testid={`achievement-${achievement.id}`}
    >
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
          achievement.earned
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {achievement.earned ? (
          <Icon className="h-5 w-5" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-medium ${achievement.earned ? "" : "text-muted-foreground"}`}>
            {achievement.title}
          </p>
          {achievement.earned && (
            <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{achievement.description}</p>
        {!achievement.earned && achievement.maxProgress > 1 && (
          <div className="mt-2">
            <Progress value={progressPercent} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.progress} / {achievement.maxProgress}
            </p>
          </div>
        )}
        {achievement.earnedDate && (
          <p className="text-xs text-primary mt-1">{achievement.earnedDate}</p>
        )}
      </div>
    </div>
  );
}

function BuilderLeagueCard({
  holdings,
  totalTokens,
  totalVotingPower,
}: {
  holdings: TokenHolding[];
  totalTokens: number;
  totalVotingPower: number;
}) {
  const cities = useMemo(() => generateLeagueCities(20), []);
  const propertiesInvested = holdings.length || 2;
  const tokensHeld = totalTokens || 45;
  const votesCount = totalVotingPower > 0 ? Math.max(3, Math.floor(totalVotingPower / 10)) : 3;

  const profile = getBuilderProfile(tokensHeld, propertiesInvested, votesCount, cities);
  const rankBadge = getRankBadge(profile.rank);

  return (
    <Card className="mb-8" data-testid="section-builder-league">
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-primary" />
            Builder League
          </CardTitle>
          <CardDescription>Your personal competition stats across all cities</CardDescription>
        </div>
        <Link href="/league">
          <Button variant="outline" size="sm" data-testid="link-view-league">
            View Leaderboard
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border" data-testid="text-builder-rank">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Builder Rank</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg font-semibold">#{profile.rank}</p>
                <Badge variant="outline" className={rankBadge.color}>
                  {rankBadge.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border" data-testid="text-builder-score">
            <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Score</p>
              <p className="text-lg font-semibold">{profile.totalScore.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border" data-testid="text-cities-contributed">
            <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cities Contributed</p>
              <p className="text-lg font-semibold">{profile.citiesContributed}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border" data-testid="text-best-city">
            <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best City</p>
              <p className="text-sm font-semibold truncate">{profile.bestCityName}</p>
              <p className="text-xs text-muted-foreground">Rank #{profile.bestCityRank}</p>
            </div>
          </div>
        </div>

        {profile.bonusAPR > 0 && (
          <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20 flex items-center gap-3" data-testid="text-bonus-apr">
            <Star className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Season Bonus Active</p>
              <p className="text-xs text-muted-foreground">
                Your best city is in the top 50 — you earn <span className="text-primary font-semibold">+{profile.bonusAPR}% APR</span> bonus this season
              </p>
            </div>
          </div>
        )}

        {profile.bonusAPR === 0 && (
          <div className="mt-4 p-3 rounded-md bg-muted/30 border flex items-center gap-3" data-testid="text-no-bonus-apr">
            <Star className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Season Bonus</p>
              <p className="text-xs text-muted-foreground">
                Get your best city into the top 50 to earn +0.75% APR bonus
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  const { data: holdings = [] } = useQuery<TokenHolding[]>({
    queryKey: ["/api/user/holdings"],
    enabled: !!user,
  });

  const totalValue = holdings.reduce((sum, h) => {
    const value = h.tokenCount * parseFloat(h.averagePurchasePrice || "0");
    return sum + value;
  }, 0);

  const totalTokens = holdings.reduce((sum, h) => sum + h.tokenCount, 0);
  const totalVotingPower = holdings.reduce((sum, h) => sum + (h.votingPower || 0), 0);

  const achievements = getAchievements(holdings, totalTokens, totalVotingPower);
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Investor Dashboard</h1>
              <p className="text-muted-foreground">
                Track your investments, earnings, and community impact
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-xl font-semibold" data-testid="text-portfolio-value">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-xl font-semibold" data-testid="text-total-tokens">{totalTokens}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Vote className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voting Power</p>
                  <p className="text-xl font-semibold" data-testid="text-voting-power">{totalVotingPower}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet</p>
                  {isConnected ? (
                    <p className="text-sm font-mono" data-testid="text-wallet-address">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  ) : (
                    <WalletButton />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="portfolio" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="portfolio" data-testid="tab-portfolio">Portfolio</TabsTrigger>
                  <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="dividends" data-testid="tab-dividends">Dividends</TabsTrigger>
                </TabsList>

                <TabsContent value="portfolio">
                  <PortfolioOverview />
                </TabsContent>

                <TabsContent value="transactions">
                  <TransactionHistory />
                </TabsContent>

                <TabsContent value="dividends">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dividend History</CardTitle>
                      <CardDescription>Your earnings from property investments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        No dividends yet. Dividends are distributed quarterly once properties are operational.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <KYCVerification user={user} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investor Protection</CardTitle>
                  <CardDescription>Your investment is protected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">100%</Badge>
                    <p className="text-muted-foreground">
                      Full funding required for loan issuance. If not met within 1 year, you receive a full refund plus 3% APR.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3% APR</Badge>
                    <p className="text-muted-foreground">
                      Compensation on refunds if the property fails to meet its funding goal.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Transfer</Badge>
                    <p className="text-muted-foreground">
                      Option to transfer your shares to another investor instead of receiving a refund.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mb-8" data-testid="section-my-holdings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                My Holdings
              </CardTitle>
              <CardDescription>Per-property token breakdown with phase multipliers</CardDescription>
            </CardHeader>
            <CardContent>
              {holdings.length > 0 ? (
                <div className="space-y-3">
                  {holdings.map((h, index) => {
                    const phase = h.purchasePhase || "county";
                    const multiplierMap: Record<string, { label: string; value: number; color: string }> = {
                      county: { label: "County", value: 1.5, color: "text-green-500" },
                      state: { label: "State", value: 1.25, color: "text-blue-500" },
                      national: { label: "National", value: 1.0, color: "text-purple-500" },
                      international: { label: "International", value: 0.75, color: "text-amber-500" },
                    };
                    const phaseInfo = multiplierMap[phase] || multiplierMap.county;
                    const tokenValue = h.tokenCount * parseFloat(h.averagePurchasePrice || "0");

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border"
                        data-testid={`holding-${index}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">Property #{h.propertyId}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">
                                {phaseInfo.label}
                              </Badge>
                              <span className={`text-xs font-semibold ${phaseInfo.color}`}>
                                {phaseInfo.value}x voting
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-sm">{h.tokenCount.toLocaleString()} tokens</p>
                          <p className="text-xs text-muted-foreground">
                            ${tokenValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-primary">
                            {Math.round(h.tokenCount * phaseInfo.value)} voting power
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No holdings yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Purchase tokens to see your per-property breakdown with phase multipliers
                  </p>
                  <Button asChild size="sm" data-testid="button-browse-properties">
                    <a href="/properties">Browse Properties</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <BuilderLeagueCard
            holdings={holdings}
            totalTokens={totalTokens}
            totalVotingPower={totalVotingPower}
          />

          <Card data-testid="section-achievements">
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  {earnedCount} of {achievements.length} achievements earned
                </CardDescription>
              </div>
              <Badge variant="secondary" data-testid="badge-achievements-count">
                {earnedCount}/{achievements.length}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress
                  value={(earnedCount / achievements.length) * 100}
                  className="h-2"
                  data-testid="progress-achievements"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
