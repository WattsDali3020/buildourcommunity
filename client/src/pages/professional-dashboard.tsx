import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Briefcase, Target, Award, DollarSign, MapPin, Clock, CheckCircle, XCircle, ExternalLink, Wallet, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { User, ProfessionalProfile, ProjectProfessionalMatch, TokenHolding, TokenOffering } from "@shared/schema";

interface Opportunity {
  offeringId: string;
  propertyId: string;
  propertyName: string;
  currentPhase: string;
  rolesNeeded: string[];
}
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ROLES: Record<string, string> = {
  contractor: "Contractor",
  realtor: "Realtor",
  attorney: "Attorney",
  engineer: "Engineer",
  architect: "Architect",
  lender: "Lender",
  inspector: "Inspector",
  appraiser: "Appraiser",
};

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Star; label: string; value: string | number; color: string; }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getMatchStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    invited: "outline",
    interested: "secondary",
    proposed: "secondary",
    selected: "default",
    rejected: "destructive",
  };
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
}

export default function ProfessionalDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  const { data: profile, isLoading: profileLoading } = useQuery<ProfessionalProfile | null>({
    queryKey: ["/api/user/professional-profile"],
    enabled: !!user,
  });

  const { data: matches = [] } = useQuery<ProjectProfessionalMatch[]>({
    queryKey: ["/api/professionals", profile?.id, "matches"],
    queryFn: async () => {
      if (!profile?.id) return [];
      const res = await fetch(`/api/professionals/${profile.id}/matches`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!profile?.id,
  });

  const { data: holdings = [] } = useQuery<TokenHolding[]>({
    queryKey: ["/api/user/holdings"],
    enabled: !!user,
  });

  const firstCounty = (profile?.serviceCounties || [])[0];

  const { data: opportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ["/api/professionals/opportunities", firstCounty],
    queryFn: async () => {
      if (!firstCounty) return [];
      const res = await fetch(`/api/professionals/opportunities/${encodeURIComponent(firstCounty)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!firstCounty && !!profile?.isLicenseVerified,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      return apiRequest("POST", `/api/professionals/matches/${matchId}/respond`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals", profile?.id, "matches"] });
      toast({ title: "Response submitted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to respond to match", variant: "destructive" });
    },
  });

  const expressInterestMutation = useMutation({
    mutationFn: async ({ offeringId, roleNeeded }: { offeringId: string; roleNeeded: string }) => {
      return apiRequest("POST", `/api/professionals/express-interest`, { offeringId, roleNeeded });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals/opportunities"] });
      toast({ title: "Interest expressed", description: "The project team has been notified." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to express interest", variant: "destructive" });
    },
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    if (typeof window !== "undefined") {
      setLocation("/professionals/apply");
    }
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Professional Profile</h2>
              <p className="text-muted-foreground mb-6">
                You haven't applied as a professional yet. Apply to get started.
              </p>
              <Link href="/professionals/apply">
                <Button data-testid="button-apply-redirect">Apply as a Professional</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile.isLicenseVerified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4" data-testid="card-pending-verification">
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Your professional profile is pending verification</h2>
              <p className="text-muted-foreground mb-4">
                Our admin team is reviewing your application. You'll be notified by email once your profile is verified.
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  Pending Review
                </Badge>
                <Badge variant="outline">{ROLES[profile.licenseType || ""] || profile.licenseType}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Applied {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "recently"}
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const activeMatches = matches.filter(m => m.status !== "rejected" && m.status !== "completed");
  const totalTokensEarned = holdings.reduce((sum, h) => sum + h.tokenCount, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Professional Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your projects, track reputation, and find opportunities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1" data-testid="badge-verified">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified {ROLES[profile.licenseType || ""] || "Professional"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" data-testid="section-stats">
            <StatCard
              icon={Star}
              label="Reputation Score"
              value={profile.reputationScore || 0}
              color="bg-yellow-500/10 text-yellow-500"
            />
            <StatCard
              icon={Briefcase}
              label="Completed Projects"
              value={profile.completedProjects || 0}
              color="bg-chart-2/10 text-chart-2"
            />
            <StatCard
              icon={Target}
              label="Active Matches"
              value={activeMatches.length}
              color="bg-chart-3/10 text-chart-3"
            />
            <StatCard
              icon={Award}
              label="Total Tokens Earned"
              value={totalTokensEarned}
              color="bg-primary/10 text-primary"
            />
          </div>

          <Card className="mb-8" data-testid="section-active-matches">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Active Project Matches
              </CardTitle>
              <CardDescription>Projects you've been matched with or invited to</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No project matches yet</p>
                  <p className="text-xs text-muted-foreground">
                    You'll be notified when project teams invite you to collaborate
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border"
                      data-testid={`match-${match.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium text-sm">{(match as any).propertyName || `Offering #${match.offeringId.slice(0, 8)}`}</p>
                          {getMatchStatusBadge(match.status || "invited")}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>Role: {ROLES[match.roleNeeded] || match.roleNeeded}</span>
                          {match.tokenAllocationPercent && (
                            <span>Token allocation: {match.tokenAllocationPercent}%</span>
                          )}
                          {match.proposedAmount && (
                            <span>Amount: ${Number(match.proposedAmount).toLocaleString()}</span>
                          )}
                          {match.invitedAt && (
                            <span>Invited: {new Date(match.invitedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {match.status === "invited" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => respondMutation.mutate({ matchId: match.id, status: "interested" })}
                              disabled={respondMutation.isPending}
                              data-testid={`button-interested-${match.id}`}
                            >
                              I'm Interested
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondMutation.mutate({ matchId: match.id, status: "rejected" })}
                              disabled={respondMutation.isPending}
                              data-testid={`button-not-available-${match.id}`}
                            >
                              Not Available
                            </Button>
                          </>
                        )}
                        {(match.status === "interested" || match.status === "proposed" || match.status === "selected") && (match as any).propertyId && (
                          <Link href={`/properties/${(match as any).propertyId}`}>
                            <Button size="sm" variant="outline" data-testid={`button-view-project-${match.id}`}>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Project
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-8" data-testid="section-holdings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Token Holdings
              </CardTitle>
              <CardDescription>Tokens earned across completed projects</CardDescription>
            </CardHeader>
            <CardContent>
              {holdings.length > 0 ? (
                <div className="space-y-3">
                  {holdings.map((h, index) => {
                    const phase = (h as any).purchasePhase || "county";
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
                            <p className="font-medium text-sm truncate">Property #{(h as any).propertyId || h.offeringId.slice(0, 8)}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">{phaseInfo.label}</Badge>
                              <span className={`text-xs font-semibold ${phaseInfo.color}`}>{phaseInfo.value}x voting</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-sm">{h.tokenCount.toLocaleString()} tokens</p>
                          <p className="text-xs text-muted-foreground">
                            ${tokenValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No token holdings yet</p>
                  <p className="text-xs text-muted-foreground">
                    Complete projects to earn tokens
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {firstCounty && (
            <Card data-testid="section-opportunities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Opportunities in Your Area
                </CardTitle>
                <CardDescription>Active projects in {firstCounty} County that need your expertise</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-1">No open opportunities in {firstCounty} County right now</p>
                    <p className="text-xs text-muted-foreground">
                      We'll notify you when new projects need a {ROLES[profile.licenseType || ""] || "professional"} in your area
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunities.map((opp, index) => {
                      const myRole = profile.licenseType || "contractor";
                      const needsMyRole = opp.rolesNeeded.includes(myRole);
                      return (
                        <div
                          key={opp.offeringId}
                          className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border"
                          data-testid={`opportunity-${index}`}
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{opp.propertyName}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
                              <span>Phase: {opp.currentPhase}</span>
                              <span>Roles needed: {opp.rolesNeeded.map(r => ROLES[r] || r).join(", ")}</span>
                            </div>
                          </div>
                          {needsMyRole && (
                            <Button
                              size="sm"
                              onClick={() => expressInterestMutation.mutate({ offeringId: opp.offeringId, roleNeeded: myRole })}
                              disabled={expressInterestMutation.isPending}
                              data-testid={`button-express-interest-${index}`}
                            >
                              Express Interest
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}