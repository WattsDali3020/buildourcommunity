import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconTray, type IconTrayItem } from "@/components/IconTray";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Briefcase, MapPin, Mail, DollarSign, Building2, Gavel, Vote,
  Trophy, TrendingUp, TrendingDown, Minus, Heart, Zap, Hammer, Timer,
  Crown, Shield, Star, Users, Award, UserPlus
} from "lucide-react";
import { Link } from "wouter";
import { insertServiceBidSchema, type ServiceBid } from "@shared/schema";
import {
  generateLeagueCities,
  getCurrentSeason,
  getRankBadge,
  LEAGUES,
  type LeagueType,
} from "@/lib/league-data";

const LEAGUE_ICONS: Record<LeagueType, typeof TrendingUp> = {
  gdp: TrendingUp,
  social: Heart,
  engagement: Zap,
  builder: Hammer,
};

const SERVICE_TYPES = [
  "Title Work", "Loan Structuring", "Property Assessment",
  "Foreclosure Services", "Property Management", "Legal Services",
];

const formSchema = insertServiceBidSchema.extend({
  serviceType: z.string().min(1, "Service type is required"),
  zipCode: z.string().min(5, "Valid zip code required"),
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Valid email required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  bidAmount: z.string().min(1, "Bid amount is required"),
});
type FormValues = z.infer<typeof formSchema>;

const iconTrayItems: IconTrayItem[] = [
  { id: "directories", label: "Directories", icon: Briefcase },
  { id: "revitaleague", label: "RevitaLeague", icon: Trophy },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "join", label: "Join as Pro", icon: UserPlus },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "steady" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function DirectoriesSection() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { serviceType: "", zipCode: "", companyName: "", contactEmail: "", description: "", bidAmount: "" },
  });

  const { data: bids, isLoading } = useQuery<ServiceBid[]>({ queryKey: ["/api/service-bids"] });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/service-bids", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bids"] });
      toast({ title: "Bid submitted", description: "Your service bid has been submitted for review." });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit bid.", variant: "destructive" });
    },
  });

  function statusVariant(status: string | null) {
    if (status === "approved") return "default" as const;
    if (status === "rejected") return "destructive" as const;
    return "secondary" as const;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2" data-testid="text-directories-title">Service Provider Directories</h3>
        <p className="text-muted-foreground text-sm">
          Contractors, realtors, and attorneys can submit bids for community properties.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4" data-testid="text-submit-bid-heading">Submit a Service Bid</h4>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="serviceType" render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger data-testid="select-service-type"><SelectValue placeholder="Select service type" /></SelectTrigger></FormControl>
                  <SelectContent>{SERVICE_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="zipCode" render={({ field }) => (
              <FormItem>
                <FormLabel>Service Area (Zip Code)</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. 30114" data-testid="input-zip-code" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl><Input {...field} placeholder="Your company name" data-testid="input-company-name" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl><Input {...field} type="email" placeholder="contact@company.com" data-testid="input-contact-email" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} placeholder="Describe your services..." data-testid="input-description" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bidAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>Bid Amount ($)</FormLabel>
                <FormControl><Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-bid-amount" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex items-end">
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-bid">
                <Briefcase className="mr-2 h-4 w-4" />{createMutation.isPending ? "Submitting..." : "Submit Bid"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <h4 className="text-lg font-semibold" data-testid="text-existing-bids-heading">Submitted Bids</h4>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<Card key={i} className="p-4"><Skeleton className="h-5 w-3/4 mb-3" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-8 w-20" /></Card>))}
        </div>
      ) : !bids || bids.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground" data-testid="text-no-bids">No service bids yet. Be the first to submit one!</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bids.map(bid => (
            <Card key={bid.id} className="p-4 flex flex-col gap-3" data-testid={`card-bid-${bid.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-muted-foreground shrink-0" />
                  <h4 className="font-semibold text-sm" data-testid={`text-bid-service-${bid.id}`}>{bid.serviceType}</h4>
                </div>
                <Badge variant={statusVariant(bid.status)} data-testid={`badge-status-${bid.id}`}>{bid.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{bid.companyName}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{bid.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{bid.zipCode}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{bid.contactEmail}</span>
              </div>
              <div className="mt-auto pt-2 flex items-center gap-1 text-sm font-semibold">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{Number(bid.bidAmount).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RevitaLeagueSection() {
  const [activeLeague, setActiveLeague] = useState<LeagueType>("gdp");
  const cities = useMemo(() => generateLeagueCities(25), []);
  const season = useMemo(() => getCurrentSeason(cities), [cities]);

  const sorted = [...cities].sort((a, b) => b.scores[activeLeague] - a.scores[activeLeague]);
  const top3 = sorted.slice(0, 3);
  const medals = ["text-yellow-400", "text-slate-300", "text-amber-600"];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2" data-testid="text-league-title">RevitaLeague</h3>
        <p className="text-muted-foreground text-sm">Every property is a city. Every investor is a builder. Compete to revitalize.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold" data-testid="text-season-name">Season {season.number} — {season.name}</p>
                <p className="text-sm text-muted-foreground">RevitaCup Competition</p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary" data-testid="text-days-remaining">{season.daysRemaining}</p>
                <p className="text-xs text-muted-foreground">Days Left</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-3">${(season.bonusPool / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Bonus Pool</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 flex-wrap">
        {LEAGUES.map(league => {
          const Icon = LEAGUE_ICONS[league.id];
          const isActive = activeLeague === league.id;
          return (
            <Button key={league.id} variant={isActive ? "default" : "outline"} size="sm" onClick={() => setActiveLeague(league.id)} data-testid={`button-league-tab-${league.id}`}>
              <Icon className="h-4 w-4 mr-1.5" />{league.name}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {top3.map((city, idx) => {
          const badge = getRankBadge(idx + 1);
          const LeagueIcon = LEAGUE_ICONS[activeLeague];
          return (
            <Card key={city.id} data-testid={`card-top3-${idx + 1}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className={`h-5 w-5 ${medals[idx]}`} />
                  <Badge variant="outline" className={badge.color}>{badge.label}</Badge>
                </div>
                <h4 className="font-semibold text-base mb-1" data-testid={`text-top3-name-${idx + 1}`}>{city.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{city.county.name} County, GA</p>
                <div className="flex items-center gap-2">
                  <LeagueIcon className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold" data-testid={`text-top3-score-${idx + 1}`}>{city.scores[activeLeague].toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendIcon trend={city.trend} />
                  <span className="text-xs text-muted-foreground capitalize">{city.trend}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{city.seasonWins} wins</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid={`table-leaderboard-${activeLeague}`}>
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-3 font-medium text-muted-foreground">Rank</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground">City</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">County</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">Score</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((city, idx) => {
                  const badge = getRankBadge(idx + 1);
                  return (
                    <tr key={city.id} className={`border-b last:border-0 ${idx < 10 ? "bg-primary/5" : ""}`} data-testid={`row-leaderboard-${city.id}`}>
                      <td className="py-2.5 px-3"><Badge variant="outline" className={`${badge.color} text-xs`}>{badge.label}</Badge></td>
                      <td className="py-2.5 px-3 font-medium">{city.name}</td>
                      <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{city.county.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">{city.scores[activeLeague].toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center"><div className="flex justify-center"><TrendIcon trend={city.trend} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AchievementsSection() {
  const achievements = [
    { id: "first-vote", name: "First Vote", description: "Cast your first governance vote", icon: Vote, earned: false },
    { id: "community-builder", name: "Community Builder", description: "Submit 5 community wishes", icon: Heart, earned: false },
    { id: "early-investor", name: "Early Investor", description: "Purchase tokens in Phase 1", icon: Star, earned: false },
    { id: "top-contributor", name: "Top Contributor", description: "Reach top 10 in any league", icon: Trophy, earned: false },
    { id: "property-champion", name: "Property Champion", description: "Help fund a property to 100%", icon: Building2, earned: false },
    { id: "team-player", name: "Team Player", description: "Participate in 10 governance votes", icon: Users, earned: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Achievement Gallery</h3>
        <p className="text-muted-foreground text-sm">Earn badges by participating in the community.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {achievements.map(ach => {
          const Icon = ach.icon;
          return (
            <Card key={ach.id} className={`p-4 text-center ${ach.earned ? "" : "opacity-50"}`} data-testid={`card-achievement-${ach.id}`}>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-sm mb-1">{ach.name}</h4>
              <p className="text-xs text-muted-foreground">{ach.description}</p>
              <Badge variant={ach.earned ? "default" : "secondary"} className="mt-2 text-xs">{ach.earned ? "Earned" : "Locked"}</Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function JoinAsProSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Join as a Professional</h3>
        <p className="text-muted-foreground text-sm">Offer your expertise to community development projects.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Professional Track</h4>
              <p className="text-xs text-muted-foreground">Licensed contractors, realtors, attorneys</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />Verified credentials and licenses</li>
            <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />Priority access to service bids</li>
            <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />Reputation scoring and reviews</li>
          </ul>
          <Link href="/professionals/apply">
            <Button className="w-full" data-testid="button-apply-professional"><UserPlus className="mr-2 h-4 w-4" />Apply Now</Button>
          </Link>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <h4 className="font-semibold">Community Track</h4>
              <p className="text-xs text-muted-foreground">Volunteers, advocates, organizers</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            <li className="flex items-start gap-2"><Heart className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />Community engagement rewards</li>
            <li className="flex items-start gap-2"><Heart className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />RevitaLeague competition access</li>
            <li className="flex items-start gap-2"><Heart className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />Achievement badges and recognition</li>
          </ul>
          <Link href="/community">
            <Button variant="outline" className="w-full" data-testid="button-join-community"><Heart className="mr-2 h-4 w-4" />Get Involved</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

export default function Participate() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && iconTrayItems.some(item => item.id === hash)) {
      setActiveSection(hash);
    }
  }, []);

  const handleSelect = (id: string) => {
    setActiveSection(id || null);
    if (id) window.history.replaceState(null, "", `/participate#${id}`);
    else window.history.replaceState(null, "", "/participate");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-participate-title">Participate</h1>
            <p className="text-muted-foreground">
              Join the movement — whether you're a licensed professional or a community advocate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Professional Track</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Licensed contractors, realtors, attorneys, and service providers can bid on community development projects.
              </p>
            </Card>
            <Card className="p-6 border-chart-3/20">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-chart-3" />
                <h3 className="text-lg font-semibold">Community Track</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Compete in the RevitaLeague, earn achievement badges, and shape your neighborhood's future.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Professionals</p>
                  <p className="text-xl font-semibold" data-testid="text-active-pros">0</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">League Competitors</p>
                  <p className="text-xl font-semibold" data-testid="text-competitors">25</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-xl font-semibold" data-testid="text-badges">0</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <IconTray items={iconTrayItems} activeId={activeSection} onSelect={handleSelect} className="mb-2" />

          <ExpandableSection id="directories" isOpen={activeSection === "directories"}>
            <DirectoriesSection />
          </ExpandableSection>

          <ExpandableSection id="revitaleague" isOpen={activeSection === "revitaleague"}>
            <RevitaLeagueSection />
          </ExpandableSection>

          <ExpandableSection id="achievements" isOpen={activeSection === "achievements"}>
            <AchievementsSection />
          </ExpandableSection>

          <ExpandableSection id="join" isOpen={activeSection === "join"}>
            <JoinAsProSection />
          </ExpandableSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
