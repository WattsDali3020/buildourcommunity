import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertTriangle,
  TrendingDown,
  Droplets,
  Scale,
  Code,
  HardHat,
  Users,
  User,
  Cpu,
  CheckCircle2,
  Shield,
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

const riskCategories = [
  {
    title: "Market Risk",
    icon: TrendingDown,
    description:
      "Real estate markets are subject to cyclical fluctuations. Property values may decline due to economic downturns, changes in local market conditions, oversupply, reduced demand, or shifts in demographic patterns. Token values are directly tied to underlying property performance and may not reflect broader market trends.",
  },
  {
    title: "Liquidity Risk",
    icon: Droplets,
    description:
      "Property-backed tokens may have limited secondary market liquidity. You may not be able to sell or transfer your tokens when desired, or may only be able to do so at a significant discount. Transfer restrictions apply during active funding phases, and there is no guarantee that a liquid market will develop for any token offering.",
  },
  {
    title: "Regulatory Risk",
    icon: Scale,
    description:
      "The regulatory landscape for tokenized securities and blockchain-based real estate is evolving. Changes in federal, state, or local laws — including SEC regulations, state blue sky laws, and tax treatment — could adversely affect the platform, token values, or your ability to participate. Offerings may be restricted or prohibited in certain jurisdictions.",
  },
  {
    title: "Smart Contract Risk",
    icon: Code,
    description:
      "Smart contracts deployed on the Base network are immutable once deployed and may contain undiscovered vulnerabilities. While contracts are developed following security best practices, they have not yet undergone a formal third-party audit. Bugs, exploits, or unforeseen interactions could result in loss of funds or tokens. Blockchain transactions are irreversible.",
  },
  {
    title: "Development Risk",
    icon: HardHat,
    description:
      "Property revitalization projects involve construction, permitting, and development activities that are subject to delays, cost overruns, contractor disputes, environmental issues, zoning challenges, and other unforeseen complications. Projects may fail to meet projected timelines, budgets, or return expectations.",
  },
  {
    title: "Counterparty Risk",
    icon: Users,
    description:
      "The platform relies on various third parties including property SPV managers, construction contractors, property managers, oracle providers (Chainlink), payment processors (Stripe), and blockchain network operators (Base/Coinbase). Failure or default by any counterparty could adversely affect your investment or platform functionality.",
  },
  {
    title: "Solo Founder Risk",
    icon: User,
    description:
      "RevitaHub is currently a solo-founder project operated by Build Our Community, LLC. This creates key-person risk — if the founder is unable to continue operations, the platform's development and management could be disrupted. While the 2-of-3 multi-sig treasury and on-chain governance provide some continuity, operational risk remains elevated compared to larger organizations.",
  },
  {
    title: "Technology Risk",
    icon: Cpu,
    description:
      "The platform depends on blockchain infrastructure (Base L2), oracle services (Chainlink), and web technologies that may experience outages, upgrades, or security incidents. Network congestion, gas fee spikes, bridge failures, or protocol-level changes could affect transaction processing, token functionality, or data availability.",
  },
];

export default function RiskDisclosure() {
  const [acknowledged, setAcknowledged] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const alreadyAcknowledged = !!user?.riskDisclosureAcknowledgedAt;

  const acknowledgeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/acknowledge-risks");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Risk Disclosure Acknowledged",
        description: "Your acknowledgment has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record acknowledgment. Please ensure you are logged in.",
        variant: "destructive",
      });
    },
  });

  const handleAcknowledge = () => {
    if (acknowledged) {
      acknowledgeMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-risk-disclosure-title">
                Risk Disclosure
              </h1>
            </div>

            <Badge variant="outline" className="mb-4" data-testid="badge-draft-notice">
              <AlertTriangle className="h-3 w-3 mr-1" />
              DRAFT — Pending legal counsel review
            </Badge>

            <p className="text-sm text-muted-foreground">
              Build Our Community, LLC | Cherokee County, Georgia
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Investing in tokenized real estate through RevitaHub involves significant risks.
                You should carefully consider the following risk factors before making any investment decision.
                This is not an exhaustive list of all risks. You should consult with qualified financial,
                legal, and tax advisors before investing.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {riskCategories.map((risk) => {
              const Icon = risk.icon;
              return (
                <Card key={risk.title} data-testid={`card-risk-${risk.title.toLowerCase().replace(/\s/g, "-")}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{risk.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {risk.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
            {alreadyAcknowledged ? (
              <div className="flex items-center gap-3" data-testid="text-already-acknowledged">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Risk Disclosure Acknowledged</p>
                  <p className="text-sm text-muted-foreground">
                    You acknowledged the risk disclosure on{" "}
                    {new Date(user!.riskDisclosureAcknowledgedAt!).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    .
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-6">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Investor Acknowledgment Required</p>
                    <p className="text-sm text-muted-foreground">
                      Before participating in any token offering, you must acknowledge that you have read
                      and understood the risk factors described above.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-6">
                  <Checkbox
                    id="acknowledge-risks"
                    checked={acknowledged}
                    onCheckedChange={(checked) => setAcknowledged(checked === true)}
                    data-testid="checkbox-acknowledge-risks"
                  />
                  <label htmlFor="acknowledge-risks" className="text-sm leading-relaxed cursor-pointer">
                    I confirm that I have read and understood all risk factors described in this Risk Disclosure.
                    I understand that investing in tokenized real estate involves significant risks, including the
                    potential loss of my entire investment. I acknowledge that RevitaHub does not provide investment
                    advice and that I should consult with qualified professionals before investing.
                  </label>
                </div>

                <Button
                  onClick={handleAcknowledge}
                  disabled={!acknowledged || acknowledgeMutation.isPending || !user}
                  data-testid="button-acknowledge-risks"
                >
                  {acknowledgeMutation.isPending ? "Recording..." : "I Acknowledge the Risks"}
                </Button>

                {!user && (
                  <p className="text-xs text-muted-foreground mt-3">
                    You must be logged in to record your acknowledgment.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="mt-8 p-4 rounded-lg border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              This document is a draft and is subject to change pending review by legal counsel.
              Risk factors may be updated as the platform evolves. You will be notified of material changes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
