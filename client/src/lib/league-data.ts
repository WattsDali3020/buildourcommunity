import {
  GEORGIA_COUNTIES,
  calculateImpactMetrics,
  type CountyData,
  type ImpactMetrics,
  type ProjectType,
} from "./georgia-impact-data";

export type LeagueType = "gdp" | "social" | "engagement" | "builder";

export interface LeagueConfig {
  id: LeagueType;
  name: string;
  description: string;
  scoreLabel: string;
}

export const LEAGUES: LeagueConfig[] = [
  { id: "gdp", name: "GDP Growth League", description: "Projected 5-year economic output from revitalization investment", scoreLabel: "GDP Score" },
  { id: "social", name: "Social Impact League", description: "Jobs created, affordable units, and community benefit metrics", scoreLabel: "Impact Score" },
  { id: "engagement", name: "Engagement League", description: "Phase advancement speed and governance voting participation", scoreLabel: "Engagement" },
  { id: "builder", name: "Builder League", description: "Personal contribution across all cities you invest in", scoreLabel: "Builder Score" },
];

export interface LeagueCity {
  id: string;
  name: string;
  county: CountyData;
  projectType: ProjectType;
  impactMetrics: ImpactMetrics;
  scores: Record<LeagueType, number>;
  overallRank: number;
  glowIntensity: number;
  seasonWins: number;
  trend: "up" | "down" | "steady";
  latitude: number;
  longitude: number;
}

export interface Rivalry {
  id: string;
  cityA: LeagueCity;
  cityB: LeagueCity;
  title: string;
  leaderLeague: LeagueType;
  margin: number;
}

export interface SeasonInfo {
  number: number;
  name: string;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  bonusPool: number;
  topCities: LeagueCity[];
}

export interface BuilderProfile {
  rank: number;
  totalScore: number;
  citiesContributed: number;
  bestCityName: string;
  bestCityRank: number;
  bonusAPR: number;
  tokensHeld: number;
  votesCount: number;
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

const CITY_NAME_SUFFIXES = [
  "Heights", "Commons", "Village", "District", "Quarter", "Landing",
  "Crossing", "Station", "Plaza", "Gardens", "Ridge", "Hollow",
  "Springs", "Pointe", "Harbor", "Terrace", "Park", "Grove",
];

const GA_COORDS: Record<string, [number, number]> = {
  Wheeler: [32.12, -82.72], Clayton: [33.54, -84.36], Whitfield: [34.77, -84.97],
  Candler: [32.40, -82.07], Treutlen: [32.40, -82.57], Taliaferro: [33.56, -82.88],
  Quitman: [31.87, -85.02], Telfair: [31.97, -82.94], Jenkins: [32.79, -81.97],
  Emanuel: [32.59, -82.30], Lowndes: [30.83, -83.28], Bibb: [32.81, -83.69],
  Dougherty: [31.53, -84.22], Richmond: [33.37, -82.07], Chatham: [32.02, -81.10],
  Muscogee: [32.49, -84.94], Glynn: [31.21, -81.49], Cherokee: [34.24, -84.47],
  Hall: [34.30, -83.82], Coffee: [31.55, -82.85], Rabun: [34.88, -83.40],
  Ware: [31.05, -82.35], Laurens: [32.44, -82.99], Thomas: [30.87, -83.92],
  Troup: [33.03, -85.03],
};

export function calculateGDPLeagueScore(metrics: ImpactMetrics): number {
  return Math.round(metrics.economicScore * 0.6 + metrics.projectedAnnualROI * 0.8 + metrics.riskAdjustedScore * 15);
}

export function calculateSocialLeagueScore(metrics: ImpactMetrics): number {
  return Math.round(metrics.socialScore * 0.7 + metrics.leverageRank * 200 + metrics.riskAdjustedScore * 10);
}

export function calculateEngagementScore(phaseAdvanceSpeed: number, votingRate: number): number {
  return Math.round(phaseAdvanceSpeed * 300 + votingRate * 500 + randomInt(100, 500));
}

export function calculateBuilderScore(tokensHeld: number, propertiesInvested: number, votesCount: number): number {
  return Math.round(tokensHeld * 10 + propertiesInvested * 500 + votesCount * 150);
}

export function generateLeagueCities(count: number): LeagueCity[] {
  const cities: LeagueCity[] = [];
  const usedCounties = new Set<string>();

  for (let i = 0; i < Math.min(count, GEORGIA_COUNTIES.length); i++) {
    let county: CountyData;
    do {
      county = pickRandom(GEORGIA_COUNTIES);
    } while (usedCounties.has(county.name) && usedCounties.size < GEORGIA_COUNTIES.length);
    usedCounties.add(county.name);

    const projectType = pickRandom(county.topNeeds);
    const metrics = calculateImpactMetrics(county, projectType, randomInt(200000, 900000));

    const phaseSpeed = randomInRange(0.3, 1.0);
    const votingRate = randomInRange(0.2, 0.95);

    const scores: Record<LeagueType, number> = {
      gdp: calculateGDPLeagueScore(metrics),
      social: calculateSocialLeagueScore(metrics),
      engagement: calculateEngagementScore(phaseSpeed, votingRate),
      builder: randomInt(500, 8000),
    };

    const suffix = pickRandom(CITY_NAME_SUFFIXES);
    const coords = GA_COORDS[county.name] || [32.0 + Math.random() * 3, -84.0 + Math.random() * 3];

    cities.push({
      id: `city-${county.name.toLowerCase()}-${i}`,
      name: `${county.name} ${suffix}`,
      county,
      projectType,
      impactMetrics: metrics,
      scores,
      overallRank: 0,
      glowIntensity: 0,
      seasonWins: randomInt(0, 5),
      trend: pickRandom(["up", "down", "steady"] as const),
      latitude: coords[0] + (Math.random() - 0.5) * 0.2,
      longitude: coords[1] + (Math.random() - 0.5) * 0.2,
    });
  }

  const maxTotal = Math.max(...cities.map(c => c.scores.gdp + c.scores.social + c.scores.engagement));
  cities
    .sort((a, b) => {
      const totalA = a.scores.gdp + a.scores.social + a.scores.engagement;
      const totalB = b.scores.gdp + b.scores.social + b.scores.engagement;
      return totalB - totalA;
    })
    .forEach((city, idx) => {
      city.overallRank = idx + 1;
      const total = city.scores.gdp + city.scores.social + city.scores.engagement;
      city.glowIntensity = Math.round((total / maxTotal) * 100);
    });

  return cities;
}

export function generateRivalries(cities: LeagueCity[]): Rivalry[] {
  const rivalries: Rivalry[] = [];
  const paired = new Set<string>();

  for (const city of cities) {
    if (paired.has(city.id)) continue;
    const rival = cities.find(
      c => c.id !== city.id && !paired.has(c.id) && c.county.region === city.county.region
    );
    if (!rival) continue;

    paired.add(city.id);
    paired.add(rival.id);

    const leagues: LeagueType[] = ["gdp", "social", "engagement", "builder"];
    let bestLeague: LeagueType = "gdp";
    let bestMargin = 0;
    for (const league of leagues) {
      const margin = Math.abs(city.scores[league] - rival.scores[league]);
      if (margin > bestMargin) {
        bestMargin = margin;
        bestLeague = league;
      }
    }

    rivalries.push({
      id: `rivalry-${city.id}-${rival.id}`,
      cityA: city,
      cityB: rival,
      title: `${city.county.region} Showdown`,
      leaderLeague: bestLeague,
      margin: bestMargin,
    });
  }

  return rivalries.slice(0, 8);
}

export function getCurrentSeason(cities: LeagueCity[]): SeasonInfo {
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setMonth(seasonEnd.getMonth() + 3);
  const daysRemaining = Math.max(0, Math.ceil((seasonEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const seasonNames = ["Winter", "Spring", "Summer", "Fall"];
  const quarter = Math.floor(now.getMonth() / 3);

  return {
    number: 1,
    name: `${seasonNames[quarter]} ${now.getFullYear()}`,
    startDate: seasonStart,
    endDate: seasonEnd,
    daysRemaining,
    bonusPool: 50000,
    topCities: [...cities].sort((a, b) => {
      const totalA = a.scores.gdp + a.scores.social + a.scores.engagement;
      const totalB = b.scores.gdp + b.scores.social + b.scores.engagement;
      return totalB - totalA;
    }).slice(0, 10),
  };
}

export function getBuilderProfile(tokensHeld: number, propertiesInvested: number, votesCount: number, cities: LeagueCity[]): BuilderProfile {
  const totalScore = calculateBuilderScore(tokensHeld, propertiesInvested, votesCount);
  const bestCity = cities.length > 0 ? cities.reduce((best, c) => c.overallRank < best.overallRank ? c : best) : null;

  return {
    rank: Math.max(1, Math.round(100 - (totalScore / 100))),
    totalScore,
    citiesContributed: propertiesInvested,
    bestCityName: bestCity?.name || "None",
    bestCityRank: bestCity?.overallRank || 0,
    bonusAPR: bestCity && bestCity.overallRank <= 50 ? 0.75 : 0,
    tokensHeld,
    votesCount,
  };
}

export function getRankBadge(rank: number): { label: string; color: string } {
  if (rank === 1) return { label: "1st", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" };
  if (rank === 2) return { label: "2nd", color: "bg-slate-300/20 text-slate-300 border-slate-300/40" };
  if (rank === 3) return { label: "3rd", color: "bg-amber-700/20 text-amber-600 border-amber-700/40" };
  if (rank <= 10) return { label: `#${rank}`, color: "bg-primary/20 text-primary border-primary/40" };
  if (rank <= 50) return { label: `#${rank}`, color: "bg-chart-3/20 text-chart-3 border-chart-3/40" };
  return { label: `#${rank}`, color: "bg-muted text-muted-foreground border-muted" };
}

export function getGlowColor(intensity: number): string {
  if (intensity >= 80) return "#22c55e";
  if (intensity >= 60) return "#3b82f6";
  if (intensity >= 40) return "#a855f7";
  if (intensity >= 20) return "#f59e0b";
  return "#6b7280";
}

export function getLeagueIcon(league: LeagueType): string {
  switch (league) {
    case "gdp": return "TrendingUp";
    case "social": return "Heart";
    case "engagement": return "Zap";
    case "builder": return "Hammer";
  }
}
