import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";

const sections = [
  {
    title: "1. Data Collection",
    content: [
      {
        subtitle: "Personal Information We Collect",
        items: [
          "Name, email address, and contact information provided during account registration.",
          "County, state, and country of residence for offering eligibility and voting power calculations.",
          "KYC verification data including government-issued identification documents.",
          "Blockchain wallet addresses connected to your account.",
          "Investment history, token holdings, and transaction records.",
        ],
      },
      {
        subtitle: "Automatically Collected Information",
        items: [
          "IP address and approximate geographic location.",
          "Browser type, device information, and operating system.",
          "Usage patterns, page views, and interaction data on the platform.",
          "Session cookies and authentication tokens.",
        ],
      },
      {
        subtitle: "Third-Party Data",
        items: [
          "On-chain transaction data from the Base network (publicly available blockchain data).",
          "Payment processing information through Stripe (we do not store full payment card details).",
          "Identity verification results from KYC service providers.",
        ],
      },
    ],
  },
  {
    title: "2. CCPA Rights (California Residents)",
    content: [
      {
        subtitle: "Your Rights Under CCPA",
        items: [
          "Right to Know: You may request disclosure of the categories and specific pieces of personal information we have collected about you.",
          "Right to Delete: You may request deletion of your personal information, subject to certain exceptions required by law or legitimate business purposes.",
          "Right to Opt-Out: You may opt out of the sale of your personal information. Note: RevitaHub does not sell personal information to third parties.",
          "Right to Non-Discrimination: We will not discriminate against you for exercising your CCPA rights.",
        ],
      },
      {
        subtitle: "How to Exercise Your Rights",
        items: [
          "Submit a verifiable consumer request by emailing DEmery@buildourcommunity.co.",
          "We will respond to verifiable requests within 45 days.",
          "You may designate an authorized agent to submit requests on your behalf.",
        ],
      },
    ],
  },
  {
    title: "3. PII Handling & Security",
    content: [
      {
        subtitle: "How We Use Your Information",
        items: [
          "To provide and maintain the RevitaHub platform and its features.",
          "To process token purchases, transfers, and refund requests.",
          "To verify identity and comply with KYC/AML regulatory requirements.",
          "To determine offering phase eligibility based on geographic location.",
          "To calculate voting power multipliers for governance participation.",
          "To send transactional notifications about purchases, governance proposals, and phase changes.",
          "To improve platform functionality and user experience.",
        ],
      },
      {
        subtitle: "Security Measures",
        items: [
          "All data transmission is encrypted using TLS/SSL protocols.",
          "Sensitive data is encrypted at rest using industry-standard encryption.",
          "Access to personal information is restricted to authorized personnel on a need-to-know basis.",
          "Regular security assessments and vulnerability testing are conducted.",
          "Session management includes automatic timeout and secure cookie handling.",
          "Rate limiting is implemented on all API endpoints to prevent abuse.",
        ],
      },
      {
        subtitle: "Data Sharing",
        items: [
          "We do not sell your personal information to third parties.",
          "We may share data with service providers who assist in platform operations (payment processors, KYC providers, email services) under strict data processing agreements.",
          "We may disclose information when required by law, regulation, or legal process.",
          "Blockchain transaction data is inherently public and visible on the Base network.",
        ],
      },
    ],
  },
  {
    title: "4. Data Retention",
    content: [
      {
        subtitle: "Retention Periods",
        items: [
          "Account information: Retained for the duration of your account plus 7 years after closure for regulatory compliance.",
          "Transaction records: Retained permanently on-chain; off-chain records retained for 7 years per financial record-keeping requirements.",
          "KYC documentation: Retained for 5 years after the last transaction or account closure, whichever is later, per AML regulations.",
          "Session and usage data: Retained for 12 months from the date of collection.",
          "Communication records: Retained for 3 years from the date of the communication.",
        ],
      },
      {
        subtitle: "Data Deletion",
        items: [
          "You may request deletion of your account and associated personal data by contacting us.",
          "Certain data may be retained as required by law, regulatory obligations, or legitimate business purposes (e.g., tax reporting, fraud prevention).",
          "On-chain transaction data cannot be deleted due to the immutable nature of blockchain technology.",
          "We use soft deletion practices to ensure data integrity while honoring deletion requests.",
        ],
      },
    ],
  },
  {
    title: "5. Cookies & Tracking",
    content: [
      {
        subtitle: "Cookies We Use",
        items: [
          "Essential cookies: Required for authentication, session management, and platform security. These cannot be disabled.",
          "Functional cookies: Used to remember your preferences such as theme settings (light/dark mode).",
          "We do not use advertising or tracking cookies.",
        ],
      },
    ],
  },
  {
    title: "6. Children's Privacy",
    content: [
      {
        subtitle: "",
        items: [
          "RevitaHub is not intended for use by individuals under the age of 18.",
          "We do not knowingly collect personal information from minors.",
          "If we become aware that we have collected information from a minor, we will take steps to delete that information promptly.",
        ],
      },
    ],
  },
  {
    title: "7. Contact Information",
    content: [
      {
        subtitle: "",
        items: [
          "For privacy-related inquiries, contact us at: DEmery@buildourcommunity.co",
          "Build Our Community, LLC, Cherokee County, Georgia, USA",
          "We aim to respond to all privacy inquiries within 30 days.",
        ],
      },
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-privacy-title">
                Privacy Policy
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
                This Privacy Policy describes how Build Our Community, LLC ("we", "us", or "our") collects,
                uses, and protects your personal information when you use RevitaHub. We are committed to
                safeguarding your privacy and handling your data transparently and responsibly.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title} data-testid={`section-${section.title.split(".")[0].trim()}`}>
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                <div className="space-y-6">
                  {section.content.map((block, blockIdx) => (
                    <div key={blockIdx}>
                      {block.subtitle && (
                        <h3 className="text-sm font-medium mb-3 text-foreground/80">{block.subtitle}</h3>
                      )}
                      <ul className="space-y-3">
                        {block.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mt-2 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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
