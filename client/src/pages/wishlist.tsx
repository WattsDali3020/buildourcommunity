import { useState } from "react";
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
import { ThumbsUp, Plus, MapPin, ArrowUpDown, Filter } from "lucide-react";
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
  const [formEmail, setFormEmail] = useState("");
  const [formTakeItFurther, setFormTakeItFurther] = useState(false);

  const { data: wishes, isLoading } = useQuery<Wish[]>({
    queryKey: ["/api/wishes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      location: string;
      email?: string;
      takeItFurther?: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/wishes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishes"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/wishes"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to vote.", variant: "destructive" });
    },
  });

  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("");
    setFormLocation("");
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
      email: formEmail || undefined,
      takeItFurther: formTakeItFurther,
    });
  }

  const filtered = wishes
    ? wishes
        .filter((w) => selectedCategory === "All" || w.category === selectedCategory)
        .sort((a, b) => {
          if (sortBy === "popular") return (b.votes ?? 0) - (a.votes ?? 0);
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        })
    : [];

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
                  Tell us what your community needs. Submit wishes and vote on others.
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
                  No wishes found{selectedCategory !== "All" ? ` in "${selectedCategory}"` : ""}. Be the first to submit one!
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((wish) => (
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
                    </div>
                    {wish.takeItFurther && (
                      <Badge variant="outline" className="w-fit" data-testid={`badge-further-${wish.id}`}>
                        Seeking Champions
                      </Badge>
                    )}
                    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
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
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
