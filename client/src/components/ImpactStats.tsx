import { Building2, Users, Leaf, DollarSign, MapPin, Home } from "lucide-react";

// todo: remove mock functionality
const stats = [
  { icon: Building2, value: "24", label: "Active Projects", suffix: "" },
  { icon: MapPin, value: "18", label: "States Represented", suffix: "" },
  { icon: Users, value: "450+", label: "Jobs Created", suffix: "" },
  { icon: Home, value: "120", label: "Housing Units", suffix: "" },
  { icon: DollarSign, value: "2.4M", label: "Community Dividends", suffix: "" },
  { icon: Leaf, value: "85%", label: "Green Building Certified", suffix: "" },
];

export function ImpactStats() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">Community Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real results from real investments. See how tokenized ownership is 
            transforming communities across America.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-md bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold mb-1" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
