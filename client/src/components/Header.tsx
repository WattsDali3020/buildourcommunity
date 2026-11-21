import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Building2, Menu, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const HOW_IT_WORKS_HASH = "#how-it-works";

function subscribeToHash(onStoreChange: () => void) {
  const events = ["hashchange", "popstate", "pushState", "replaceState"] as const;
  for (const eventName of events) window.addEventListener(eventName, onStoreChange);
  return () => {
    for (const eventName of events) window.removeEventListener(eventName, onStoreChange);
  };
}

function navIsActive(href: string, path: string, hash: string) {
  if (href === `/${HOW_IT_WORKS_HASH}`) return path === "/" && hash === HOW_IT_WORKS_HASH;
  if (href === "/") return path === "/" && hash !== HOW_IT_WORKS_HASH;
  return path === href;
}

// Homepage-rewrite nav: only routes without offer copy. Explore points at
// how it could work. Nominate, Learn, Dashboard and the wallet button are
// hidden until their pages are cleaned in a separately approved change.
const allLinks = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "Explore" },
];

export function Header() {
  const [location] = useLocation();
  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                  variant={navIsActive(link.href, location, hash) ? "secondary" : "ghost"}
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
                    variant={navIsActive(link.href, location, hash) ? "secondary" : "ghost"}
                    className="w-full justify-start text-[13px] font-medium tracking-[0.3px]"
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
