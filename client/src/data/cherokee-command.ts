export type ValveId = "R" | "C" | "I" | "DRAG";
export type PriorityTag = "helps-r-cap" | "helps-c" | "helps-i" | "adds-drag";

export interface Valve {
  id: ValveId;
  label: string;
  short: string;
  value: number;
  direction: "up" | "flat" | "down";
  note: string;
}

export interface SeedPriority {
  id: string;
  title: string;
  place: string;
  summary: string;
  tags: PriorityTag[];
  phaseProgress: number;
  buyInHint: string;
}

export const SCORECARD_AS_OF = "2026-09-18";
export const COMPOSITE_SCORE = 80;
export const HEADLINE = "Healthy city, jobs and housing not in the same place.";

export const valves: Valve[] = [
  {
    id: "R",
    label: "Residential",
    short: "R",
    value: 86,
    direction: "up",
    note: "High demand, tight vacancy, ~20k units needed over 5 years.",
  },
  {
    id: "C",
    label: "Commercial",
    short: "C",
    value: 58,
    direction: "flat",
    note: "Retail follows rooftops. Local job capture still thin.",
  },
  {
    id: "I",
    label: "Industrial",
    short: "I",
    value: 46,
    direction: "flat",
    note: "~73k in-county jobs vs 152k employed residents.",
  },
  {
    id: "DRAG",
    label: "Drag",
    short: "Drag",
    value: 62,
    direction: "up",
    note: "31-min commute, service load, millage squeeze.",
  },
];

export const seedPriorities: SeedPriority[] = [
  {
    id: "workforce-housing-corridor",
    title: "Workforce / missing-middle housing",
    place: "Holly Springs – Woodstock – Canton fringe",
    summary: "Units the county workforce can actually occupy. Relieves ResCap without adding another I-575 rooftop-only subdivision.",
    tags: ["helps-r-cap"],
    phaseProgress: 18,
    buyInHint: "From $12.50 after KYC",
  },
  {
    id: "trades-bluffs",
    title: "Light industrial / trades shop SPV",
    place: "Canton Corporate Park / The Bluffs",
    summary: "Raises the industrial valve. Local workplaces for people who already live here.",
    tags: ["helps-i"],
    phaseProgress: 12,
    buyInHint: "From $12.50 after KYC",
  },
  {
    id: "downtown-mixed-use",
    title: "Downtown mixed-use slice",
    place: "Canton North Street / Woodstock edge",
    summary: "Internal-market commercial plus upper-story housing. Helps C without stretching the commute.",
    tags: ["helps-c", "helps-r-cap"],
    phaseProgress: 9,
    buyInHint: "From $12.50 after KYC",
  },
  {
    id: "service-node",
    title: "Neighborhood service node",
    place: "Long commute shed off I-575",
    summary: "Clinic, childcare, or food where heat shows demand. Shortens trips.",
    tags: ["helps-c"],
    phaseProgress: 6,
    buyInHint: "From $12.50 after KYC",
  },
  {
    id: "distressed-residential",
    title: "Distressed residential (last)",
    place: "Only where neighbor demand + owner consent exist",
    summary: "Classic vacant-house pin. Allowed after job and workforce pins — house-only heat worsens R vs C/I.",
    tags: ["helps-r-cap", "adds-drag"],
    phaseProgress: 4,
    buyInHint: "From $12.50 after KYC",
  },
];

export const TAG_LABEL: Record<PriorityTag, string> = {
  "helps-r-cap": "helps R-cap",
  "helps-c": "helps C",
  "helps-i": "helps I",
  "adds-drag": "adds drag",
};

export const PUBLIC_FLOOR =
  "Official series (jobs, commute, mills, housing) are the floor. Platform votes do not rewrite unemployment or GDP.";
