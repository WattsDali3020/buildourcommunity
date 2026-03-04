import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Zap,
  Hammer,
  Timer,
  Crown,
  Shield,
  Swords,
  MapPin,
  ArrowRight,
  Info,
  Star,
  Gift,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  generateLeagueCities,
  generateRivalries,
  getCurrentSeason,
  getRankBadge,
  getGlowColor,
  LEAGUES,
  type LeagueCity,
  type LeagueType,
  type Rivalry,
  type SeasonInfo,
} from "@/lib/league-data";

const LEAGUE_ICONS: Record<LeagueType, typeof TrendingUp> = {
  gdp: TrendingUp,
  social: Heart,
  engagement: Zap,
  builder: Hammer,
};

function TrendIcon({ trend }: { trend: "up" | "down" | "steady" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function GlowBadge({ intensity }: { intensity: number }) {
  const color = getGlowColor(intensity);
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-xs text-muted-foreground">{intensity}%</span>
    </div>
  );
}

function TopThreeCards({ cities, league }: { cities: LeagueCity[]; league: LeagueType }) {
  const sorted = [...cities].sort((a, b) => b.scores[league] - a.scores[league]);
  const top3 = sorted.slice(0, 3);
  const medals = ["text-yellow-400", "text-slate-300", "text-amber-600"];
  const LeagueIcon = LEAGUE_ICONS[league];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {top3.map((city, idx) => {
        const badge = getRankBadge(idx + 1);
        return (
          <Card key={city.id} data-testid={`card-top3-${idx + 1}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Crown className={`h-5 w-5 ${medals[idx]}`} />
                  <Badge variant="outline" className={badge.color}>
                    {badge.label}
                  </Badge>
                </div>
                <GlowBadge intensity={city.glowIntensity} />
              </div>
              <h3 className="font-semibold text-base mb-1" data-testid={`text-top3-name-${idx + 1}`}>{city.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{city.county.name} County, GA</p>
              <div className="flex items-center gap-2 mb-2">
                <LeagueIcon className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold" data-testid={`text-top3-score-${idx + 1}`}>{city.scores[league].toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <TrendIcon trend={city.trend} />
                  <span className="text-xs text-muted-foreground capitalize">{city.trend}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">{city.seasonWins} wins</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function LeaderboardTable({ cities, league }: { cities: LeagueCity[]; league: LeagueType }) {
  const sorted = [...cities].sort((a, b) => b.scores[league] - a.scores[league]);
  const leagueConfig = LEAGUES.find(l => l.id === league)!;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid={`table-leaderboard-${league}`}>
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-3 font-medium text-muted-foreground w-12">Rank</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground">City</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground hidden sm:table-cell">County</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground text-right">{leagueConfig.scoreLabel}</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground text-center w-16">Trend</th>
            <th className="py-2 font-medium text-muted-foreground text-center w-20">Glow</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((city, idx) => {
            const rank = idx + 1;
            const badge = getRankBadge(rank);
            const isTop10 = rank <= 10;
            return (
              <tr
                key={city.id}
                className={`border-b last:border-0 ${isTop10 ? "bg-primary/5" : ""}`}
                data-testid={`row-leaderboard-${city.id}`}
              >
                <td className="py-2.5 pr-3">
                  <Badge variant="outline" className={`${badge.color} text-xs`}>
                    {badge.label}
                  </Badge>
                </td>
                <td className="py-2.5 pr-3 font-medium">{city.name}</td>
                <td className="py-2.5 pr-3 text-muted-foreground hidden sm:table-cell">{city.county.name}</td>
                <td className="py-2.5 pr-3 text-right font-mono font-semibold">{city.scores[league].toLocaleString()}</td>
                <td className="py-2.5 pr-3 text-center">
                  <div className="flex justify-center">
                    <TrendIcon trend={city.trend} />
                  </div>
                </td>
                <td className="py-2.5 text-center">
                  <div className="flex justify-center">
                    <GlowBadge intensity={city.glowIntensity} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RivalryCard({ rivalry }: { rivalry: Rivalry }) {
  const leagueConfig = LEAGUES.find(l => l.id === rivalry.leaderLeague)!;
  const LeagueIcon = LEAGUE_ICONS[rivalry.leaderLeague];
  const aWins = rivalry.cityA.scores[rivalry.leaderLeague] > rivalry.cityB.scores[rivalry.leaderLeague];

  return (
    <Card data-testid={`card-rivalry-${rivalry.id}`} className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Swords className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{rivalry.title}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className={`flex-1 text-center p-2 rounded-md ${aWins ? "bg-primary/10" : "bg-muted/50"}`}>
            <p className="text-xs text-muted-foreground mb-1">City A</p>
            <p className="font-semibold text-sm truncate">{rivalry.cityA.name}</p>
            <p className="text-lg font-bold mt-1">{rivalry.cityA.scores[rivalry.leaderLeague].toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">vs</span>
            <Badge variant="outline" className="text-xs">
              <LeagueIcon className="h-3 w-3 mr-1" />
              {leagueConfig.name.split(" ")[0]}
            </Badge>
          </div>
          <div className={`flex-1 text-center p-2 rounded-md ${!aWins ? "bg-primary/10" : "bg-muted/50"}`}>
            <p className="text-xs text-muted-foreground mb-1">City B</p>
            <p className="font-semibold text-sm truncate">{rivalry.cityB.name}</p>
            <p className="text-lg font-bold mt-1">{rivalry.cityB.scores[rivalry.leaderLeague].toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Margin: {rivalry.margin.toLocaleString()} pts
          </span>
          <Link href="/properties">
            <Button variant="ghost" size="sm" data-testid={`button-view-rivalry-${rivalry.id}`}>
              View Rivalry
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitionMap({ cities }: { cities: LeagueCity[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [32.5, -83.5],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    cities.forEach((city) => {
      const color = getGlowColor(city.glowIntensity);
      const size = city.overallRank <= 3 ? 20 : city.overallRank <= 10 ? 16 : 12;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: ${size}px; height: ${size}px; border-radius: 50%;
          background: ${color}; border: 2px solid white;
          box-shadow: 0 0 ${city.glowIntensity / 5}px ${color};
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([city.latitude, city.longitude], { icon }).addTo(map);

      const popupContent = `
        <div style="min-width:180px;font-family:system-ui,sans-serif;padding:4px 0;">
          <div style="font-weight:600;font-size:13px;margin-bottom:2px;">${city.name}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">${city.county.name} County — Rank #${city.overallRank}</div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
            <span style="color:#94a3b8;">GDP</span>
            <span style="font-weight:600;">${city.scores.gdp.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
            <span style="color:#94a3b8;">Social</span>
            <span style="font-weight:600;">${city.scores.social.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
            <span style="color:#94a3b8;">Engagement</span>
            <span style="font-weight:600;">${city.scores.engagement.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px;padding-top:4px;border-top:1px solid #1e293b;">
            <span style="color:#94a3b8;">Season Wins</span>
            <span style="color:#facc15;font-weight:600;">${city.seasonWins}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "leaflet-dark-popup",
        closeButton: true,
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [cities]);

  const rankLegend = [
    { label: "Top 3", color: "#22c55e" },
    { label: "Top 10", color: "#3b82f6" },
    { label: "Top 25", color: "#a855f7" },
    { label: "Top 50", color: "#f59e0b" },
    { label: "Other", color: "#6b7280" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Competition Map</span>
          <span className="text-xs text-muted-foreground">— click cities for stats</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {rankLegend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 4px ${item.color}` }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md overflow-hidden border" style={{ height: "400px" }}>
        <div ref={mapRef} className="w-full h-full" data-testid="league-competition-map" />
      </div>
    </div>
  );
}

function SeasonTimerCard({ season }: { season: SeasonInfo }) {
  return (
    <Card data-testid="card-season-timer">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold" data-testid="text-season-name">
                Season {season.number} — {season.name}
              </p>
              <p className="text-sm text-muted-foreground">RevitaCup Competition</p>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary" data-testid="text-days-remaining">{season.daysRemaining}</p>
              <p className="text-xs text-muted-foreground">Days Left</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-3" data-testid="text-bonus-pool">
                ${(season.bonusPool / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">Bonus Pool</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-4" data-testid="text-top-cities-count">{season.topCities.length}</p>
              <p className="text-xs text-muted-foreground">Cities Racing</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RevitaCupSection({ season }: { season: SeasonInfo }) {
  return (
    <Card data-testid="card-revitacup">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          RevitaCup — Top 10
        </CardTitle>
        <CardDescription>
          Top 10 cities split the ${(season.bonusPool / 1000).toFixed(0)}K seasonal bonus pool
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {season.topCities.map((city, idx) => {
            const rank = idx + 1;
            const badge = getRankBadge(rank);
            const allocation = rank <= 3 ? [30, 20, 15][idx] : 5;
            return (
              <div
                key={city.id}
                className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/30 flex-wrap"
                data-testid={`row-cup-${city.id}`}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${badge.color} text-xs`}>
                    {badge.label}
                  </Badge>
                  <span className="font-medium text-sm">{city.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-muted-foreground">
                    {(city.scores.gdp + city.scores.social + city.scores.engagement).toLocaleString()} pts
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    <Gift className="h-3 w-3 mr-1" />
                    ~{allocation}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        <Separator className="my-4" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3" />
          <span>Past seasons: No previous winners yet — this is Season 1</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeaguePage() {
  const [activeLeague, setActiveLeague] = useState<LeagueType>("gdp");

  const cities = useMemo(() => generateLeagueCities(25), []);
  const rivalries = useMemo(() => generateRivalries(cities), [cities]);
  const season = useMemo(() => getCurrentSeason(cities), [cities]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <style>{`
        .leaflet-dark-popup .leaflet-popup-content-wrapper {
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 12px;
          border: 1px solid #1e293b;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .leaflet-dark-popup .leaflet-popup-tip {
          background: #0f172a;
          border: 1px solid #1e293b;
        }
        .leaflet-dark-popup .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      <main className="flex-1">
        <div className="bg-gradient-to-b from-background to-muted/30 border-b">
          <div className="mx-auto max-w-5xl px-4 pt-14 pb-10 text-center">
            <div className="mb-5">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-sm" data-testid="badge-league">
                <Trophy className="h-3.5 w-3.5 mr-1.5" />
                RevitaLeague
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 text-foreground" data-testid="text-league-title">
              RevitaLeague
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-league-subtitle">
              Every property is a city. Every investor is a builder. Compete to revitalize.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
          <SeasonTimerCard season={season} />

          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {LEAGUES.map((league) => {
                const Icon = LEAGUE_ICONS[league.id];
                const isActive = activeLeague === league.id;
                return (
                  <Button
                    key={league.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveLeague(league.id)}
                    data-testid={`button-league-tab-${league.id}`}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {league.name}
                  </Button>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {LEAGUES.find(l => l.id === activeLeague)?.description}
            </p>

            <TopThreeCards cities={cities} league={activeLeague} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Full Leaderboard — {LEAGUES.find(l => l.id === activeLeague)?.name}
                </CardTitle>
                <CardDescription>
                  {cities.length} cities competing across Georgia counties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable cities={cities} league={activeLeague} />
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" data-testid="text-rivalries-heading">
              <Swords className="h-5 w-5" />
              Cross-County Rivalries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rivalries.map((rivalry) => (
                <RivalryCard key={rivalry.id} rivalry={rivalry} />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Georgia Competition Map
              </CardTitle>
              <CardDescription>
                City markers colored by league rank — brighter glow means higher ranking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitionMap cities={cities} />
            </CardContent>
          </Card>

          <RevitaCupSection season={season} />

          <Card data-testid="card-smart-contract-note">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">Smart Contract Integration</p>
                  <p className="text-sm text-muted-foreground">
                    League scores (<code className="text-xs bg-muted px-1 py-0.5 rounded">leagueScore</code>) and season wins (<code className="text-xs bg-muted px-1 py-0.5 rounded">seasonWins</code>) will be recorded on-chain via PropertyToken.sol and PhaseManager.sol when mainnet launches. Current rankings use projected simulations based on Georgia county economic data and Chainlink oracle feeds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground" data-testid="text-disclaimer">
              Rankings are projected simulations based on economic modeling. Not financial advice. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
