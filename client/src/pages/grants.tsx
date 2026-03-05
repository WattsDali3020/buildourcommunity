import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  MapPin,
  FileText,
  Landmark,
  Home,
  Briefcase,
  Globe
} from "lucide-react";

const localGrants = [
  {
    name: "Community Development Block Grant (CDBG)",
    source: "HUD via Cherokee County",
    amount: "$500K - $1M annually",
    description: "For capital projects, public facilities, housing rehabilitation, and blight removal. Requires 70% low/moderate-income benefit.",
    deadline: "Applications open annually (varies)",
    eligibility: "Local governments, nonprofits",
    contact: "Cherokee CDBG office",
    icon: Building2,
  },
  {
    name: "Downtown Development Authority (DDA) Revolving Loan Fund",
    source: "Cherokee County DDA",
    amount: "Up to $500K low-interest loans",
    description: "For riverfront/downtown revitalization including mixed-use development and historic preservation.",
    deadline: "Ongoing",
    eligibility: "Developers, businesses in DDA district",
    contact: "Cherokee DDA",
    icon: Landmark,
  },
];

const stateGrants = [
  {
    name: "Community HOME Investment Program (CHIP)",
    source: "Georgia DCA",
    amount: "Up to $500K (rehab) / $1.5M (new construction)",
    description: "Rehabilitate owner-occupied homes or new/reconstructed single-family homes for sale. Total statewide pool up to $10M.",
    deadline: "January 31, 2026 (Emphasys portal)",
    eligibility: "Local governments, nonprofits, public authorities",
    icon: Home,
  },
  {
    name: "CDBG Annual Competition",
    source: "Georgia DCA",
    amount: "~$50M statewide pool",
    description: "For neighborhood revitalization, housing, economic development. 51-100% low/mod benefit required. Bonus points for GICH alumni.",
    deadline: "August 2026 (eCivis portal)",
    eligibility: "Local governments, nonprofits",
    icon: Building2,
  },
  {
    name: "Redevelopment Fund (RDF)",
    source: "Georgia DCA",
    amount: "Up to $500K per project",
    description: "Flexible grants/loans for commercial, downtown, and industrial revitalization. Slum/blight elimination focus.",
    deadline: "Ongoing",
    eligibility: "Public-private partnerships",
    icon: Briefcase,
  },
  {
    name: "Historic Preservation Fund Grants",
    source: "Georgia HPD",
    amount: "$120K+ awarded in 2025",
    description: "For surveys, planning, and rehabilitation of historic properties including vacant buildings.",
    deadline: "Typically fall/winter (2026 cycle TBD)",
    eligibility: "Property owners, nonprofits, local governments",
    icon: FileText,
  },
];

const federalGrants = [
  {
    name: "Rural Community Development Initiative (RCDI)",
    source: "USDA",
    amount: "Up to $250K",
    description: "For housing, facilities, and economic development in rural areas (<50K population). Parts of Cherokee County qualify.",
    deadline: "Summer 2026 (closed Aug 2025)",
    eligibility: "Nonprofits, local governments, tribes",
    icon: MapPin,
  },
  {
    name: "CDBG Section 108 Loan Guarantee",
    source: "HUD via Georgia DCA",
    amount: "Up to $5M+ guarantees",
    description: "For large-scale economic development and revitalization projects including vacant property initiatives.",
    deadline: "Ongoing",
    eligibility: "Local governments, developers",
    icon: DollarSign,
  },
  {
    name: "Community Project Funding (CPF)",
    source: "US Congress (via Reps)",
    amount: "$1-5M per project (varies)",
    description: "For blight removal, affordable housing, infrastructure. Request through congressional representatives.",
    deadline: "Spring 2026 (congressional deadlines)",
    eligibility: "Projects in representative's district",
    icon: Globe,
  },
];

type Grant = {
  name: string;
  source: string;
  amount: string;
  description: string;
  deadline: string;
  eligibility: string;
  contact?: string;
  icon: React.ElementType;
};

function GrantCard({ grant }: { grant: Grant }) {
  const Icon = grant.icon;
  return (
    <Card className="border-glow h-full" data-testid={`card-grant-${grant.name.toLowerCase().replace(/\s/g, "-")}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <Badge variant="outline" className="text-xs">
            {grant.amount}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3">{grant.name}</CardTitle>
        <CardDescription className="text-sm">{grant.source}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {grant.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Deadline:</span>
            <span>{grant.deadline}</span>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">Eligibility:</span>
            <span>{grant.eligibility}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Grants() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero glow-gold py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">
                <DollarSign className="h-3 w-3 mr-1" />
                Funding Opportunities
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="grants-title">
                Grants & Subsidies for Community Revitalization
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                RevitaHub projects may qualify for millions in federal, state, and local funding. 
                These grants support housing rehabilitation, blight removal, and community development.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 border-b">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="stat-card rounded-xl border bg-card p-5">
                <p className="text-3xl font-bold metric-value text-primary">$1-3M+</p>
                <p className="text-sm text-muted-foreground mt-1">Potential for Cherokee Projects</p>
              </div>
              <div className="stat-card rounded-xl border bg-card p-5">
                <p className="text-3xl font-bold metric-value text-primary">10+</p>
                <p className="text-sm text-muted-foreground mt-1">Active Grant Programs</p>
              </div>
              <div className="stat-card rounded-xl border bg-card p-5">
                <p className="text-3xl font-bold metric-value text-primary">GICH</p>
                <p className="text-sm text-muted-foreground mt-1">Cherokee County Participant</p>
              </div>
              <div className="stat-card rounded-xl border bg-card p-5">
                <p className="text-3xl font-bold metric-value text-primary">2026</p>
                <p className="text-sm text-muted-foreground mt-1">Multiple Cycles Open</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cherokee County Local Grants</h2>
                <p className="text-muted-foreground">Direct funding from county programs</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localGrants.map((grant) => (
                <GrantCard key={grant.name} grant={grant} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 section-alt">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Georgia State Programs</h2>
                <p className="text-muted-foreground">Georgia DCA and state agency funding</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stateGrants.map((grant) => (
                <GrantCard key={grant.name} grant={grant} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Federal Programs</h2>
                <p className="text-muted-foreground">HUD, USDA, and congressional funding</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {federalGrants.map((grant) => (
                <GrantCard key={grant.name} grant={grant} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 section-alt">
          <div className="mx-auto max-w-7xl px-4">
            <Card className="border-glow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Apply?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  RevitaHub can help connect community projects with eligible grant programs. 
                  Contact Cherokee County CDBG or Georgia DCA for pre-application guidance.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button variant="outline" asChild>
                    <a href="mailto:cdbg@cherokeega.com" data-testid="button-contact-cdbg">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Cherokee CDBG
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://www.dca.ga.gov" target="_blank" rel="noopener noreferrer" data-testid="button-visit-dca">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Georgia DCA
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
