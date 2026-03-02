import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, Plus, MapPin, ArrowUpDown, Filter, Search, Vote, TrendingUp, Building2, ShoppingCart, Stethoscope, Coffee, UtensilsCrossed, Pill, Baby, Dumbbell, Wrench, WashingMachine, Landmark, Home, Bus } from "lucide-react";
import type { Wish } from "@shared/schema";

const CATEGORIES = [
  "All",
  "Housing",
  "Retail",
  "Entertainment",
  "Parks & Recreation",
  "Restaurant",
  "Healthcare",
  "Education",
  "Services",
  "Transportation",
];

const BUSINESS_CATEGORIES = [
  { name: "Grocery Store", Icon: ShoppingCart, category: "Retail" },
  { name: "Medical Clinic", Icon: Stethoscope, category: "Healthcare" },
  { name: "Coffee Shop", Icon: Coffee, category: "Restaurant" },
  { name: "Restaurant", Icon: UtensilsCrossed, category: "Restaurant" },
  { name: "Pharmacy", Icon: Pill, category: "Healthcare" },
  { name: "Daycare Center", Icon: Baby, category: "Education" },
  { name: "Fitness Center", Icon: Dumbbell, category: "Entertainment" },
  { name: "Hardware Store", Icon: Wrench, category: "Retail" },
  { name: "Laundromat", Icon: WashingMachine, category: "Services" },
  { name: "Community Center", Icon: Landmark, category: "Parks & Recreation" },
  { name: "Affordable Housing", Icon: Home, category: "Housing" },
  { name: "Public Transit Stop", Icon: Bus, category: "Transportation" },
];

type SortOption = "popular" | "newest";

export default function WishlistPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formZipCode, setFormZipCode] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTakeItFurther, setFormTakeItFurther] = useState(false);

  const [zipSearch, setZipSearch] = useState("");
  const [activeZip, setActiveZip] = useState("");

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
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      location: string;
      zipCode?: string;
      email?: string;
      takeItFurther?: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/wishes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/wishes") });
      toast({ title: "Wish submitted!", description: "Your community wish has been added." });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit wish.", variant: "destructive" });
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
    onError: () => {
      toast({ title: "Error", description: "Failed to vote.", variant: "destructive" });
    },
  });

  const quickVoteMutation = useMutation({
    mutationFn: async (data: { title: string; category: string }) => {
      const res = await apiRequest("POST", "/api/wishes", {
        title: data.title,
        description: `Community need: ${data.title} in zip code ${activeZip}`,
        category: data.category,
        location: `Zip: ${activeZip}`,
        zipCode: activeZip,
      });
      return res.json();
    },
    onSuccess: (newWish: Wish) => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/wishes") });
      voteMutation.mutate(newWish.id);
      toast({ title: "Vote cast!", description: "Your vote has been recorded." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to cast vote.", variant: "destructive" });
    },
  });

  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("");
    setFormLocation("");
    setFormZipCode("");
    setFormEmail("");
    setFormTakeItFurther(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle || !formDescription || !formCategory || !formLocation) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      title: formTitle,
      description: formDescription,
      category: formCategory,
      location: formLocation,
      zipCode: formZipCode || undefined,
      email: formEmail || undefined,
      takeItFurther: formTakeItFurther,
    });
  }

  function handleZipSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = zipSearch.trim();
    if (cleaned && /^\d{5}$/.test(cleaned)) {
      setActiveZip(cleaned);
    } else if (cleaned === "") {
      setActiveZip("");
    } else {
      toast({ title: "Invalid zip code", description: "Please enter a valid 5-digit zip code.", variant: "destructive" });
    }
  }

  function clearZipSearch() {
    setZipSearch("");
    setActiveZip("");
  }

  const totalVotes = useMemo(() => {
    if (!wishes) return 0;
    return wishes.reduce((sum, w) => sum + (w.votes ?? 0), 0);
  }, [wishes]);

  const businessCategoryVotes = useMemo(() => {
    if (!wishes || !activeZip) return [];
    return BUSINESS_CATEGORIES.map((biz) => {
      const matching = wishes.filter(
        (w) => w.title.toLowerCase() === biz.name.toLowerCase() || w.category === biz.category
      );
      const votes = matching.reduce((sum, w) => sum + (w.votes ?? 0), 0);
      const existingWish = wishes.find((w) => w.title.toLowerCase() === biz.name.toLowerCase());
      return { ...biz, votes, existingWishId: existingWish?.id };
    }).sort((a, b) => b.votes - a.votes);
  }, [wishes, activeZip]);

  const maxBizVotes = useMemo(() => {
    return Math.max(1, ...businessCategoryVotes.map((b) => b.votes));
  }, [businessCategoryVotes]);

  const filtered = wishes
    ? wishes
        .filter((w) => selectedCategory === "All" || w.category === selectedCategory)
        .sort((a, b) => {
          if (sortBy === "popular") return (b.votes ?? 0) - (a.votes ?? 0);
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        })
    : [];

  function handleBusinessVote(biz: typeof BUSINESS_CATEGORIES[number], existingWishId?: string) {
    if (existingWishId) {
      voteMutation.mutate(existingWishId);
      toast({ title: "Vote cast!", description: `You voted for ${biz.name}.` });
    } else {
      quickVoteMutation.mutate({ title: biz.name, category: biz.category });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-12 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-wishlist-title">Community Wishlist</h1>
                <p className="text-muted-foreground mt-1">
                  Tell us what your community needs. Search by zip code to see and vote on local priorities.
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-submit-wish">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit a Wish
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit a Community Wish</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wish-title">Title *</Label>
                      <Input
                        id="wish-title"
                        data-testid="input-wish-title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="What does your community need?"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wish-description">Description *</Label>
                      <Textarea
                        id="wish-description"
                        data-testid="input-wish-description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Describe the wish in detail..."
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wish-category">Category *</Label>
                      <Select value={formCategory} onValueChange={setFormCategory}>
                        <SelectTrigger data-testid="select-wish-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wish-location">Location *</Label>
                      <Input
                        id="wish-location"
                        data-testid="input-wish-location"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="City, State or specific area"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wish-zipcode">Zip Code</Label>
                      <Input
                        id="wish-zipcode"
                        data-testid="input-wish-zipcode"
                        value={formZipCode}
                        onChange={(e) => setFormZipCode(e.target.value)}
                        placeholder="5-digit zip code"
                        maxLength={5}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wish-email">Email (optional)</Label>
                      <Input
                        id="wish-email"
                        data-testid="input-wish-email"
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="wish-take-it-further"
                        data-testid="checkbox-take-it-further"
                        checked={formTakeItFurther}
                        onCheckedChange={(checked) => setFormTakeItFurther(checked === true)}
                      />
                      <Label htmlFor="wish-take-it-further" className="text-sm">
                        I want to take it further — contact me about making this happen
                      </Label>
                    </div>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-wish-form">
                      {createMutation.isPending ? "Submitting..." : "Submit Wish"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-4 mb-8">
              <form onSubmit={handleZipSearch} className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <Label htmlFor="zip-search" className="text-sm font-medium flex items-center gap-1">
                    <Search className="h-3.5 w-3.5" />
                    Search by Zip Code
                  </Label>
                  <Input
                    id="zip-search"
                    data-testid="input-zip-search"
                    value={zipSearch}
                    onChange={(e) => setZipSearch(e.target.value)}
                    placeholder="Enter 5-digit zip code"
                    maxLength={5}
                  />
                </div>
                <Button type="submit" data-testid="button-zip-search">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                {activeZip && (
                  <Button type="button" variant="outline" onClick={clearZipSearch} data-testid="button-clear-zip">
                    Clear
                  </Button>
                )}
              </form>
              {activeZip && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" data-testid="badge-active-zip">
                    <MapPin className="mr-1 h-3 w-3" />
                    Zip: {activeZip}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {wishes?.length ?? 0} wishes found &middot; {totalVotes} total votes
                  </span>
                </div>
              )}
            </Card>

            {activeZip && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold" data-testid="text-business-voting-title">
                    What does your area need most?
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Vote for the business types your community needs in zip code <strong>{activeZip}</strong>. Results help guide RevitaHub property development.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {businessCategoryVotes.map((biz, idx) => {
                    const pct = maxBizVotes > 0 ? Math.round((biz.votes / maxBizVotes) * 100) : 0;
                    return (
                      <Card
                        key={biz.name}
                        className="p-4 flex flex-col gap-2"
                        data-testid={`card-business-${biz.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" data-testid={`text-rank-${idx}`}>
                              #{idx + 1}
                            </span>
                            <biz.Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{biz.name}</span>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {biz.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground font-medium w-10 text-right" data-testid={`text-vote-pct-${biz.name.toLowerCase().replace(/\s+/g, "-")}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground" data-testid={`text-vote-count-${biz.name.toLowerCase().replace(/\s+/g, "-")}`}>
                            {biz.votes} {biz.votes === 1 ? "vote" : "votes"}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBusinessVote(biz, biz.existingWishId)}
                            disabled={voteMutation.isPending || quickVoteMutation.isPending}
                            data-testid={`button-cast-vote-${biz.name.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <Vote className="mr-1 h-3.5 w-3.5" />
                            Cast Your Vote
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-36" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeZip && filtered.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Showing community wishes for zip code <strong>{activeZip}</strong>
                </span>
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-8 w-20" />
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground" data-testid="text-no-wishes">
                  {activeZip
                    ? `No wishes found for zip code "${activeZip}"${selectedCategory !== "All" ? ` in "${selectedCategory}"` : ""}. Be the first to submit one or vote above!`
                    : `No wishes found${selectedCategory !== "All" ? ` in "${selectedCategory}"` : ""}. Be the first to submit one!`}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((wish) => {
                  const votePct = totalVotes > 0 ? Math.round(((wish.votes ?? 0) / totalVotes) * 100) : 0;
                  return (
                    <Card key={wish.id} className="p-4 flex flex-col gap-3" data-testid={`card-wish-${wish.id}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold text-base leading-tight" data-testid={`text-wish-title-${wish.id}`}>
                          {wish.title}
                        </h3>
                        <Badge variant="secondary" className="shrink-0" data-testid={`badge-category-${wish.id}`}>
                          {wish.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-wish-description-${wish.id}`}>
                        {wish.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span data-testid={`text-wish-location-${wish.id}`}>{wish.location}</span>
                        {wish.zipCode && (
                          <Badge variant="outline" className="ml-1 text-xs" data-testid={`badge-zip-${wish.id}`}>
                            {wish.zipCode}
                          </Badge>
                        )}
                      </div>
                      {wish.takeItFurther && (
                        <Badge variant="outline" className="w-fit" data-testid={`badge-further-${wish.id}`}>
                          Seeking Champions
                        </Badge>
                      )}
                      <div className="mt-auto pt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={votePct} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground font-medium" data-testid={`text-wish-pct-${wish.id}`}>
                            {votePct}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => voteMutation.mutate(wish.id)}
                            disabled={voteMutation.isPending}
                            data-testid={`button-vote-${wish.id}`}
                          >
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            {wish.votes ?? 0}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
