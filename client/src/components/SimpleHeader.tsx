import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Building2, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Explore" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/litepaper", label: "Learn" },
];

export function SimpleHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 nav-floating">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold tracking-tight">RevitaHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {publicNavLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm" data-testid="button-dashboard">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" data-testid="button-get-started">
                <Link href="/dashboard">
                  <LogIn className="mr-2 h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {publicNavLinks.map((link) => (
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
