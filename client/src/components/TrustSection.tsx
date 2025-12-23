import { Shield, Award, Building2, FileCheck } from "lucide-react";

const trustIndicators = [
  {
    icon: Shield,
    title: "SEC Compliant",
    description: "Registered offering with investor protections",
  },
  {
    icon: Award,
    title: "Audited Smart Contracts",
    description: "Security verified by leading blockchain auditors",
  },
  {
    icon: Building2,
    title: "Real Property Ownership",
    description: "Tokens backed by verified real estate assets",
  },
  {
    icon: FileCheck,
    title: "3% APR Protection",
    description: "Refund guarantee if funding goals aren't met",
  },
];

const partners = [
  "Base",
  "Coinbase",
  "Stripe",
  "ChainLink",
];

export function TrustSection() {
  return (
    <section className="py-12 lg:py-16 border-b">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Trusted by investors across America
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {partners.map((partner) => (
              <div
                key={partner}
                className="text-lg font-semibold text-muted-foreground/60"
                data-testid={`partner-${partner.toLowerCase()}`}
              >
                {partner}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustIndicators.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
