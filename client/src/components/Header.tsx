import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Building2, Menu, X, Wallet, Plus } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/submit", label: "Submit Property" },
  { href: "/governance", label: "Governance" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    setWalletConnected(!walletConnected);
    console.log(walletConnected ? "Wallet disconnected" : "Wallet connected");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">RevitaHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant={walletConnected ? "outline" : "default"}
              size="sm"
              onClick={handleConnectWallet}
              className="hidden sm:flex items-center gap-2"
              data-testid="button-connect-wallet"
            >
              <Wallet className="h-4 w-4" />
              {walletConnected ? "0x1234...5678" : "Connect Wallet"}
            </Button>
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
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <Button
                variant={walletConnected ? "outline" : "default"}
                onClick={handleConnectWallet}
                className="w-full justify-start gap-2"
                data-testid="button-mobile-connect-wallet"
              >
                <Wallet className="h-4 w-4" />
                {walletConnected ? "0x1234...5678" : "Connect Wallet"}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
