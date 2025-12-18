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
  ],
  resources: [
    { href: "/learn", label: "Learn" },
    { href: "/learn#tokenization", label: "Tokenization Guide" },
    { href: "/learn#compliance", label: "Legal Compliance" },
    { href: "/learn#states", label: "State Regulations" },
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
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="link-footer-home">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold">RevitaHub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Transforming vacant properties into thriving community assets through blockchain-enabled fractional ownership on Base.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="link-social-twitter">
                <SiX className="h-5 w-5" />
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

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            2024 RevitaHub. Built on Base.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
