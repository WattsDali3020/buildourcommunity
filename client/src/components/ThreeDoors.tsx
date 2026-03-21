import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, HardHat, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const doors = [
  {
    id: "investor",
    title: "Investor",
    subtitle: "Build wealth through community ownership",
    description: "Invest in tokenized properties starting at $12.50. Earn dividends, vote on development plans, and grow your portfolio as communities revitalize.",
    icon: TrendingUp,
    cta: "Browse Properties",
    href: "/properties",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "neighbor",
    title: "Neighbor",
    subtitle: "Shape your community's future",
    description: "Nominate distressed properties, vote on what gets built, and earn bonus tokens for active participation. Local voices get 1.5x voting power.",
    icon: Users,
    cta: "Nominate Property",
    href: "/wishlist",
    iconBg: "bg-chart-3/10",
    iconColor: "text-chart-3",
  },
  {
    id: "professional",
    title: "Professional",
    subtitle: "Win verified project contracts",
    description: "Licensed contractors, realtors, and attorneys join the verified network. Get matched with funded projects and build your reputation on-chain.",
    icon: HardHat,
    cta: "Join Pro Network",
    href: "/services",
    iconBg: "bg-chart-2/10",
    iconColor: "text-chart-2",
  },
];

export function ThreeDoors() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="py-20 md:py-24" data-testid="section-three-doors" style={{ background: 'hsl(var(--background))' }}>
      <div className="mx-auto px-5 md:px-10" style={{ maxWidth: '1100px' }}>
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-3" data-testid="text-doors-eyebrow">Choose Your Path</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-3" style={{ letterSpacing: '-1px' }} data-testid="text-doors-title">
            How Will You Build?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto" style={{ lineHeight: '1.7' }}>
            RevitaHub serves three kinds of community builders. Pick the path that fits you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]" style={{ background: 'hsl(var(--border))' }}>
          {doors.map((door) => {
            const isActive = active === door.id;
            return (
              <motion.div
                key={door.id}
                className={`cursor-pointer transition-colors duration-300 relative ${isActive ? 'bg-foreground' : 'bg-card hover:bg-accent'}`}
                style={{ padding: '48px 32px' }}
                onClick={() => setActive(isActive ? null : door.id)}
                data-testid={`card-door-${door.id}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${isActive ? 'bg-primary/20' : door.iconBg}`}>
                  <door.icon className={`h-6 w-6 ${isActive ? 'text-primary' : door.iconColor}`} />
                </div>

                <h3
                  className={`font-serif text-xl mb-2 transition-colors duration-300 ${isActive ? 'text-background' : 'text-foreground'}`}
                >
                  {door.title}
                </h3>

                <p className={`text-sm mb-4 transition-colors duration-300 ${isActive ? 'text-background/60' : 'text-muted-foreground'}`}>
                  {door.subtitle}
                </p>

                <motion.div
                  initial={false}
                  animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className={`text-sm mb-5 leading-relaxed ${isActive ? 'text-background/50' : 'text-muted-foreground'}`} style={{ lineHeight: '1.7' }}>
                    {door.description}
                  </p>
                  <Link href={door.href}>
                    <span
                      className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline"
                      data-testid={`link-door-${door.id}`}
                    >
                      {door.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
