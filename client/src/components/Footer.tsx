import { Link } from "wouter";
import { Building2 } from "lucide-react";
import { SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";

// Homepage-rewrite footer: only links to About, Privacy, Terms and Community.
const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/community#wishlist", label: "Community" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto px-5 md:px-10 py-12" style={{ maxWidth: '1100px' }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="link-footer-home">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-serif text-xl">RevitaHub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A Build Our Community, LLC project. An early design for residents to choose, and help fund, the homes, shops, and jobs their county needs.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild data-testid="link-social-twitter">
                <a href="https://x.com/RevitaHub" target="_blank" rel="noopener noreferrer">
                  <SiX className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`link-footer-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t mt-8 pt-8">
          <p className="text-sm text-muted-foreground text-center mb-4">
            2026 Build Our Community, LLC (Cherokee County, Georgia). All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70 text-center max-w-3xl mx-auto">
            RevitaHub is operated by Build Our Community, LLC (Georgia).
            Educational. Proposed design, not live, not an offer.
          </p>
        </div>
      </div>
    </footer>
  );
}
