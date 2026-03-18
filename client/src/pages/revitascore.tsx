import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Shield,
  Target,
  Key,
  Copy,
  CheckCircle,
  Globe,
  ArrowRight,
  Loader2,
  Code,
  Mail,
} from "lucide-react";

const METRICS = [
  { name: "economicScore", range: "0–10,000", description: "Jobs + GDP impact weighted by county distress level (BEA RIMS II)", icon: TrendingUp },
  { name: "socialScore", range: "0–10,000", description: "Affordability + community benefit metrics (CDC SVI)", icon: Activity },
  { name: "leverageRank", range: "1–10", description: "Systemic impact rank based on Donella Meadows' Leverage Points framework", icon: Target },
  { name: "projectedAnnualROI", range: "BPS", description: "Basis points ROI projection from revitalization investment", icon: BarChart3 },
  { name: "riskAdjustedScore", range: "0–100", description: "Combined risk-adjusted viability score across all factors", icon: Shield },
];

const USE_CASES = [
  { value: "cdfi", label: "CDFI" },
  { value: "city_planning", label: "City Planning" },
  { value: "bank_cra", label: "Bank CRA" },
  { value: "impact_investor", label: "Impact Investor" },
  { value: "grant_writer", label: "Grant Writer" },
  { value: "other", label: "Other" },
];

interface RegistrationResult {
  key: string;
  ownerEmail: string;
  tier: string;
}

export default function RevitaScorePage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [useCase, setUseCase] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !useCase) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/revitascore/register", {
        name: name.trim(),
        email: email.trim(),
        organization: organization.trim(),
        use_case: useCase,
      });
      const data = await res.json();
      setResult(data);
      toast({ title: "API key created", description: "Your free API key has been generated and emailed to you." });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const copyKey = () => {
    if (result?.key) {
      navigator.clipboard.writeText(result.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-16 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold" data-testid="text-revitascore-title">
                RevitaScore API
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-revitascore-subtitle">
              Deterministic county-level impact scoring for community development projects.
              Powered by BEA RIMS II, DOL/HUD, CDC SVI, and ARC distress classifications.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline">25 Georgia Counties</Badge>
              <Badge variant="outline">10 Project Types</Badge>
              <Badge variant="outline">REST API</Badge>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Five Impact Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {METRICS.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.name} data-testid={`card-metric-${metric.name}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-mono text-sm font-semibold">{metric.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">{metric.range}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {!result ? (
            <Card className="max-w-2xl mx-auto" data-testid="card-registration-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Get Your Free API Key
                </CardTitle>
                <CardDescription>
                  No account required. Get instant access to query impact scores for any supported county and project type.
                  Free tier includes 3 queries per day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@organization.com"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Your company or agency (optional)"
                      data-testid="input-organization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="useCase">Use Case *</Label>
                    <Select value={useCase} onValueChange={setUseCase}>
                      <SelectTrigger data-testid="select-use-case">
                        <SelectValue placeholder="How will you use RevitaScore?" />
                      </SelectTrigger>
                      <SelectContent>
                        {USE_CASES.map((uc) => (
                          <SelectItem key={uc.value} value={uc.value} data-testid={`option-use-case-${uc.value}`}>
                            {uc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting} data-testid="button-register">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Key...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Get Free API Key
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto border-primary/30" data-testid="card-registration-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-5 w-5" />
                  Your API Key is Ready
                </CardTitle>
                <CardDescription>
                  A copy has also been sent to {result.ownerEmail}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">API Key</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all" data-testid="text-api-key">
                      {result.key}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyKey} data-testid="button-copy-key">
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Quick Start
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Discovery — List supported counties (no auth)</p>
                      <code className="text-xs font-mono text-primary" data-testid="text-endpoint-counties">
                        GET /api/revitascore/counties
                      </code>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Discovery — List project types (no auth)</p>
                      <code className="text-xs font-mono text-primary" data-testid="text-endpoint-types">
                        GET /api/revitascore/project-types
                      </code>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Scoring — Get impact metrics (requires key)</p>
                      <code className="text-xs font-mono text-primary" data-testid="text-endpoint-scoring">
                        GET /api/revitascore/Wheeler/Affordable%20Housing
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">Header: X-RevitaScore-Key: {"<your-key>"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>Free tier: 3 queries/day. Need more? Contact us to upgrade to Pro or Enterprise.</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild data-testid="link-methodology">
                    <a href="/litepaper#revitascore-api">
                      <Code className="h-4 w-4 mr-2" />
                      Methodology Docs
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild data-testid="link-simulator">
                    <a href="/impact">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Impact Simulator
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
