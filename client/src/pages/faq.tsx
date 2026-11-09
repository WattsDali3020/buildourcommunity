import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  HelpCircle,
  DollarSign,
  Vote,
  Shield,
  Building2,
  Wallet,
  FileText,
  Scale,
  RefreshCw,
  Users,
  ArrowRight,
  Mail,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: "Getting Started",
    icon: <Building2 className="h-5 w-5" />,
    items: [
      {
        question: "What is RevitaHub?",
        answer: "RevitaHub is a community-owned real estate revitalization platform. Residents nominate local projects, and verified residents of the project's county get the first 90 days of access to the full token supply. The initial token price is a configurable parameter.",
      },
      {
        question: "How do I get started as an investor?",
        answer: "To get started: 1) Connect your wallet (MetaMask, Coinbase Wallet, etc.) using the 'Connect Wallet' button, 2) Complete KYC verification to confirm your identity, 3) Browse available properties and select one you'd like to invest in, 4) Purchase tokens during the appropriate offering phase based on your location. That's it - you're now a fractional property owner!",
      },
      {
        question: "What types of properties can I invest in?",
        answer: "RevitaHub accepts any property type that can benefit from community revitalization, including: vacant land, historic buildings, commercial properties, residential properties, and mixed-use developments. Each property goes through a nomination and approval process before being listed for investment.",
      },
      {
        question: "Do I need cryptocurrency experience?",
        answer: "No! While RevitaHub uses blockchain technology, we've designed the platform to be accessible to everyone. You can pay with credit/debit card via Stripe or with cryptocurrency. Your tokens are stored securely, and you can participate in governance voting through our simple web interface.",
      },
    ],
  },
  {
    title: "Investment & Pricing",
    icon: <DollarSign className="h-5 w-5" />,
    items: [
      {
        question: "What is the minimum investment?",
        answer: "There is one initial price for every access stage. It is a parameter, not a county-only discount and not a later-stage markup. The per-person allowance is also a parameter and has not been chosen yet.",
      },
      {
        question: "How does staged access work?",
        answer: "There are no reserved supply buckets and no price ladder. Days 0–90 are open to verified residents of the project's county. Days 91–180 open to the rest of that state. After day 180, remaining unsold tokens are open nationwide. Each later stage sells only what is still unsold. The initial price is a configurable parameter.",
      },
      {
        question: "Why is there a per-person allowance?",
        answer: "Within a stage, every eligible person gets the same purchase allowance. The number has not been chosen yet, so it stays a configurable parameter rather than a fixed cap that grows by stage.",
      },
      {
        question: "How are returns generated?",
        answer: "Returns come from two sources: 1) Quarterly dividend distributions from rental income and property operations (historically averaging 8.2% annually), and 2) Property appreciation when the asset is sold. All distributions are made in USDC stablecoin directly to your connected wallet.",
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept: Credit/debit cards via Stripe (Visa, Mastercard, American Express), USDC cryptocurrency, and other major cryptocurrencies through our wallet integration. All payments are converted to USDC for the escrow.",
      },
    ],
  },
  {
    title: "Voting & Governance",
    icon: <Vote className="h-5 w-5" />,
    items: [
      {
        question: "How does voting work?",
        answer: "Vote weight follows verified residency, not the stage you bought in. Verified county residents have 1.5 per token, other in-state holders have 1.0, and other US holders have 0.75. Holders outside the county still vote. There is no cap on outside votes and no guaranteed resident majority.",
      },
      {
        question: "What decisions can I vote on?",
        answer: "Token holders vote on: property development plans (housing vs. commercial vs. green space), contractor selection, community benefit allocations, dividend distribution percentages, property sale decisions, and major operational changes. All votes are recorded on-chain for transparency.",
      },
      {
        question: "How long do voting periods last?",
        answer: "Standard proposals have a 7-day voting period. Emergency proposals may have shorter windows. You'll receive email notifications when new proposals are created and reminders before voting ends.",
      },
      {
        question: "Can I create proposals?",
        answer: "Yes! Any token holder can create proposals for their properties. Proposals require a description of the change, expected costs/benefits, and an implementation timeline. Other token holders then vote to approve or reject.",
      },
      {
        question: "What happens if I don't vote?",
        answer: "Your tokens still count toward quorum requirements, but abstaining means your voice isn't heard on that decision. We encourage active participation - it's your property and your community!",
      },
    ],
  },
  {
    title: "Investor Protection",
    icon: <Shield className="h-5 w-5" />,
    items: [
      {
        question: "What if a project is not completed in the funding period?",
        answer: "That is not decided. The common clock is 365 days and shares stay locked through it. Refunds, early completion, and what happens after day 365 are open questions for the owner.",
      },
      {
        question: "Is there a refund rate?",
        answer: "No rate is confirmed. Older escrow code still contains a calculation, but it is not a promise and this release does not turn it into policy.",
      },
      {
        question: "Can I exit my investment early?",
        answer: "Not under a decided rule. Shares stay locked through the common 365-day funding period. Transfer exceptions and post-period liquidity are not decided.",
      },
      {
        question: "What happens if the platform shuts down?",
        answer: "All property tokens and ownership records are stored on the blockchain, not on our servers. The smart contracts are designed to operate independently. Even if RevitaHub ceased operations, you would retain ownership and governance rights through direct blockchain interaction.",
      },
      {
        question: "Are my funds insured?",
        answer: "There is no confirmed refund or return. Legal structure, escrow treatment, and what happens if a project is not completed are still open.",
      },
    ],
  },
  {
    title: "Legal & Compliance",
    icon: <Scale className="h-5 w-5" />,
    items: [
      {
        question: "Is this legal?",
        answer: "Yes. RevitaHub operates under SEC regulations for security token offerings, specifically Regulation D (506c) and Regulation Crowdfunding (Reg CF). All investors must complete KYC/AML verification, and tokens include transfer restrictions to maintain compliance.",
      },
      {
        question: "Why do I need to verify my identity (KYC)?",
        answer: "KYC (Know Your Customer) verification is required by securities law to prevent fraud and money laundering. We collect basic information (name, address, ID) to verify you're a real person and eligible to invest based on your location.",
      },
      {
        question: "Are the tokens securities?",
        answer: "Yes, property tokens are classified as securities under US law because they represent ownership in a real asset with expected profits. This is why we implement transfer restrictions and require investor verification.",
      },
      {
        question: "What tax documentation will I receive?",
        answer: "You'll receive: 1099-DIV forms for dividend distributions, K-1 forms for property income pass-through, and transaction records for any token sales. We recommend consulting a tax professional for your specific situation.",
      },
      {
        question: "Can people outside the United States buy tokens?",
        answer: "Sale stages stop at nationwide access after day 180. There is no international sale stage. Someone who already holds tokens and is outside the county still votes; residency for the 1.5 weight has to be verified.",
      },
    ],
  },
  {
    title: "Technical Questions",
    icon: <Wallet className="h-5 w-5" />,
    items: [
      {
        question: "Which blockchain does RevitaHub use?",
        answer: "RevitaHub is deployed on Base, an Ethereum Layer 2 network backed by Coinbase. This provides low transaction costs, fast confirmations, and strong security while maintaining compatibility with Ethereum wallets and tools.",
      },
      {
        question: "What wallets are supported?",
        answer: "We support all major Ethereum-compatible wallets including: MetaMask, Coinbase Wallet, WalletConnect-compatible wallets, Rainbow Wallet, and hardware wallets like Ledger and Trezor.",
      },
      {
        question: "How does Chainlink integration work?",
        answer: "Chainlink provides critical infrastructure: Price Feeds for property valuations, Proof of Reserve for asset verification, Automation for dividend distributions, and CCIP for cross-chain functionality. This creates a trustless bridge between real-world assets and blockchain tokens.",
      },
      {
        question: "What happens if I lose access to my wallet?",
        answer: "Your tokens are tied to your wallet address on the blockchain. If you lose access, you should use your wallet's recovery phrase. We cannot recover tokens for you, but you can contact support to update your KYC information if you create a new wallet.",
      },
      {
        question: "Are the smart contracts audited?",
        answer: "Yes, all RevitaHub smart contracts undergo security audits by reputable third-party firms before deployment. Audit reports are publicly available in our documentation.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4" data-testid="faq-title">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about investing in community real estate through RevitaHub.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex flex-wrap gap-2 mb-8">
            {faqCategories.map((category) => (
              <a
                key={category.title}
                href={`#${category.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex"
                data-testid={`link-faq-category-${category.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Badge variant="outline" className="hover-elevate cursor-pointer">
                  {category.icon}
                  <span className="ml-2">{category.title}</span>
                </Badge>
              </a>
            ))}
          </div>

          {faqCategories.map((category) => (
            <div
              key={category.title}
              id={category.title.toLowerCase().replace(/\s+/g, "-")}
              className="mb-12 scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-semibold">{category.title}</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`${category.title}-${idx}`}
                    data-testid={`faq-item-${category.title.toLowerCase().replace(/\s+/g, "-")}-${idx}`}
                  >
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Still Have Questions?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Can't find the answer you're looking for? Our team is here to help.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild data-testid="button-faq-contact-support">
                  <a href="mailto:DEmery@buildourcommunity.co" data-testid="link-faq-email-support">
                    Contact Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Link href="/litepaper">
                  <Button variant="outline" data-testid="button-faq-read-litepaper">
                    <FileText className="mr-2 h-4 w-4" />
                    Read the Litepaper
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
