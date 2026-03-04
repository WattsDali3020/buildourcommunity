import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Vote,
  Shield,
  Zap,
  BarChart3,
  Eye,
  Bell,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AIAlert {
  id: string;
  type: "whale" | "bias" | "engagement" | "phase";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  timestamp: string;
  actionRequired: boolean;
}

interface EngagementMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}

const alerts: AIAlert[] = [];

const engagementMetrics: EngagementMetric[] = [
  { label: "Active Voters", value: 0, change: 0, trend: "stable" },
  { label: "Avg. Participation", value: 0, change: 0, trend: "stable" },
  { label: "Governance Score", value: 0, change: 0, trend: "stable" },
  { label: "Community Health", value: 0, change: 0, trend: "stable" },
];

function AlertCard({ alert }: { alert: AIAlert }) {
  const icons = {
    whale: Shield,
    bias: Brain,
    engagement: Users,
    phase: TrendingUp,
  };
  const Icon = icons[alert.type];
  
  const severityColors = {
    low: "bg-chart-3/10 text-chart-3 border-chart-3/30",
    medium: "bg-chart-5/10 text-chart-5 border-chart-5/30",
    high: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <Card className="hover-elevate" data-testid={`alert-${alert.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${severityColors[alert.severity]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <Badge variant="outline" className="text-xs capitalize">
                {alert.severity}
              </Badge>
              {alert.actionRequired && (
                <Badge variant="destructive" className="text-xs">
                  Action Required
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {alert.timestamp}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ metric }: { metric: EngagementMetric }) {
  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-chart-3" />,
    down: <TrendingUp className="h-4 w-4 text-destructive rotate-180" />,
    stable: <div className="h-4 w-4 border-t-2 border-muted-foreground" />,
  };

  return (
    <Card data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{metric.label}</span>
          {trendIcons[metric.trend]}
        </div>
        <p className="text-2xl font-bold">
          {metric.label.includes("Score") || metric.label.includes("Health") || metric.label.includes("Participation") 
            ? `${metric.value}%` 
            : metric.value.toLocaleString()}
        </p>
        <p className={`text-xs mt-1 ${metric.change >= 0 ? "text-chart-3" : "text-destructive"}`}>
          {metric.change >= 0 ? "+" : ""}{metric.change}% from last week
        </p>
      </CardContent>
    </Card>
  );
}

export default function AIInsights() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading AI Insights...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">AI Insights Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to access AI-powered governance analytics and behavioral insights.
            </p>
            <Button size="lg" asChild>
              <a href="/api/login">Sign In to Continue</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold" data-testid="page-title">AI Insights Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Real-time governance analytics and behavioral nudge management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-chart-3 animate-pulse" />
                AI Active
              </Badge>
              <Button variant="outline" size="sm" data-testid="button-configure-ai">
                <Bell className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {engagementMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-chart-5" />
                    AI Alerts & Recommendations
                  </CardTitle>
                  <CardDescription>
                    Automated detection of governance risks and optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Dynamic Phase Analytics
                  </CardTitle>
                  <CardDescription>
                    Phase advancement based on engagement data, not fixed timelines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No active properties yet. Phase engagement data will appear here once properties are live.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-chart-2" />
                    Whale Detection
                  </CardTitle>
                  <CardDescription>
                    AI monitors token concentration and voting patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Concentration Risk</span>
                      <Badge variant="secondary">Low</Badge>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Top 10 Holders</span>
                        <span>24.3%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Gini Coefficient</span>
                        <span>0.32</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Voting Correlation</span>
                        <span>0.18</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-chart-4" />
                    Nudge Performance
                  </CardTitle>
                  <CardDescription>
                    Behavioral economics nudge effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        <span className="text-sm">Vote Reminders</span>
                      </div>
                      <span className="text-sm font-medium">+34% CTR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        <span className="text-sm">Bonus APR Prompts</span>
                      </div>
                      <span className="text-sm font-medium">+28% CTR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        <span className="text-sm">Milestone Alerts</span>
                      </div>
                      <span className="text-sm font-medium">+52% CTR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Generic Updates</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">+8% CTR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">AI Recommendation</h4>
                      <p className="text-xs text-muted-foreground">Based on current patterns</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Increase engagement by 15% with targeted "vote-to-earn" nudges for inactive holders who haven't participated in 30+ days.
                  </p>
                  <Button size="sm" className="w-full" data-testid="button-apply-recommendation">
                    Apply Recommendation
                  </Button>
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
