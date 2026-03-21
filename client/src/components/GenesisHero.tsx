import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, MapPin, Building2, TrendingUp, Users, DollarSign } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { Property as DBProperty } from "@shared/schema";

const GA_COUNTIES_TOPOJSON_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/us-states/GA-13-georgia-counties.json";

const GA_CITY_COORDS: Record<string, [number, number]> = {
  "Canton": [34.2368, -84.4908],
  "Atlanta": [33.7490, -84.3880],
  "Carrollton": [33.5801, -85.0766],
  "Rome": [34.2570, -85.1647],
  "Valdosta": [30.8327, -83.2785],
  "Augusta": [33.4735, -81.9748],
  "Savannah": [32.0809, -81.0912],
  "Macon": [32.8407, -83.6324],
  "Columbus": [32.4610, -84.9877],
  "Albany": [31.5785, -84.1557],
  "Marietta": [33.9526, -84.5499],
  "Athens": [33.9519, -83.3576],
  "Gainesville": [34.2979, -83.8241],
  "Dalton": [34.7698, -84.9702],
  "Warner Robins": [32.6130, -83.6243],
  "Roswell": [34.0232, -84.3616],
  "Woodstock": [34.1015, -84.5194],
  "Ball Ground": [34.3387, -84.3752],
  "Waleska": [34.3165, -84.5530],
  "Holly Springs": [34.1743, -84.5027],
  "Jasper": [34.4676, -84.4291],
};

const DEFAULT_GA_CENTER: [number, number] = [32.9, -83.2];

function createMarkerIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: #C9963A; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#C9963A"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function useCountUp(end: number, duration: number = 1000, shouldStart: boolean = false, prefix: string = "", suffix: string = "") {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!shouldStart) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, shouldStart]);

  return `${prefix}${value.toLocaleString()}${suffix}`;
}

export function GenesisHero() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [phase, setPhase] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  const { data: properties = [] } = useQuery<DBProperty[]>({
    queryKey: ["/api/properties"],
  });

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 400);
    const timer2 = setTimeout(() => setPhase(2), 1200);
    const timer3 = setTimeout(() => setPhase(3), 2000);
    const timer4 = setTimeout(() => setPhase(4), 2800);
    const timer5 = setTimeout(() => setPhase(5), 3400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

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

    fetch(GA_COUNTIES_TOPOJSON_URL)
      .then((res) => res.json())
      .then((topoData) => {
        if (!mapInstanceRef.current) return;
        try {
          if (!topoData.objects || Object.keys(topoData.objects).length === 0) return;
          const objectKey = Object.keys(topoData.objects)[0];
          const geojsonData = feature(topoData as Topology, topoData.objects[objectKey]);
          L.geoJSON(geojsonData as GeoJSON.GeoJsonObject, {
            style: {
              color: "rgba(201, 150, 58, 0.2)",
              weight: 1,
              fillColor: "rgba(201, 150, 58, 0.04)",
              fillOpacity: 1,
              interactive: false,
            },
          }).addTo(mapInstanceRef.current!);
        } catch {
          // silently skip
        }
      })
      .catch(() => {});

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || phase < 4) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    properties.forEach((prop, i) => {
      let lat: number;
      let lng: number;

      if (prop.latitude != null && prop.longitude != null) {
        const parsedLat = parseFloat(String(prop.latitude));
        const parsedLng = parseFloat(String(prop.longitude));
        if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
          lat = parsedLat;
          lng = parsedLng;
        } else {
          const cityCoords = prop.city ? GA_CITY_COORDS[prop.city] : null;
          [lat, lng] = cityCoords || DEFAULT_GA_CENTER;
        }
      } else {
        const cityCoords = prop.city ? GA_CITY_COORDS[prop.city] : null;
        [lat, lng] = cityCoords || DEFAULT_GA_CENTER;
      }

      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        const marker = L.marker([lat, lng], { icon: createMarkerIcon() }).addTo(mapInstanceRef.current);
        const popupContent = `
          <div style="min-width:220px;font-family:'DM Sans',sans-serif;padding:4px 0;">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${prop.name}</div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">${prop.city}, ${prop.state}</div>
            <div style="display:flex;justify-content:space-between;font-size:12px;">
              <span style="color:#94a3b8;">$12.50/token</span>
              <span style="color:#2D6A4F;font-weight:600;">${prop.projectedROI || 0}% ROI</span>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, { className: "leaflet-dark-popup", closeButton: true });
      }, i * 150);
    });
  }, [properties, phase]);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true); },
      { threshold: 0.1 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const statsVisible = phase >= 5 && statsInView;
  const propCount = useCountUp(properties.length || 12, 1000, statsVisible);
  const membersCount = useCountUp(247, 1000, statsVisible);
  const raisedCount = useCountUp(156, 1000, statsVisible, "$", "K");
  const formattedMinInvest = statsVisible ? "$12.50" : "$0";

  return (
    <>
      <style>{`
        .leaflet-dark-popup .leaflet-popup-content-wrapper {
          background: #1A1A18;
          color: #e2e8f0;
          border-radius: 12px;
          border: 1px solid rgba(201, 150, 58, 0.2);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .leaflet-dark-popup .leaflet-popup-tip {
          background: #1A1A18;
          border: 1px solid rgba(201, 150, 58, 0.2);
        }
        .leaflet-dark-popup .leaflet-popup-close-button {
          color: #6E6C63 !important;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes genesis-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <section data-testid="hero-section" className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "700px" }}>
        <motion.div
          className="absolute inset-0 z-0"
          style={{ background: "#0a0a08" }}
          animate={{ opacity: phase >= 3 ? 0 : 1 }}
          transition={{ duration: 1.2 }}
        />

        <motion.div
          ref={mapRef}
          className="absolute inset-0 w-full h-full z-0"
          data-testid="hero-map"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 1.5 }}
        />

        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: "linear-gradient(to bottom, rgba(10,10,8,0.6) 0%, rgba(10,10,8,0.3) 40%, transparent 60%)"
        }} />

        <AnimatePresence>
          {phase < 3 && (
            <motion.div
              className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {phase >= 1 && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="w-4 h-4 rounded-full bg-primary" style={{ boxShadow: "0 0 30px rgba(201, 150, 58, 0.6)" }} />
                  {phase >= 2 && (
                    <>
                      <motion.div
                        className="absolute rounded-full border border-primary/30"
                        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        initial={{ width: 0, height: 0, opacity: 0 }}
                        animate={{ width: 120, height: 120, opacity: [0, 0.6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {(() => {
                        const nodes = [
                          { x: -80, y: -60 }, { x: 90, y: -30 }, { x: -60, y: 70 },
                          { x: 70, y: 50 }, { x: -20, y: -90 }, { x: 40, y: 80 },
                        ];
                        const connections = [
                          [0, 1], [0, 2], [1, 3], [2, 5], [3, 5], [4, 0],
                        ];
                        return (
                          <>
                            <svg className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 240, height: 240, overflow: 'visible' }}>
                              {connections.map(([a, b], i) => (
                                <motion.line
                                  key={`line-${i}`}
                                  x1={nodes[a].x + 120}
                                  y1={nodes[a].y + 120}
                                  x2={nodes[b].x + 120}
                                  y2={nodes[b].y + 120}
                                  stroke="rgba(201, 150, 58, 0.25)"
                                  strokeWidth={1}
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                                />
                              ))}
                            </svg>
                            {nodes.map((pos, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-primary/60"
                                style={{ top: '50%', left: '50%' }}
                                initial={{ x: 0, y: 0, opacity: 0 }}
                                animate={{ x: pos.x, y: pos.y, opacity: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.6, type: "spring" }}
                              />
                            ))}
                          </>
                        );
                      })()}
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute z-20 left-0 right-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
          style={{ top: "8%", maxHeight: "45%" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="mb-5 pointer-events-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 10 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/25 px-4 py-1.5 text-sm font-medium text-primary" data-testid="badge-platform">
              <Building2 className="h-3.5 w-3.5" />
              Community-Owned Revitalization
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-tight mb-5 text-white drop-shadow-lg"
            style={{ letterSpacing: '-1.5px' }}
            data-testid="text-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Build Your Community,{" "}
            <span className="text-gradient-animated italic">One Token at a Time</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed drop-shadow-md font-light"
            style={{ lineHeight: '1.7' }}
            data-testid="text-hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Nominate distressed properties, invest in revitalization, vote on development
            plans, and watch your county transform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 pointer-events-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 10 }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>
        </motion.div>

        {properties.length === 0 && phase >= 4 && (
          <motion.div
            className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
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
          className="absolute z-20 bottom-0 left-0 right-0"
          ref={statsRef}
          style={{ background: 'linear-gradient(to top, rgba(26,26,24,0.85), rgba(26,26,24,0.6))' }}
          data-testid="stats-bar"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: phase >= 5 ? 1 : 0, y: phase >= 5 ? 0 : 40 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto px-5 md:px-10 py-5" style={{ maxWidth: '1100px' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center" data-testid="stat-properties">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-primary">{propCount}</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Active Properties</p>
              </div>
              <div className="text-center" data-testid="stat-funded">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4" style={{ color: '#2D6A4F' }} />
                  <span className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: '#2D6A4F' }}>{raisedCount}</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Total Raised</p>
              </div>
              <div className="text-center" data-testid="stat-investors">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-chart-2" />
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-chart-2">{membersCount}</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Community Members</p>
              </div>
              <div className="text-center" data-testid="stat-engagement">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-primary">{formattedMinInvest}</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Min. Investment</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
