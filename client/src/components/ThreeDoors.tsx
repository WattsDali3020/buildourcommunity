import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Users, HardHat, ArrowRight } from "lucide-react";
import { Link } from "wouter";

type Door = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Home;
  cta?: string;
  href?: string;
  iconBg: string;
  iconColor: string;
};

const doors: Door[] = [
  {
    id: "resident",
    title: "Resident",
    subtitle: "Have a real say in what gets built nearby",
    description: "Suggest the homes, shops and storefronts, and job sites your county needs, and weigh in on what goes first.",
    icon: Home,
    cta: "Suggest a Project",
    href: "/wishlist",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "neighbor",
    title: "Neighbor",
    subtitle: "Shape your community's future",
    description: "Point out the empty storefront, the lot that could hold homes, or the building that could bring jobs closer.",
    icon: Users,
    cta: "Suggest a Place",
    href: "/wishlist",
    iconBg: "bg-chart-3/10",
    iconColor: "text-chart-3",
  },
  {
    id: "professional",
    title: "Professional",
    subtitle: "Help build what neighbors choose",
    description: "Licensed contractors, realtors, and attorneys could join a verified network and be matched with the projects residents choose.",
    icon: HardHat,
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
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-3" data-testid="text-doors-eyebrow">Who It's For</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-3" style={{ letterSpacing: '-1px' }} data-testid="text-doors-title">
            How Will You Build?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto" style={{ lineHeight: '1.7' }}>
            RevitaHub is being designed with three kinds of community builders in mind.
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
                  {door.cta && door.href && (
                    <Link href={door.href}>
                      <span
                        className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline"
                        data-testid={`link-door-${door.id}`}
                      >
                        {door.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
