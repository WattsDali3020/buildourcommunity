import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Landmark, MapPin, Flag, Coins, CheckCircle, Clock, Search } from "lucide-react";
import type { CapitalStackSummary, PropertyGrant } from "@shared/schema";

interface CapitalStackDisplayProps {
  propertyId: string;
  compact?: boolean;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

const grantLevelConfig = {
  city: { icon: Building2, label: "City", color: "bg-muted" },
  county: { icon: MapPin, label: "County", color: "bg-muted" },
  state: { icon: Landmark, label: "State", color: "bg-muted" },
  federal: { icon: Flag, label: "Federal", color: "bg-muted" },
};

const grantStatusConfig = {
  identified: { label: "Identified", variant: "outline" as const, icon: Search },
  applied: { label: "Applied", variant: "secondary" as const, icon: Clock },
  under_review: { label: "Under Review", variant: "secondary" as const, icon: Clock },
  awarded: { label: "Awarded", variant: "default" as const, icon: CheckCircle },
  disbursed: { label: "Disbursed", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: Clock },
  expired: { label: "Expired", variant: "outline" as const, icon: Clock },
};

export function CapitalStackDisplay({ propertyId, compact = false }: CapitalStackDisplayProps) {
  const { data: capitalStack, isLoading: isLoadingStack } = useQuery<CapitalStackSummary>({
    queryKey: ["/api/properties", propertyId, "capital-stack"],
  });

  const { data: grants, isLoading: isLoadingGrants } = useQuery<PropertyGrant[]>({
    queryKey: ["/api/properties", propertyId, "grants"],
  });

  if (isLoadingStack || isLoadingGrants) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!capitalStack) {
    return null;
  }

  const { totalProjectCost, tokenFunding, grantFunding, grantsByStatus, percentFunded } = capitalStack;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Capital Stack</span>
          <span className="text-sm font-medium">{percentFunded.toFixed(1)}% Funded</span>
        </div>
        <Progress value={percentFunded} className="h-2" />
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <span>Tokens: {formatCurrency(tokenFunding)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-green-500" />
            <span>Grants: {formatCurrency(grantFunding.total)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card data-testid="capital-stack-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg">Capital Stack</CardTitle>
        <Badge variant="outline" data-testid="badge-percent-funded">
          {percentFunded.toFixed(1)}% Funded
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Total Project: {formatCurrency(totalProjectCost)}</span>
            <span className="text-sm font-medium">{formatCurrency(tokenFunding + grantsByStatus.secured)} raised</span>
          </div>
          <Progress value={percentFunded} className="h-3" data-testid="progress-funding" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-medium">Token Funding</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-token-funding">{formatCurrency(tokenFunding)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-green-500" />
              <span className="font-medium">Grant Funding</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-grant-funding">{formatCurrency(grantFunding.total)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Grants by Government Level</h4>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(grantLevelConfig) as Array<keyof typeof grantLevelConfig>).map((level) => {
              const config = grantLevelConfig[level];
              const Icon = config.icon;
              const amount = grantFunding[level];
              return (
                <div
                  key={level}
                  className={`flex items-center gap-3 p-3 rounded-md ${config.color}`}
                  data-testid={`grant-level-${level}`}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Grant Status Summary</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Secured: {formatCurrency(grantsByStatus.secured)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Pending: {formatCurrency(grantsByStatus.pending)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Identified: {formatCurrency(grantsByStatus.identified)}</span>
            </div>
          </div>
        </div>

        {grants && grants.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Individual Grants</h4>
            <div className="space-y-2">
              {grants.map((grant) => {
                const levelConfig = grantLevelConfig[grant.grantLevel as keyof typeof grantLevelConfig];
                const statusConfig = grantStatusConfig[grant.status as keyof typeof grantStatusConfig];
                const LevelIcon = levelConfig?.icon || Building2;
                return (
                  <div
                    key={grant.id}
                    className="flex items-center justify-between gap-2 p-3 border rounded-md"
                    data-testid={`grant-item-${grant.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <LevelIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{grant.grantName}</p>
                        <p className="text-xs text-muted-foreground">{grant.grantingAgency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-medium">{formatCurrency(parseFloat(grant.amount))}</span>
                      <Badge variant={statusConfig?.variant || "outline"} className="text-xs">
                        {statusConfig?.label || grant.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
