export const PHASE_THRESHOLD_PERCENT = 75;
export const COUNTY_TOKEN_PRICE = 12.5;

export type MixCategory =
  | "jobs"
  | "missing_middle"
  | "mixed_use"
  | "service"
  | "housing_only";

export const MIX_OPTIONS: { value: MixCategory; label: string; featured: boolean }[] = [
  { value: "jobs", label: "Jobs / light industrial / trades", featured: true },
  { value: "missing_middle", label: "Workforce / missing-middle housing (with jobs or service)", featured: true },
  { value: "mixed_use", label: "Downtown mixed-use", featured: true },
  { value: "service", label: "Neighborhood service node", featured: true },
  { value: "housing_only", label: "Housing only (parked — does not feature)", featured: false },
];

export const MIX_LABELS: Record<MixCategory, string> = {
  jobs: "Jobs",
  missing_middle: "Missing-middle",
  mixed_use: "Mixed-use",
  service: "Service",
  housing_only: "Housing-only (parked)",
};

const JOBS_RE = /\b(job|jobs|industrial|trades|warehouse|workshop|employment|employer|workforce park|corporate park|the bluffs)\b/i;
const SERVICE_RE = /\b(service|clinic|grocery|childcare|daycare|school|retail node|neighborhood service)\b/i;
const MIXED_RE = /\b(mixed[- ]use|downtown|live.?work)\b/i;
const HOUSING_RE = /\b(housing|residential|apartment|home|homes|units)\b/i;
const WORKFORCE_RE = /\b(workforce|missing[- ]middle|starter|affordable housing)\b/i;

export function inferMixCategory(input: {
  propertyType?: string | null;
  proposedUse?: string | null;
  currentUse?: string | null;
  description?: string | null;
  communityBenefits?: string[] | string | null;
  projectedJobs?: number | null;
  projectedHousingUnits?: number | null;
  desiredUses?: string[] | null;
  mixCategory?: string | null;
}): MixCategory {
  if (input.mixCategory && isMixCategory(input.mixCategory)) {
    return input.mixCategory;
  }

  const benefits = Array.isArray(input.communityBenefits)
    ? input.communityBenefits.join(" ")
    : input.communityBenefits || "";
  const uses = (input.desiredUses || []).join(" ");
  const blob = [
    input.propertyType,
    input.proposedUse,
    input.currentUse,
    input.description,
    benefits,
    uses,
  ]
    .filter(Boolean)
    .join(" ");

  const jobs = (input.projectedJobs || 0) > 0 || JOBS_RE.test(blob);
  const service = SERVICE_RE.test(blob);
  const mixed = input.propertyType === "downtown" || input.propertyType === "commercial" || MIXED_RE.test(blob);
  const housing = (input.projectedHousingUnits || 0) > 0 || HOUSING_RE.test(blob);
  const workforce = WORKFORCE_RE.test(blob);

  if (mixed && (housing || jobs || service)) return "mixed_use";
  if (jobs && !housing) return "jobs";
  if (workforce && (jobs || service)) return "missing_middle";
  if (housing && (jobs || service)) return "missing_middle";
  if (service && !housing) return "service";
  if (jobs) return "jobs";
  if (housing) return "housing_only";
  if (mixed) return "mixed_use";
  return "housing_only";
}

export function isMixCategory(value: string): value is MixCategory {
  return MIX_OPTIONS.some((o) => o.value === value);
}

export function passesSeedGate(mix: MixCategory): boolean {
  return mix !== "housing_only";
}

export function votesToForm(engagementPercent: number, assumedKycVotes = 40): number {
  const current = Math.max(0, Math.min(100, engagementPercent));
  if (current >= PHASE_THRESHOLD_PERCENT) return 0;
  const remainingPct = PHASE_THRESHOLD_PERCENT - current;
  return Math.max(1, Math.ceil((remainingPct / 100) * assumedKycVotes));
}

export function escrowIfForms(fundingGoal: number): number {
  if (!Number.isFinite(fundingGoal) || fundingGoal <= 0) return 0;
  return fundingGoal;
}

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${Math.round(amount).toLocaleString("en-US")}`;
  return `$${amount.toFixed(2)}`;
}

export function mixFromDesiredUses(desiredUses: string[] | null | undefined): MixCategory | null {
  const tagged = (desiredUses || []).find((u) => u.startsWith("mix:"));
  if (!tagged) return null;
  const value = tagged.slice(4);
  return isMixCategory(value) ? value : null;
}
