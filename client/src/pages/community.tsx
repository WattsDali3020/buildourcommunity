import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconTray, type IconTrayItem } from "@/components/IconTray";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Plus, ThumbsUp, Users, Vote, Building2,
  Briefcase, Home, Heart, GraduationCap, Baby,
  UtensilsCrossed, Palette, TreePine,
  TrendingUp, BarChart3,
  Search, Zap, Sprout, Factory, Rocket, Warehouse, HeartPulse, ShieldAlert,
  Eye, Camera
} from "lucide-react";
import type { Wish } from "@shared/schema";
import {
  STATE_GDP,
  TOTAL_COUNTIES,
  ADOPTION_TIERS,
  generateProjects,
  calculateTierImpact,
  getDistressColor,
  getDistressLabel,
  formatCurrency,
  type ProjectType,
} from "@/lib/georgia-impact-data";

interface CommunityNeed {
  id: string;
  category: string;
  need: string;
  description?: string;
  voteCount: number;
  hasVoted: boolean;
}

const communityNeeds: CommunityNeed[] = [];

const categoryIcons: Record<string, any> = {
  Housing: Home,
  Jobs: Briefcase,
  Healthcare: Heart,
  Youth: Users,
  Food: UtensilsCrossed,
  Childcare: Baby,
  Community: Building2,
  Transportation: MapPin,
  Culture: Palette,
  Education: GraduationCap,
  Recreation: TreePine,
};

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

const WISH_CATEGORIES = [
  "All", "Housing", "Retail", "Entertainment", "Parks & Recreation",
  "Restaurant", "Healthcare", "Education", "Services", "Transportation",
];

const iconTrayItems: IconTrayItem[] = [
  { id: "gdp-simulator", label: "GDP Simulator", icon: BarChart3 },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "needs-map", label: "Needs Map", icon: MapPin },
  { id: "before-after", label: "Before/After", icon: Camera },
];

function GDPSimulatorSection() {
  const [selectedTierIndex, setSelectedTierIndex] = useState(1);
  const selectedTier = ADOPTION_TIERS[selectedTierIndex];
  const tierImpact = useMemo(() => calculateTierImpact(selectedTier), [selectedTier]);
  const sampleProjects = useMemo(() => generateProjects(selectedTier, 5), [selectedTier]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2" data-testid="text-gdp-simulator-title">Georgia County Impact Simulator</h3>
        <p className="text-muted-foreground text-sm">
          GDP projections calibrated against BEA RIMS II multipliers and ARC distress classifications.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">State GDP</p>
            <p className="text-xl font-bold" data-testid="text-state-gdp">{formatCurrency(STATE_GDP, true)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Counties</p>
            <p className="text-xl font-bold">{selectedTier.counties}<span className="text-sm font-normal text-muted-foreground"> / {TOTAL_COUNTIES}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Projects</p>
            <p className="text-xl font-bold">{selectedTier.projects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">5-Year Impact</p>
            <p className="text-xl font-bold">{formatCurrency(tierImpact.totalGDP, true)}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Adoption Tier</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ADOPTION_TIERS.map((tier, idx) => (
            <Card
              key={tier.percent}
              className={`cursor-pointer transition-colors ${idx === selectedTierIndex ? "border-primary ring-1 ring-primary" : "hover:bg-muted/50"}`}
              onClick={() => setSelectedTierIndex(idx)}
              data-testid={`button-tier-${tier.percent}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <Badge variant={idx === selectedTierIndex ? "default" : "secondary"}>{tier.percent}%</Badge>
                  <span className="text-xs font-semibold">{tier.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{tier.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleProjects.map((project, idx) => {
          const Icon = PROJECT_ICONS[project.projectType] || Building2;
          return (
            <Card key={idx} data-testid={`card-project-${idx}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{project.county.name}</span>
                  <Badge variant="outline" className={`text-xs ${getDistressColor(project.county.distressLevel)}`}>
                    {getDistressLabel(project.county.distressLevel)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{project.projectType}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-semibold">{formatCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">GDP Impact</p>
                    <p className="font-semibold">{formatCurrency(project.gdpImpact, true)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function WishlistSection() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [zipSearch, setZipSearch] = useState("");
  const [activeZip, setActiveZip] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formZipCode, setFormZipCode] = useState("");

  const { data: wishes, isLoading } = useQuery<Wish[]>({
    queryKey: ["/api/wishes", activeZip],
    queryFn: async () => {
      const url = activeZip ? `/api/wishes?zipCode=${activeZip}` : "/api/wishes";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch wishes");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: string; location: string; zipCode?: string }) => {
      const res = await apiRequest("POST", "/api/wishes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/wishes") });
      toast({ title: "Wish submitted!", description: "Your community wish has been added." });
      setDialogOpen(false);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/wishes/${id}/vote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/wishes") });
    },
  });

  const filtered = wishes
    ? wishes
        .filter((w) => selectedCategory === "All" || w.category === selectedCategory)
        .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    : [];

  function handleZipSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = zipSearch.trim();
    if (cleaned && /^\d{5}$/.test(cleaned)) setActiveZip(cleaned);
    else if (cleaned === "") setActiveZip("");
    else toast({ title: "Invalid zip code", description: "Please enter a valid 5-digit zip code.", variant: "destructive" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold" data-testid="text-wishlist-title">Community Wishlist</h3>
          <p className="text-muted-foreground text-sm mt-1">Tell us what your community needs.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-submit-wish"><Plus className="mr-2 h-4 w-4" />Submit a Wish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit a Community Wish</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ title: formTitle, description: formDescription, category: formCategory, location: formLocation, zipCode: formZipCode || undefined }); }} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <Label>Title *</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="What does your community need?" data-testid="input-wish-title" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Description *</Label>
                <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Describe the wish..." data-testid="input-wish-description" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger data-testid="select-wish-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {WISH_CATEGORIES.filter(c => c !== "All").map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Location *</Label>
                <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="City, State" data-testid="input-wish-location" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Zip Code</Label>
                <Input value={formZipCode} onChange={(e) => setFormZipCode(e.target.value)} placeholder="5-digit zip" maxLength={5} data-testid="input-wish-zipcode" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-wish-form">
                {createMutation.isPending ? "Submitting..." : "Submit Wish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <form onSubmit={handleZipSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <Label className="text-sm font-medium flex items-center gap-1"><Search className="h-3.5 w-3.5" />Search by Zip Code</Label>
            <Input value={zipSearch} onChange={(e) => setZipSearch(e.target.value)} placeholder="Enter 5-digit zip code" maxLength={5} data-testid="input-zip-search" />
          </div>
          <Button type="submit" data-testid="button-zip-search"><Search className="mr-2 h-4 w-4" />Search</Button>
          {activeZip && <Button type="button" variant="outline" onClick={() => { setZipSearch(""); setActiveZip(""); }} data-testid="button-clear-zip">Clear</Button>}
        </form>
      </Card>

      <div className="flex flex-wrap gap-1">
        {WISH_CATEGORIES.map(cat => (
          <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}>{cat}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<Card key={i} className="p-4"><Skeleton className="h-5 w-3/4 mb-3" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-8 w-20" /></Card>))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground" data-testid="text-no-wishes">No wishes found. Be the first to submit one!</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((wish) => (
            <Card key={wish.id} className="p-4 flex flex-col gap-3" data-testid={`card-wish-${wish.id}`}>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm" data-testid={`text-wish-title-${wish.id}`}>{wish.title}</h4>
                <Badge variant="secondary" className="shrink-0">{wish.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{wish.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-muted-foreground">{wish.votes ?? 0} votes</span>
                <Button size="sm" variant="outline" onClick={() => voteMutation.mutate(wish.id)} disabled={voteMutation.isPending} data-testid={`button-vote-wish-${wish.id}`}>
                  <ThumbsUp className="mr-1 h-3.5 w-3.5" />Vote
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NeedsMapSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Community Needs Map</h3>
        <p className="text-muted-foreground text-sm">Vote on what your community needs most. These priorities shape property development.</p>
      </div>

      {communityNeeds.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h4 className="font-medium mb-2">No Community Needs Reported Yet</h4>
          <p className="text-muted-foreground text-sm">Community needs surveys will populate this section. Check back soon.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communityNeeds.map((need, index) => {
            const Icon = categoryIcons[need.category] || Building2;
            const maxVotes = Math.max(...communityNeeds.map(n => n.voteCount));
            const votePercent = Math.round((need.voteCount / maxVotes) * 100);
            return (
              <Card key={need.id} className="relative overflow-visible">
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{index + 1}</div>
                <CardContent className="p-4 pl-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0"><Icon className="h-5 w-5 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-medium">{need.need}</h4>
                          <Badge variant="outline" className="text-xs">{need.category}</Badge>
                        </div>
                        {need.description && <p className="text-sm text-muted-foreground mb-3">{need.description}</p>}
                        <Progress value={votePercent} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{need.voteCount} votes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BeforeAfterSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Before & After</h3>
        <p className="text-muted-foreground text-sm">See the transformation of community properties through revitalization.</p>
      </div>
      <Card className="p-8 text-center">
        <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h4 className="font-medium mb-2">Coming Soon</h4>
        <p className="text-muted-foreground text-sm">Before and after views will be available once properties begin development.</p>
      </Card>
    </div>
  );
}

export default function Community() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && iconTrayItems.some(item => item.id === hash)) {
      setActiveSection(hash);
    }
  }, []);

  const handleSelect = (id: string) => {
    setActiveSection(id || null);
    if (id) {
      window.history.replaceState(null, "", `/community#${id}`);
    } else {
      window.history.replaceState(null, "", "/community");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-community-title">Community</h1>
            <p className="text-muted-foreground">
              Shape your community's future through voting, wishlists, and impact simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Properties Funded</p>
                  <p className="text-xl font-semibold" data-testid="text-properties-funded">0</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. GDP Lift</p>
                  <p className="text-xl font-semibold" data-testid="text-gdp-lift">$0</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <Vote className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Community Votes Cast</p>
                  <p className="text-xl font-semibold" data-testid="text-votes-cast">0</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4">
            <Select defaultValue="cherokee">
              <SelectTrigger className="w-[200px]" data-testid="select-county">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cherokee">Cherokee County</SelectItem>
                <SelectItem value="fulton">Fulton County</SelectItem>
                <SelectItem value="dekalb">DeKalb County</SelectItem>
                <SelectItem value="cobb">Cobb County</SelectItem>
                <SelectItem value="gwinnett">Gwinnett County</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <IconTray items={iconTrayItems} activeId={activeSection} onSelect={handleSelect} className="mb-2" />

          <ExpandableSection id="gdp-simulator" isOpen={activeSection === "gdp-simulator"}>
            <GDPSimulatorSection />
          </ExpandableSection>

          <ExpandableSection id="wishlist" isOpen={activeSection === "wishlist"}>
            <WishlistSection />
          </ExpandableSection>

          <ExpandableSection id="needs-map" isOpen={activeSection === "needs-map"}>
            <NeedsMapSection />
          </ExpandableSection>

          <ExpandableSection id="before-after" isOpen={activeSection === "before-after"}>
            <BeforeAfterSection />
          </ExpandableSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
