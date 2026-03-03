export const STATE_GDP = 882_000_000_000;
export const TOTAL_COUNTIES = 159;
export const STATE_NAME = "Georgia";

export type DistressLevel = "distressed" | "at-risk" | "transitional" | "competitive";

export interface CountyData {
  name: string;
  distressLevel: DistressLevel;
  region: string;
  population: number;
  topNeeds: ProjectType[];
  baseMultiplierRange: [number, number];
}

export type ProjectType =
  | "Affordable Housing"
  | "Vocational Training"
  | "Renewable Energy"
  | "Agri-Tech"
  | "Manufacturing Upgrade"
  | "Small Business Incubator"
  | "Tourism Eco-Lodge"
  | "Logistics Warehouse"
  | "Community Health Center"
  | "Disaster Recovery Hub";

export interface ProjectTypeConfig {
  name: ProjectType;
  multiplierRange: [number, number];
  jobRange: [number, number];
  category: string;
}

export const PROJECT_TYPES: Record<ProjectType, ProjectTypeConfig> = {
  "Affordable Housing": { name: "Affordable Housing", multiplierRange: [2.0, 3.5], jobRange: [15, 60], category: "Housing" },
  "Vocational Training": { name: "Vocational Training", multiplierRange: [2.5, 4.0], jobRange: [10, 40], category: "Education" },
  "Renewable Energy": { name: "Renewable Energy", multiplierRange: [1.8, 3.2], jobRange: [8, 30], category: "Energy" },
  "Agri-Tech": { name: "Agri-Tech", multiplierRange: [1.5, 2.8], jobRange: [5, 25], category: "Agriculture" },
  "Manufacturing Upgrade": { name: "Manufacturing Upgrade", multiplierRange: [2.2, 3.8], jobRange: [20, 80], category: "Industry" },
  "Small Business Incubator": { name: "Small Business Incubator", multiplierRange: [2.0, 3.5], jobRange: [15, 50], category: "Commerce" },
  "Tourism Eco-Lodge": { name: "Tourism Eco-Lodge", multiplierRange: [1.8, 3.0], jobRange: [10, 35], category: "Tourism" },
  "Logistics Warehouse": { name: "Logistics Warehouse", multiplierRange: [2.0, 3.5], jobRange: [25, 90], category: "Infrastructure" },
  "Community Health Center": { name: "Community Health Center", multiplierRange: [2.5, 4.0], jobRange: [12, 45], category: "Healthcare" },
  "Disaster Recovery Hub": { name: "Disaster Recovery Hub", multiplierRange: [1.5, 2.5], jobRange: [8, 20], category: "Resilience" },
};

export const GEORGIA_COUNTIES: CountyData[] = [
  { name: "Wheeler", distressLevel: "distressed", region: "Southeast", population: 7_700, topNeeds: ["Affordable Housing", "Community Health Center", "Agri-Tech"], baseMultiplierRange: [2.5, 4.0] },
  { name: "Clayton", distressLevel: "at-risk", region: "Metro Atlanta", population: 297_000, topNeeds: ["Affordable Housing", "Small Business Incubator", "Vocational Training"], baseMultiplierRange: [2.0, 3.5] },
  { name: "Whitfield", distressLevel: "transitional", region: "Northwest", population: 105_000, topNeeds: ["Manufacturing Upgrade", "Vocational Training", "Logistics Warehouse"], baseMultiplierRange: [1.8, 3.0] },
  { name: "Candler", distressLevel: "distressed", region: "Southeast", population: 10_800, topNeeds: ["Agri-Tech", "Community Health Center", "Renewable Energy"], baseMultiplierRange: [2.5, 4.0] },
  { name: "Treutlen", distressLevel: "distressed", region: "Central", population: 6_700, topNeeds: ["Disaster Recovery Hub", "Affordable Housing", "Agri-Tech"], baseMultiplierRange: [2.5, 4.0] },
  { name: "Taliaferro", distressLevel: "distressed", region: "Central", population: 1_600, topNeeds: ["Community Health Center", "Renewable Energy", "Affordable Housing"], baseMultiplierRange: [3.0, 4.0] },
  { name: "Quitman", distressLevel: "distressed", region: "Southwest", population: 2_300, topNeeds: ["Agri-Tech", "Disaster Recovery Hub", "Affordable Housing"], baseMultiplierRange: [3.0, 4.0] },
  { name: "Telfair", distressLevel: "distressed", region: "South Central", population: 15_800, topNeeds: ["Vocational Training", "Manufacturing Upgrade", "Community Health Center"], baseMultiplierRange: [2.5, 3.8] },
  { name: "Jenkins", distressLevel: "distressed", region: "East Central", population: 8_600, topNeeds: ["Agri-Tech", "Renewable Energy", "Affordable Housing"], baseMultiplierRange: [2.5, 4.0] },
  { name: "Emanuel", distressLevel: "at-risk", region: "East Central", population: 22_500, topNeeds: ["Small Business Incubator", "Logistics Warehouse", "Vocational Training"], baseMultiplierRange: [2.0, 3.5] },
  { name: "Lowndes", distressLevel: "transitional", region: "South", population: 117_000, topNeeds: ["Manufacturing Upgrade", "Logistics Warehouse", "Affordable Housing"], baseMultiplierRange: [1.8, 3.0] },
  { name: "Bibb", distressLevel: "at-risk", region: "Central", population: 153_000, topNeeds: ["Affordable Housing", "Small Business Incubator", "Community Health Center"], baseMultiplierRange: [2.0, 3.5] },
  { name: "Dougherty", distressLevel: "distressed", region: "Southwest", population: 87_000, topNeeds: ["Affordable Housing", "Vocational Training", "Community Health Center"], baseMultiplierRange: [2.5, 4.0] },
  { name: "Richmond", distressLevel: "at-risk", region: "East", population: 206_000, topNeeds: ["Manufacturing Upgrade", "Small Business Incubator", "Affordable Housing"], baseMultiplierRange: [2.0, 3.2] },
  { name: "Chatham", distressLevel: "transitional", region: "Coastal", population: 295_000, topNeeds: ["Tourism Eco-Lodge", "Logistics Warehouse", "Disaster Recovery Hub"], baseMultiplierRange: [1.8, 3.0] },
  { name: "Muscogee", distressLevel: "at-risk", region: "West", population: 195_000, topNeeds: ["Manufacturing Upgrade", "Vocational Training", "Affordable Housing"], baseMultiplierRange: [2.0, 3.2] },
  { name: "Glynn", distressLevel: "transitional", region: "Coastal", population: 85_000, topNeeds: ["Tourism Eco-Lodge", "Renewable Energy", "Disaster Recovery Hub"], baseMultiplierRange: [1.5, 2.8] },
  { name: "Cherokee", distressLevel: "competitive", region: "North Metro", population: 266_000, topNeeds: ["Small Business Incubator", "Affordable Housing", "Renewable Energy"], baseMultiplierRange: [1.5, 2.5] },
  { name: "Hall", distressLevel: "transitional", region: "Northeast", population: 204_000, topNeeds: ["Manufacturing Upgrade", "Logistics Warehouse", "Vocational Training"], baseMultiplierRange: [1.8, 3.0] },
  { name: "Coffee", distressLevel: "at-risk", region: "South Central", population: 43_000, topNeeds: ["Agri-Tech", "Vocational Training", "Small Business Incubator"], baseMultiplierRange: [2.0, 3.5] },
  { name: "Rabun", distressLevel: "transitional", region: "Northeast Mountains", population: 17_000, topNeeds: ["Tourism Eco-Lodge", "Renewable Energy", "Small Business Incubator"], baseMultiplierRange: [1.8, 3.0] },
  { name: "Ware", distressLevel: "at-risk", region: "Southeast", population: 35_500, topNeeds: ["Community Health Center", "Manufacturing Upgrade", "Affordable Housing"], baseMultiplierRange: [2.0, 3.5] },
  { name: "Laurens", distressLevel: "at-risk", region: "Central", population: 47_000, topNeeds: ["Logistics Warehouse", "Vocational Training", "Community Health Center"], baseMultiplierRange: [2.0, 3.2] },
  { name: "Thomas", distressLevel: "transitional", region: "Southwest", population: 44_700, topNeeds: ["Agri-Tech", "Tourism Eco-Lodge", "Small Business Incubator"], baseMultiplierRange: [1.8, 3.0] },
  { name: "Troup", distressLevel: "at-risk", region: "West", population: 69_900, topNeeds: ["Manufacturing Upgrade", "Affordable Housing", "Vocational Training"], baseMultiplierRange: [2.0, 3.5] },
];

export interface AdoptionTier {
  percent: number;
  label: string;
  counties: number;
  projects: number;
  description: string;
}

export const ADOPTION_TIERS: AdoptionTier[] = [
  { percent: 5, label: "Pilot", counties: 7, projects: 19, description: "Focus on most distressed counties. Compliant pilot for escrow testing." },
  { percent: 20, label: "Mid-Adoption", counties: 31, projects: 96, description: "Targets poverty hotspots in Southern GA. DAO-voted expansions." },
  { percent: 50, label: "Widespread", counties: 79, projects: 250, description: "Covers rural collapse areas. Diversification reduces risk." },
  { percent: 100, label: "Full Saturation", counties: 159, projects: 482, description: "State-wide revitalization. Regulatory hurdles cap feasibility." },
];

export interface ImpactMetrics {
  projectedAnnualROI: number;
  economicScore: number;
  socialScore: number;
  leverageRank: number;
  riskAdjustedScore: number;
}

export interface InvestmentPreview {
  projectedYear1Dividends: number;
  projected5YearROI: number;
  economicSummary: string;
  socialSummary: string;
  riskAdjustedScore: number;
  gdpMultiplier: number;
  fiveYearGDPImpact: number;
}

export interface GeneratedProject {
  county: CountyData;
  projectType: ProjectType;
  budget: number;
  gdpImpact: number;
  multiplier: number;
  projectedJobs: number;
  impactMetrics: ImpactMetrics;
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function calculateImpactMetrics(
  county: CountyData | undefined,
  projectType: ProjectType,
  propertyValue: number
): ImpactMetrics {
  const typeConfig = PROJECT_TYPES[projectType];
  const distressBonus = county ? getDistressMultiplier(county.distressLevel) : 1.0;

  const multiplier = randomInRange(typeConfig.multiplierRange[0], typeConfig.multiplierRange[1]) * distressBonus;
  const jobs = randomInt(typeConfig.jobRange[0], typeConfig.jobRange[1]);

  const economicScore = Math.min(10000, Math.round(jobs * 100 + multiplier * 1000));
  const socialScore = Math.min(10000, Math.round(
    (projectType === "Affordable Housing" ? 3000 : 1500) +
    (projectType === "Community Health Center" ? 2500 : 0) +
    (distressBonus >= 1.3 ? 2000 : 1000) +
    (jobs > 30 ? 1500 : 500) +
    randomInt(500, 1500)
  ));

  const projectedAnnualROI = Math.round(600 + (multiplier - 1.5) * 200 + (distressBonus - 1) * 150);
  const leverageRank = Math.min(10, Math.max(1, Math.round(
    (socialScore / 1000) * 0.4 + (economicScore / 1000) * 0.3 + distressBonus * 2
  )));
  const riskAdjustedScore = Math.min(100, Math.max(10, Math.round(
    50 + (leverageRank * 3) + (projectedAnnualROI > 800 ? 10 : 0) - (distressBonus >= 1.4 ? 5 : 0)
  )));

  return { projectedAnnualROI, economicScore, socialScore, leverageRank, riskAdjustedScore };
}

function getDistressMultiplier(level: DistressLevel): number {
  switch (level) {
    case "distressed": return 1.4;
    case "at-risk": return 1.2;
    case "transitional": return 1.1;
    case "competitive": return 1.0;
  }
}

export function generateRandomProjects(tier: AdoptionTier, count: number): GeneratedProject[] {
  const projects: GeneratedProject[] = [];
  const availableCounties = tier.percent <= 5
    ? GEORGIA_COUNTIES.filter(c => c.distressLevel === "distressed")
    : tier.percent <= 20
      ? GEORGIA_COUNTIES.filter(c => c.distressLevel === "distressed" || c.distressLevel === "at-risk")
      : GEORGIA_COUNTIES;

  for (let i = 0; i < count; i++) {
    const county = pickRandom(availableCounties);
    const projectType = pickRandom(county.topNeeds);
    const typeConfig = PROJECT_TYPES[projectType];

    const budget = Math.round(randomInRange(100_000, 1_000_000) / 1000) * 1000;
    const multiplier = Number(randomInRange(typeConfig.multiplierRange[0], typeConfig.multiplierRange[1]).toFixed(2));
    const distressBonus = getDistressMultiplier(county.distressLevel);
    const gdpImpact = Math.round(budget * multiplier * distressBonus);
    const projectedJobs = randomInt(typeConfig.jobRange[0], typeConfig.jobRange[1]);

    const impactMetrics = calculateImpactMetrics(county, projectType, budget);

    projects.push({ county, projectType, budget, gdpImpact, multiplier, projectedJobs, impactMetrics });
  }

  return projects.sort((a, b) => b.gdpImpact - a.gdpImpact);
}

export function calculateTierImpact(tier: AdoptionTier): { totalGDP: number; avgPerProject: number; percentOfStateGDP: number; estimatedRaised: number } {
  const avgBudget = 450_000;
  const avgMultiplier = 2.3;
  const estimatedRaised = tier.projects * avgBudget;
  const totalGDP = Math.round(estimatedRaised * avgMultiplier);
  const avgPerProject = totalGDP / tier.projects;
  const percentOfStateGDP = (totalGDP / STATE_GDP) * 100;
  return { totalGDP, avgPerProject, percentOfStateGDP, estimatedRaised };
}

export function getInvestmentPreview(
  propertyValue: number,
  tokenPrice: number,
  tokensToBuy: number,
  metrics: ImpactMetrics
): InvestmentPreview {
  const investmentAmount = tokenPrice * tokensToBuy;
  const shareOfProperty = investmentAmount / propertyValue;

  const projectedYear1Dividends = (investmentAmount * metrics.projectedAnnualROI) / 10000;
  const projected5YearROI = Number(((metrics.projectedAnnualROI / 100) * 5 * 0.85).toFixed(1));

  const gdpMultiplier = 1.5 + (metrics.economicScore / 10000) * 2.5;
  const fiveYearGDPImpact = Math.round(propertyValue * gdpMultiplier);

  const jobsEstimate = Math.round((metrics.economicScore / 100) * 0.8);
  const gdpBoostM = (fiveYearGDPImpact / 1_000_000).toFixed(1);
  const economicSummary = `Est. ${jobsEstimate} local jobs + $${gdpBoostM}M GDP boost`;

  const affordableUnits = metrics.socialScore > 7000 ? Math.round(metrics.socialScore / 800) : Math.round(metrics.socialScore / 1200);
  const socialLabel = metrics.socialScore > 7500 ? "wellness village" : metrics.socialScore > 5000 ? "community hub" : "neighborhood improvement";
  const socialSummary = `${affordableUnits} affordable units + ${socialLabel}`;

  return {
    projectedYear1Dividends,
    projected5YearROI,
    economicSummary,
    socialSummary,
    riskAdjustedScore: metrics.riskAdjustedScore,
    gdpMultiplier: Number(gdpMultiplier.toFixed(1)),
    fiveYearGDPImpact,
  };
}

export function calculateFounderRevenue(totalRaised: number): { treasuryCut: number; certificationFee: number; total: number } {
  const treasuryCut = totalRaised * 0.01;
  const certificationFee = totalRaised * 0.0025;
  return { treasuryCut, certificationFee, total: treasuryCut + certificationFee };
}

export function getCountyByName(name: string): CountyData | undefined {
  return GEORGIA_COUNTIES.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function getDistressColor(level: DistressLevel): string {
  switch (level) {
    case "distressed": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "at-risk": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "transitional": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "competitive": return "bg-green-500/20 text-green-400 border-green-500/30";
  }
}

export function getDistressLabel(level: DistressLevel): string {
  switch (level) {
    case "distressed": return "ARC Distressed";
    case "at-risk": return "ARC At-Risk";
    case "transitional": return "ARC Transitional";
    case "competitive": return "ARC Competitive";
  }
}

export function formatCurrency(value: number, compact?: boolean): string {
  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(0)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function getProjectTypeIcon(type: ProjectType): string {
  const icons: Record<ProjectType, string> = {
    "Affordable Housing": "Home",
    "Vocational Training": "GraduationCap",
    "Renewable Energy": "Zap",
    "Agri-Tech": "Sprout",
    "Manufacturing Upgrade": "Factory",
    "Small Business Incubator": "Rocket",
    "Tourism Eco-Lodge": "TreePine",
    "Logistics Warehouse": "Warehouse",
    "Community Health Center": "HeartPulse",
    "Disaster Recovery Hub": "ShieldAlert",
  };
  return icons[type] || "Building2";
}
