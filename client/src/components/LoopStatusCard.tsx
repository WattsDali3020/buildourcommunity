import { Badge } from "@/components/ui/badge";
import {
  COUNTY_TOKEN_PRICE,
  MIX_LABELS,
  PHASE_THRESHOLD_PERCENT,
  escrowIfForms,
  formatUsd,
  passesSeedGate,
  votesToForm,
  type MixCategory,
} from "@/lib/concise-loop";

export function LoopStatusCard({
  mix,
  engagementPercent,
  fundingGoal,
  compact = false,
}: {
  mix: MixCategory;
  engagementPercent: number;
  fundingGoal: number;
  compact?: boolean;
}) {
  const remaining = votesToForm(engagementPercent);
  const escrow = escrowIfForms(fundingGoal);
  const featured = passesSeedGate(mix);

  return (
    <div
      className={compact ? "space-y-2" : "rounded-lg border bg-muted/40 p-4 space-y-3"}
      data-testid="loop-status-card"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={featured ? "secondary" : "outline"} data-testid="badge-mix">
          {MIX_LABELS[mix]}
        </Badge>
        {!featured && (
          <span className="text-xs text-muted-foreground">Parked — housing-only pins are not featured.</span>
        )}
      </div>
      <p className="text-sm font-medium" data-testid="text-votes-to-form">
        {remaining === 0
          ? `Threshold met (${PHASE_THRESHOLD_PERCENT}%). Project can form.`
          : `${remaining} more KYC’d votes to form`}
      </p>
      <p className="text-sm text-muted-foreground" data-testid="text-escrow-if-forms">
        If it forms, ~{formatUsd(escrow)} toward escrow. County ticket ${COUNTY_TOKEN_PRICE.toFixed(2)}.
      </p>
    </div>
  );
}
