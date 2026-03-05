import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, MapPin, Building2, TrendingUp, Users, DollarSign, HardHat } from "lucide-react";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property as DBProperty } from "@shared/schema";

const GA_COUNTIES_GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/GA.geo.json";

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

  const { data: properties = [] } = useQuery<DBProperty[]>({
    queryKey: ["/api/properties"],
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [32.9, -83.2],
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

    mapInstanceRef.current = map;

    fetch(GA_COUNTIES_GEOJSON_URL)
      .then((res) => res.json())
      .then((geojsonData) => {
        if (!mapInstanceRef.current) return;
        try {
          L.geoJSON(geojsonData, {
            style: {
              color: "rgba(59, 130, 246, 0.2)",
              weight: 1,
              fillColor: "rgba(59, 130, 246, 0.04)",
              fillOpacity: 1,
              interactive: false,
            },
          }).addTo(mapInstanceRef.current);
        } catch {
          // silently skip if GeoJSON fails
        }
      })
      .catch(() => {});

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    properties.forEach((prop) => {
      const lat = parseFloat(prop.city === "Canton" ? "34.2368" : "34.0");
      const lng = parseFloat(prop.city === "Canton" ? "-84.4908" : "-84.0");
      const phase = "County";

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(phase),
      }).addTo(map);

      const popupContent = `
        <div style="min-width:220px;font-family:system-ui,sans-serif;padding:4px 0;">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${prop.name}</div>
          <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">${prop.city}, ${prop.state}</div>
          <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="color:#94a3b8;">$12.50/token</span>
            <span style="color:#22c55e;font-weight:600;">${prop.projectedROI || 0}% ROI</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "leaflet-dark-popup",
        closeButton: true,
      });
    });
  }, [properties]);

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
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <section data-testid="hero-section" className="relative w-full" style={{ height: "100vh", minHeight: "700px" }}>
        <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" data-testid="hero-map" />

        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, transparent 60%)"
        }} />

        <motion.div
          className="absolute z-20 left-0 right-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
          style={{ top: "8%", maxHeight: "40%" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-5 pointer-events-auto">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-sm" data-testid="badge-platform">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              AI-Nudged RevitalDAO
            </Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-5 text-white drop-shadow-lg" data-testid="text-hero-title">
            Build Your Community,{" "}
            <span className="text-gradient-animated">One Token at a Time</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto mb-6 leading-relaxed drop-shadow-md" data-testid="text-hero-subtitle">
            Nominate distressed properties, invest in revitalization, vote on development
            plans, and watch your county transform.{" "}
            <span className="text-primary font-medium">Like SimCity, but real.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 pointer-events-auto">
            <Button size="lg" asChild className="min-w-[200px]" data-testid="button-explore-properties">
              <Link href="/properties">
                Explore Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[200px] border-white/20 text-white hover:bg-white/10" data-testid="button-nominate">
              <Link href="/wishlist">
                <MapPin className="mr-2 h-4 w-4" />
                Nominate Property
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center pointer-events-auto">
            {Object.entries(phaseColors).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-1.5 text-xs text-gray-300">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span>{phase}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {properties.length === 0 && (
          <motion.div
            className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <MapPin className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 rounded-full border-2 border-primary" style={{
                  animation: "pulse-ring 2s ease-out infinite"
                }} />
              </div>
              <p className="text-sm text-gray-300 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 text-center max-w-[280px]">
                Be the first to nominate a property in your county
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          className="absolute z-20 right-4 lg:right-6 hidden md:flex flex-col gap-3 pointer-events-auto"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link href="/properties">
            <div className="group cursor-pointer rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-4 w-[200px] hover:bg-black/70 transition-all" data-testid="cta-invest">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm font-semibold text-white">I want to invest</p>
              <p className="text-xs text-gray-400 mt-0.5">Browse tokenized properties</p>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link href="/professionals">
              <div className="group cursor-pointer rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-4 w-[200px] hover:bg-black/70 transition-all" data-testid="cta-build">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-chart-2/20 flex items-center justify-center">
                    <HardHat className="h-4 w-4 text-chart-2" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm font-semibold text-white">I want to build</p>
                <p className="text-xs text-gray-400 mt-0.5">Join the pro network</p>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute z-20 bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10"
          data-testid="stats-bar"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center" data-testid="stat-properties">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{properties.length}</span>
                </div>
                <p className="text-sm text-gray-400">Active Properties</p>
              </div>
              <div className="text-center" data-testid="stat-funded">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-chart-3" />
                  <span className="text-2xl sm:text-3xl font-bold text-chart-3">$0</span>
                </div>
                <p className="text-sm text-gray-400">Total Raised</p>
              </div>
              <div className="text-center" data-testid="stat-investors">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-chart-2" />
                  <span className="text-2xl sm:text-3xl font-bold text-chart-2">0</span>
                </div>
                <p className="text-sm text-gray-400">Community Members</p>
              </div>
              <div className="text-center" data-testid="stat-engagement">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-chart-4" />
                  <span className="text-2xl sm:text-3xl font-bold text-chart-4">$12.50</span>
                </div>
                <p className="text-sm text-gray-400">Min. Investment</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
