import { Building2, Users, Leaf, DollarSign, MapPin, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Property as DBProperty } from "@shared/schema";

export function ImpactStats() {
  const { data: properties = [] } = useQuery<DBProperty[]>({
    queryKey: ["/api/properties"],
  });

  const totalJobs = properties.reduce((sum, p) => sum + (p.projectedJobs || 0), 0);
  const totalHousing = properties.reduce((sum, p) => sum + (p.projectedHousingUnits || 0), 0);
  const uniqueStates = new Set(properties.map(p => p.state)).size;

  const stats = [
    { icon: Building2, value: properties.length.toString(), label: "Active Projects" },
    { icon: MapPin, value: uniqueStates.toString(), label: "States Represented" },
    { icon: Users, value: totalJobs > 0 ? `${totalJobs}+` : "0", label: "Jobs Projected" },
    { icon: Home, value: totalHousing.toString(), label: "Housing Units" },
    { icon: DollarSign, value: "$0", label: "Community Dividends" },
    { icon: Leaf, value: "—", label: "Green Building Certified" },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">Community Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track real results from real investments as tokenized ownership transforms communities.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-md bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold mb-1" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
