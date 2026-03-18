type DistressLevel = "distressed" | "at-risk" | "transitional" | "competitive";

type ProjectType =
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

interface CountyData {
  name: string;
  distressLevel: DistressLevel;
  region: string;
  population: number;
  topNeeds: ProjectType[];
  sviScore: number;
}

interface ProjectTypeConfig {
  multiplierRange: [number, number];
  jobRange: [number, number];
  category: string;
}

interface ImpactMetrics {
  projectedAnnualROI: number;
  economicScore: number;
  socialScore: number;
  leverageRank: number;
  riskAdjustedScore: number;
}

const PROJECT_TYPES: Record<ProjectType, ProjectTypeConfig> = {
  "Affordable Housing": { multiplierRange: [2.0, 3.5], jobRange: [15, 60], category: "Housing" },
  "Vocational Training": { multiplierRange: [2.5, 4.0], jobRange: [10, 40], category: "Education" },
  "Renewable Energy": { multiplierRange: [1.8, 3.2], jobRange: [8, 30], category: "Energy" },
  "Agri-Tech": { multiplierRange: [1.5, 2.8], jobRange: [5, 25], category: "Agriculture" },
  "Manufacturing Upgrade": { multiplierRange: [2.2, 3.8], jobRange: [20, 80], category: "Industry" },
  "Small Business Incubator": { multiplierRange: [2.0, 3.5], jobRange: [15, 50], category: "Commerce" },
  "Tourism Eco-Lodge": { multiplierRange: [1.8, 3.0], jobRange: [10, 35], category: "Tourism" },
  "Logistics Warehouse": { multiplierRange: [2.0, 3.5], jobRange: [25, 90], category: "Infrastructure" },
  "Community Health Center": { multiplierRange: [2.5, 4.0], jobRange: [12, 45], category: "Healthcare" },
  "Disaster Recovery Hub": { multiplierRange: [1.5, 2.5], jobRange: [8, 20], category: "Resilience" },
};

const COUNTIES: CountyData[] = [
  { name: "Wheeler", distressLevel: "distressed", region: "Southeast", population: 7_700, topNeeds: ["Affordable Housing", "Community Health Center", "Agri-Tech"], sviScore: 0.92 },
  { name: "Clayton", distressLevel: "at-risk", region: "Metro Atlanta", population: 297_000, topNeeds: ["Affordable Housing", "Small Business Incubator", "Vocational Training"], sviScore: 0.74 },
  { name: "Whitfield", distressLevel: "transitional", region: "Northwest", population: 105_000, topNeeds: ["Manufacturing Upgrade", "Vocational Training", "Logistics Warehouse"], sviScore: 0.52 },
  { name: "Candler", distressLevel: "distressed", region: "Southeast", population: 10_800, topNeeds: ["Agri-Tech", "Community Health Center", "Renewable Energy"], sviScore: 0.89 },
  { name: "Treutlen", distressLevel: "distressed", region: "Central", population: 6_700, topNeeds: ["Disaster Recovery Hub", "Affordable Housing", "Agri-Tech"], sviScore: 0.91 },
  { name: "Taliaferro", distressLevel: "distressed", region: "Central", population: 1_600, topNeeds: ["Community Health Center", "Renewable Energy", "Affordable Housing"], sviScore: 0.95 },
  { name: "Quitman", distressLevel: "distressed", region: "Southwest", population: 2_300, topNeeds: ["Agri-Tech", "Disaster Recovery Hub", "Affordable Housing"], sviScore: 0.93 },
  { name: "Telfair", distressLevel: "distressed", region: "South Central", population: 15_800, topNeeds: ["Vocational Training", "Manufacturing Upgrade", "Community Health Center"], sviScore: 0.88 },
  { name: "Jenkins", distressLevel: "distressed", region: "East Central", population: 8_600, topNeeds: ["Agri-Tech", "Renewable Energy", "Affordable Housing"], sviScore: 0.90 },
  { name: "Emanuel", distressLevel: "at-risk", region: "East Central", population: 22_500, topNeeds: ["Small Business Incubator", "Logistics Warehouse", "Vocational Training"], sviScore: 0.68 },
  { name: "Lowndes", distressLevel: "transitional", region: "South", population: 117_000, topNeeds: ["Manufacturing Upgrade", "Logistics Warehouse", "Affordable Housing"], sviScore: 0.48 },
  { name: "Bibb", distressLevel: "at-risk", region: "Central", population: 153_000, topNeeds: ["Affordable Housing", "Small Business Incubator", "Community Health Center"], sviScore: 0.72 },
  { name: "Dougherty", distressLevel: "distressed", region: "Southwest", population: 87_000, topNeeds: ["Affordable Housing", "Vocational Training", "Community Health Center"], sviScore: 0.87 },
  { name: "Richmond", distressLevel: "at-risk", region: "East", population: 206_000, topNeeds: ["Manufacturing Upgrade", "Small Business Incubator", "Affordable Housing"], sviScore: 0.70 },
  { name: "Chatham", distressLevel: "transitional", region: "Coastal", population: 295_000, topNeeds: ["Tourism Eco-Lodge", "Logistics Warehouse", "Disaster Recovery Hub"], sviScore: 0.45 },
  { name: "Muscogee", distressLevel: "at-risk", region: "West", population: 195_000, topNeeds: ["Manufacturing Upgrade", "Vocational Training", "Affordable Housing"], sviScore: 0.66 },
  { name: "Glynn", distressLevel: "transitional", region: "Coastal", population: 85_000, topNeeds: ["Tourism Eco-Lodge", "Renewable Energy", "Disaster Recovery Hub"], sviScore: 0.42 },
  { name: "Cherokee", distressLevel: "competitive", region: "North Metro", population: 266_000, topNeeds: ["Small Business Incubator", "Affordable Housing", "Renewable Energy"], sviScore: 0.22 },
  { name: "Hall", distressLevel: "transitional", region: "Northeast", population: 204_000, topNeeds: ["Manufacturing Upgrade", "Logistics Warehouse", "Vocational Training"], sviScore: 0.50 },
  { name: "Coffee", distressLevel: "at-risk", region: "South Central", population: 43_000, topNeeds: ["Agri-Tech", "Vocational Training", "Small Business Incubator"], sviScore: 0.65 },
  { name: "Rabun", distressLevel: "transitional", region: "Northeast Mountains", population: 17_000, topNeeds: ["Tourism Eco-Lodge", "Renewable Energy", "Small Business Incubator"], sviScore: 0.38 },
  { name: "Ware", distressLevel: "at-risk", region: "Southeast", population: 35_500, topNeeds: ["Community Health Center", "Manufacturing Upgrade", "Affordable Housing"], sviScore: 0.71 },
  { name: "Laurens", distressLevel: "at-risk", region: "Central", population: 47_000, topNeeds: ["Logistics Warehouse", "Vocational Training", "Community Health Center"], sviScore: 0.63 },
  { name: "Thomas", distressLevel: "transitional", region: "Southwest", population: 44_700, topNeeds: ["Agri-Tech", "Tourism Eco-Lodge", "Small Business Incubator"], sviScore: 0.47 },
  { name: "Troup", distressLevel: "at-risk", region: "West", population: 69_900, topNeeds: ["Manufacturing Upgrade", "Affordable Housing", "Vocational Training"], sviScore: 0.67 },
];

function getDistressMultiplier(level: DistressLevel): number {
  switch (level) {
    case "distressed": return 1.4;
    case "at-risk": return 1.2;
    case "transitional": return 1.1;
    case "competitive": return 1.0;
  }
}

function getDistressPercentile(level: DistressLevel): number {
  switch (level) {
    case "distressed": return 0.75;
    case "at-risk": return 0.65;
    case "transitional": return 0.50;
    case "competitive": return 0.40;
  }
}

function getPointEstimate(low: number, high: number, percentile: number): number {
  return low + (high - low) * percentile;
}

export function calculateImpactMetrics(
  county: CountyData,
  projectType: ProjectType,
  budget: number
): ImpactMetrics {
  const typeConfig = PROJECT_TYPES[projectType];
  const distressBonus = getDistressMultiplier(county.distressLevel);
  const percentile = getDistressPercentile(county.distressLevel);

  const multiplier = getPointEstimate(typeConfig.multiplierRange[0], typeConfig.multiplierRange[1], percentile);
  const jobs = Math.round(getPointEstimate(typeConfig.jobRange[0], typeConfig.jobRange[1], percentile));

  const sviContribution = Math.round(county.sviScore * 1000);

  const economicScore = Math.min(10000, Math.round(jobs * 100 + multiplier * 1000));
  const socialScore = Math.min(10000, Math.round(
    (projectType === "Affordable Housing" ? 3000 : 1500) +
    (projectType === "Community Health Center" ? 2500 : 0) +
    (distressBonus >= 1.3 ? 2000 : 1000) +
    (jobs > 30 ? 1500 : 500) +
    sviContribution
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

export function getCountyByName(name: string): CountyData | undefined {
  return COUNTIES.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function getAllCounties() {
  return COUNTIES.map(c => ({
    name: c.name,
    distressLevel: c.distressLevel,
    region: c.region,
    population: c.population,
    topNeeds: c.topNeeds,
    sviScore: c.sviScore,
  }));
}

export function getAllProjectTypes() {
  return Object.entries(PROJECT_TYPES).map(([name, config]) => ({
    name,
    category: config.category,
    multiplierRange: config.multiplierRange,
    jobRange: config.jobRange,
  }));
}

export function isValidProjectType(type: string): type is ProjectType {
  return type in PROJECT_TYPES;
}

export const VALID_PROJECT_TYPES = Object.keys(PROJECT_TYPES);
