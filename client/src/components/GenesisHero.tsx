import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, MapPin, Building2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { Property as DBProperty } from "@shared/schema";
import { OSM_TILE_URL, OSM_ATTRIBUTION, CHEROKEE_CENTER, CHEROKEE_ZOOM } from "@/lib/mapTiles";

const GA_COUNTIES_TOPOJSON_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/us-states/GA-13-georgia-counties.json";

type PropertyWithCoordinates = DBProperty & {
  latitude?: string | number | null;
  longitude?: string | number | null;
};

const GA_CITY_COORDS: Record<string, [number, number]> = {
  Canton: [34.2368, -84.4908],
  Atlanta: [33.749, -84.388],
  Woodstock: [34.1015, -84.5194],
  "Holly Springs": [34.1743, -84.5027],
  "Ball Ground": [34.3387, -84.3752],
  Waleska: [34.3165, -84.553],
  Jasper: [34.4676, -84.4291],
};

function createMarkerIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:#C9963A;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#C9963A"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function GenesisHero() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [phase, setPhase] = useState(0);

  const { data: properties = [] } = useQuery<DBProperty[]>({
    queryKey: ["/api/properties"],
  });

  useEffect(() => {
    const timers = [400, 1200, 2000, 2800, 3400].map((ms, i) =>
      setTimeout(() => setPhase(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: CHEROKEE_CENTER,
      zoom: CHEROKEE_ZOOM,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer(OSM_TILE_URL, {
      maxZoom: 19,
      attribution: OSM_ATTRIBUTION,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstanceRef.current = map;

    fetch(GA_COUNTIES_TOPOJSON_URL)
      .then((res) => res.json())
      .then((topoData) => {
        if (!mapInstanceRef.current || !topoData.objects) return;
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
      let lat = CHEROKEE_CENTER[0];
      let lng = CHEROKEE_CENTER[1];
      const propertyWithCoordinates = prop as PropertyWithCoordinates;
      const parsedLat = parseFloat(String(propertyWithCoordinates.latitude ?? ""));
      const parsedLng = parseFloat(String(propertyWithCoordinates.longitude ?? ""));
      if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
        lat = parsedLat;
        lng = parsedLng;
      } else if (prop.city && GA_CITY_COORDS[prop.city]) {
        [lat, lng] = GA_CITY_COORDS[prop.city];
      }
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        L.marker([lat, lng], { icon: createMarkerIcon() })
          .addTo(mapInstanceRef.current)
          .bindPopup(
            `<div style="min-width:220px;padding:4px 0;"><div style="font-weight:600;margin-bottom:4px;">${prop.name}</div><div style="font-size:12px;color:#94a3b8;">${prop.city}, ${prop.state}</div></div>`,
            { className: "leaflet-dark-popup" },
          );
      }, i * 150);
    });
  }, [properties, phase]);

  return (
    <>
      <style>{`
        .leaflet-dark-popup .leaflet-popup-content-wrapper { background:#1A1A18; color:#e2e8f0; border-radius:12px; }
        .custom-marker { background:transparent !important; border:none !important; }
      `}</style>
      <section data-testid="hero-section" className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "700px" }}>
        <motion.div className="absolute inset-0 z-0" style={{ background: "#0a0a08" }} animate={{ opacity: phase >= 3 ? 0 : 1 }} transition={{ duration: 1.2 }} />
        <motion.div ref={mapRef} className="absolute inset-0 w-full h-full z-0" data-testid="hero-map" initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 1.5 }} />
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(10,10,8,0.6) 0%, rgba(10,10,8,0.3) 40%, transparent 60%)" }} />

        <motion.div className="absolute z-20 left-0 right-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none" style={{ top: "8%" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 30 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/25 px-4 py-1.5 text-sm font-medium text-primary mb-5 pointer-events-auto">
            <Building2 className="h-3.5 w-3.5" />
            Cherokee County · design preview
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-tight mb-5 text-white drop-shadow-lg" data-testid="text-hero-title">
            Homes, Shops and Jobs,{" "}
            <span className="text-gradient-animated italic">Chosen Closer to Home</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-6 font-light" data-testid="text-hero-subtitle">
            Housing people can afford, storefronts that serve the street, and work close to where people live. An early look at how residents could suggest and weigh in on what gets built nearby.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <Button size="lg" asChild className="min-w-[200px]" data-testid="button-how-it-works">
              <a href="#how-it-works">See How It Could Work<ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[200px] border-white/20 text-white hover:bg-white/10" data-testid="button-nominate">
              <Link href="/wishlist"><MapPin className="mr-2 h-4 w-4" />Suggest a Project</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
