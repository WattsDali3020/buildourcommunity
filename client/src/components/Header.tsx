import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { WalletButton } from "./WalletButton";
import { Building2, Menu, X, Brain, FileText, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Explore" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/impact", label: "Impact" },
  { href: "/litepaper", label: "Learn" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/services", label: "Services" },
];

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
  
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
  });

  const allLinks = user 
    ? [...publicNavLinks, ...authenticatedNavLinks]
    : publicNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">RevitaHub</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {allLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
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
                    className="w-full justify-start"
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
