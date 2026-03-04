import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";

const sections = [
  {
    title: "1. Eligibility",
    content: [
      "You must be at least 18 years of age to use RevitaHub.",
      "You must complete KYC (Know Your Customer) verification before participating in any token offering or investment activity.",
      "Certain offerings may be restricted by geographic location in accordance with applicable securities laws. Phase-based eligibility (county, state, national, international) applies to token offerings.",
      "You are responsible for ensuring that your participation in any offering complies with the laws of your jurisdiction.",
      "Accredited investor status may be required for certain offering types, as determined by applicable regulations (e.g., SEC Regulation D).",
    ],
  },
  {
    title: "2. Investment Risks",
    content: [
      "All investments involve risk, including the potential loss of principal. Past performance does not guarantee future results.",
      "Token values may fluctuate and are not guaranteed to appreciate. The value of property-backed tokens depends on the underlying real estate asset performance.",
      "Real estate investments are inherently illiquid. While RevitaHub aims to provide transfer mechanisms, there is no guarantee of a secondary market for tokens.",
      "Properties may fail to reach their funding targets within the 365-day funding timeline, triggering refund processes with 3% APR interest.",
      "Development projects may face delays, cost overruns, regulatory obstacles, or other unforeseen challenges that could affect returns.",
      "RevitaHub is a technology platform and does not provide investment advice. You should consult with qualified financial and legal advisors before making investment decisions.",
    ],
  },
  {
    title: "3. Token Mechanics",
    content: [
      "Tokens are ERC-1155 digital assets deployed on the Base network (Coinbase L2) and represent fractional interests in property-specific Special Purpose Vehicles (SPVs).",
      "Token purchases are processed through a 4-phase community-first offering model with escalating pricing: County ($12.50 base), State (1.5x), National (2x), and International (2.5x).",
      "Voting power is proportional to token holdings, with a 1.5x multiplier for county residents of the property's jurisdiction.",
      "Transfer restrictions apply during active funding phases. Tokens may only be transferred after the funding phase concludes, subject to compliance checks.",
      "Smart contracts governing token mechanics have been developed with security best practices but have not yet undergone a formal third-party audit. Use at your own risk.",
      "Treasury disbursements are governed by a 2-of-3 multi-signature wallet with a 1% capped founder sustainability fee.",
    ],
  },
  {
    title: "4. Platform Disclaimers",
    content: [
      "RevitaHub is a technology platform operated by Build Our Community, LLC, a Georgia limited liability company. It is not a registered broker-dealer, investment advisor, or securities exchange.",
      "The platform is currently in alpha development. Features, functionality, and availability may change without notice.",
      "Build Our Community, LLC does not guarantee the accuracy, completeness, or timeliness of any information provided on the platform, including property valuations, projected returns, or community impact estimates.",
      "AI-generated insights, governance nudges, and impact simulations are provided for informational purposes only and should not be relied upon as the sole basis for investment decisions.",
      "The platform relies on third-party services including blockchain networks, oracle providers (Chainlink), and payment processors. Disruptions to these services may affect platform functionality.",
      "Nothing on this platform constitutes an offer to sell securities. All token offerings are subject to applicable regulatory requirements.",
    ],
  },
  {
    title: "5. Arbitration & Dispute Resolution",
    content: [
      "Any disputes arising from or related to your use of RevitaHub shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.",
      "Arbitration shall take place in Cherokee County, Georgia, unless otherwise agreed by the parties.",
      "You agree to waive any right to participate in a class action lawsuit or class-wide arbitration against Build Our Community, LLC.",
      "Notwithstanding the foregoing, either party may seek injunctive or equitable relief in a court of competent jurisdiction to prevent the actual or threatened infringement of intellectual property rights.",
      "These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, without regard to its conflict of law principles.",
    ],
  },
  {
    title: "6. User Obligations",
    content: [
      "You agree to provide accurate and complete information during registration and KYC verification.",
      "You are responsible for maintaining the security of your account credentials and wallet private keys.",
      "You agree not to use the platform for any unlawful purpose, including money laundering, fraud, or market manipulation.",
      "You agree not to attempt to circumvent geographic eligibility restrictions or phase-based access controls.",
      "You acknowledge that blockchain transactions are irreversible and that Build Our Community, LLC cannot reverse or modify completed on-chain transactions.",
    ],
  },
  {
    title: "7. Limitation of Liability",
    content: [
      "To the maximum extent permitted by law, Build Our Community, LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.",
      "Build Our Community, LLC's total liability shall not exceed the amount you have invested through the platform in the 12 months preceding the claim.",
      "Build Our Community, LLC is not responsible for losses arising from smart contract vulnerabilities, blockchain network failures, oracle data inaccuracies, or third-party service disruptions.",
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-terms-title">
                Terms of Service
              </h1>
            </div>

            <Badge variant="outline" className="mb-4" data-testid="badge-draft-notice">
              <AlertTriangle className="h-3 w-3 mr-1" />
              DRAFT — Pending legal counsel review
            </Badge>

            <p className="text-sm text-muted-foreground">
              Build Our Community, LLC | Cherokee County, Georgia
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: January 2026
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of RevitaHub, a blockchain-enabled
                real estate tokenization platform operated by Build Our Community, LLC ("we", "us", or "our").
                By accessing or using the platform, you agree to be bound by these Terms. If you do not agree,
                do not use the platform.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} data-testid={`section-${section.title.split(".")[0].trim()}`}>
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-lg border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              This document is a draft and is subject to change pending review by legal counsel.
              It does not constitute a binding legal agreement until finalized and published by Build Our Community, LLC.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
