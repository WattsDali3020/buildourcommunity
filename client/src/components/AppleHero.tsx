import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, MapPin, Building2, TrendingUp, Users, DollarSign } from "lucide-react";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const propertyMarkers = [
  {
    id: "etowah-wellness-village",
    name: "Etowah Riverfront Wellness Village",
    city: "Canton",
    state: "Georgia",
    lat: 34.2368,
    lng: -84.4908,
    phase: "County",
    fundingPercent: 42,
    tokenPrice: 12.50,
    roi: 8,
  },
  {
    id: "mill-on-main",
    name: "Historic Mill Adaptive Reuse",
    city: "Greenville",
    state: "South Carolina",
    lat: 34.8526,
    lng: -82.394,
    phase: "State",
    fundingPercent: 72,
    tokenPrice: 18.75,
    roi: 9.5,
  },
  {
    id: "downtown-revitalization",
    name: "Main Street Revitalization District",
    city: "Asheville",
    state: "North Carolina",
    lat: 35.5951,
    lng: -82.5515,
    phase: "National",
    fundingPercent: 71,
    tokenPrice: 28.13,
    roi: 7.5,
  },
  {
    id: "austin-land-trust",
    name: "Community Land Trust Initiative",
    city: "Austin",
    state: "Texas",
    lat: 30.2672,
    lng: -97.7431,
    phase: "County",
    fundingPercent: 33,
    tokenPrice: 12.50,
    roi: 6.5,
  },
  {
    id: "denver-warehouse",
    name: "RiNo Arts District Warehouse",
    city: "Denver",
    state: "Colorado",
    lat: 39.7645,
    lng: -104.9803,
    phase: "State",
    fundingPercent: 72,
    tokenPrice: 18.75,
    roi: 8.5,
  },
  {
    id: "phoenix-downtown",
    name: "Roosevelt Row Revitalization",
    city: "Phoenix",
    state: "Arizona",
    lat: 33.462,
    lng: -112.065,
    phase: "County",
    fundingPercent: 28,
    tokenPrice: 12.50,
    roi: 7.8,
  },
];

const phaseColors: Record<string, string> = {
  County: "#22c55e",
  State: "#3b82f6",
  National: "#a855f7",
  International: "#f59e0b",
};

function createMarkerIcon(phase: string) {
  const color = phaseColors[phase] || "#3b82f6";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    "><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="${color}"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function AppleHero() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [36.5, -96],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    propertyMarkers.forEach((prop) => {
      const marker = L.marker([prop.lat, prop.lng], {
        icon: createMarkerIcon(prop.phase),
      }).addTo(map);

      const popupContent = `
        <div style="min-width:220px;font-family:system-ui,sans-serif;padding:4px 0;">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${prop.name}</div>
          <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">${prop.city}, ${prop.state}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:11px;color:#94a3b8;">Funded</span>
            <span style="font-size:12px;font-weight:600;color:${phaseColors[prop.phase]}">${prop.fundingPercent}%</span>
          </div>
          <div style="background:#1e293b;border-radius:4px;height:6px;overflow:hidden;margin-bottom:8px;">
            <div style="background:${phaseColors[prop.phase]};height:100%;width:${prop.fundingPercent}%;border-radius:4px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:#94a3b8;">$${prop.tokenPrice}/token</span>
            <span style="color:#22c55e;font-weight:600;">${prop.roi}% ROI</span>
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
  }, []);

  return (
    <>
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

      <section data-testid="hero-section">
        <div className="bg-gradient-to-b from-background to-muted/30 border-b">
          <div className="mx-auto max-w-5xl px-4 pt-14 pb-10 text-center">
            <div className="mb-5">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-sm" data-testid="badge-platform">
                <Building2 className="h-3.5 w-3.5 mr-1.5" />
                AI-Nudged RevitalDAO
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 text-foreground" data-testid="text-hero-title">
              Build Your Community,{" "}
              <span className="text-gradient-animated">One Token at a Time</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed" data-testid="text-hero-subtitle">
              Nominate distressed properties, invest in revitalization, vote on development
              plans, and watch your county transform.{" "}
              <span className="text-primary font-medium">Like SimCity, but real.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button size="lg" asChild className="min-w-[200px]" data-testid="button-explore-properties">
                <Link href="/properties">
                  Explore Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="min-w-[200px]" data-testid="button-nominate">
                <Link href="/wishlist">
                  <MapPin className="mr-2 h-4 w-4" />
                  Nominate Property
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Active Projects</span>
                <span className="text-xs text-muted-foreground">— click markers for details</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {Object.entries(phaseColors).map(([phase, color]) => (
                  <div key={phase} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span>{phase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-4">
            <div className="rounded-xl overflow-hidden border shadow-lg" style={{ height: "500px" }}>
              <div ref={mapRef} className="w-full h-full" data-testid="hero-map" />
            </div>
          </div>
        </div>

        <div className="bg-card border-y" data-testid="stats-bar">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center" data-testid="stat-properties">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold text-primary">6</span>
                </div>
                <p className="text-sm text-muted-foreground">Active Properties</p>
              </div>
              <div className="text-center" data-testid="stat-funded">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-chart-3" />
                  <span className="text-2xl sm:text-3xl font-bold text-chart-3">$56.4M</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </div>
              <div className="text-center" data-testid="stat-investors">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-chart-2" />
                  <span className="text-2xl sm:text-3xl font-bold text-chart-2">2,847</span>
                </div>
                <p className="text-sm text-muted-foreground">Community Members</p>
              </div>
              <div className="text-center" data-testid="stat-engagement">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-chart-4" />
                  <span className="text-2xl sm:text-3xl font-bold text-chart-4">$12.50</span>
                </div>
                <p className="text-sm text-muted-foreground">Min. Investment</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
