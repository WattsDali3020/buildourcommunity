import { Link } from "wouter";
import { Building2 } from "lucide-react";
import { SiDiscord, SiX, SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";

const footerLinks = {
  platform: [
    { href: "/properties", label: "Browse Properties" },
    { href: "/governance", label: "Governance" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/submit", label: "Submit Project" },
    { href: "/services", label: "Services" },
    { href: "/league", label: "RevitaLeague" },
  ],
  resources: [
    { href: "/litepaper", label: "Litepaper" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/impact", label: "Impact Simulator" },
    { href: "/grants", label: "Grants & Funding" },
    { href: "/faq", label: "FAQ" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/about#team", label: "Team" },
    { href: "/about#contact", label: "Contact" },
    { href: "/about#careers", label: "Careers" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto px-5 md:px-10 py-12" style={{ maxWidth: '1100px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="link-footer-home">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-serif text-xl">RevitaHub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              A Build Our Community, LLC project. Transforming vacant properties into thriving community assets through blockchain-enabled fractional ownership.
            </p>
            <a 
              href="https://buildourcommunity.co" 
              className="text-sm text-primary hover:underline mb-4 inline-block"
              data-testid="link-footer-website"
            >
              buildourcommunity.co
            </a>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild data-testid="link-social-twitter">
                <a href="https://x.com/RevitaHub" target="_blank" rel="noopener noreferrer">
                  <SiX className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-social-discord">
                <SiDiscord className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-social-github">
                <SiGithub className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
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

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
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

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
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
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <p className="text-sm text-muted-foreground">
              2026 Build Our Community, LLC (Georgia, USA). All rights reserved.
            </p>
            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
                Terms of Service
              </Link>
              <Link href="/risk-disclosure" className="hover:text-foreground transition-colors" data-testid="link-risk-disclosure">
                Risk Disclosure
              </Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 text-center max-w-3xl mx-auto">
            RevitaHub is a technology platform operated by Build Our Community, LLC (Georgia). Each property is held in a separate Special Purpose Vehicle (SPV). Tokens represent interests in property SPVs. All economics enforced by smart contracts — Treasury 1% founder cut is immutable and on-chain. This is not an offer to sell securities. Platform functionality is in development.
          </p>
        </div>
      </div>
    </footer>
  );
}
