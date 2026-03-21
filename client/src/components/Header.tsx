import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { WalletButton } from "./WalletButton";
import { Building2, Menu, X, Brain, FileText, BarChart3, Briefcase } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { User } from "@shared/schema";

const PROFESSIONAL_ROLES = ["contractor", "realtor", "attorney", "engineer", "architect", "lender", "inspector", "appraiser"];

const basePublicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/community", label: "Community" },
  { href: "/participate", label: "Participate" },
  { href: "/learn", label: "Learn" },
];

const investNavLink = { href: "/invest", label: "Invest" };

const authenticatedNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/founder", label: "Founder" },
  { href: "/treasury", label: "Treasury", icon: BarChart3 },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/business", label: "Business", icon: FileText },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected } = useAccount();

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
  });

  const isProfessional = user?.role && PROFESSIONAL_ROLES.includes(user.role);

  const publicNavLinks = isConnected
    ? [
        basePublicNavLinks[0],
        basePublicNavLinks[1],
        investNavLink,
        ...basePublicNavLinks.slice(2),
      ]
    : basePublicNavLinks;

  const filteredAuthLinks = isConnected
    ? authenticatedNavLinks.filter(l => l.href !== "/dashboard")
    : authenticatedNavLinks;

  const allLinks = user
    ? [
        ...publicNavLinks,
        ...filteredAuthLinks,
        ...(isProfessional ? [{ href: "/dashboard/professional", label: "Pro Dashboard", icon: Briefcase }] : []),
      ]
    : publicNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ borderBottom: '1px solid hsl(38 55% 51% / 0.15)' }}>
      <div className="mx-auto px-5 md:px-10" style={{ maxWidth: '1100px' }}>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="font-serif text-xl tracking-tight">RevitaHub</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {allLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="text-[13px] font-medium tracking-[0.3px]"
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:block">
              <WalletButton />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {allLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start text-[13px] font-medium tracking-[0.3px]"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="pt-2">
                <WalletButton />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
