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
        answer: "RevitaHub is a community-owned real estate revitalization platform that enables fractional ownership of properties through blockchain tokenization. We transform vacant lots, historic buildings, and underutilized properties into thriving community assets by allowing anyone to invest starting at just $12.50 per token.",
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
        answer: "The minimum investment is $12.50, which is the price of one token during Phase 1 (County). This intentionally low entry point is designed to enable participation from lower-income investors who are typically excluded from real estate opportunities.",
      },
      {
        question: "How does the 5-phase pricing work?",
        answer: "Token prices increase across phases to reward early local investors: Phase 1 (County): $12.50/token, 100 tokens/person limit. Phase 2 (State): $18.75/token, 150 tokens/person limit. Phase 3 (National): $28.13/token, 200 tokens/person limit. Phase 4 (International): $37.50/token, 250 tokens/person limit. Phase 5 (Private): Direct offerings for property owners.",
      },
      {
        question: "Why are token limits per person?",
        answer: "Per-person token limits prevent wealthy investors from buying up all available tokens, ensuring broader community participation. Limits increase in later phases to help reach 100% funding targets while still prioritizing local community members in early phases.",
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
        answer: "Token holders vote on property decisions through our DAO governance system. Each token gives you voting power, but the power is weighted by when you purchased: County Phase buyers get 1.5x voting power, State Phase 1.25x, National 1.0x, and International 0.75x. This ensures local community voices are prioritized.",
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
        question: "What if a property doesn't reach its funding goal?",
        answer: "If a property doesn't reach 100% funding within the 1-year deadline, all investors receive a full refund PLUS 3% APR interest on their investment. Funds are held in USDC escrow throughout the funding period, so your money is always protected.",
      },
      {
        question: "How does the 3% APR refund work?",
        answer: "From the moment you invest, your funds begin accruing 3% annual interest in the escrow. If funding fails, you receive: Original Investment + (Original Investment x 3% x Days Held / 365). For example, $100 invested for 180 days would return $101.48.",
      },
      {
        question: "Can I exit my investment early?",
        answer: "Yes, through share transfer. Even if funding isn't complete, you can transfer your tokens to another verified investor at 60%+ of your purchase price. Once trading is enabled after successful funding, you can sell on secondary markets at market price.",
      },
      {
        question: "What happens if the platform shuts down?",
        answer: "All property tokens and ownership records are stored on the blockchain, not on our servers. The smart contracts are designed to operate independently. Even if RevitaHub ceased operations, you would retain ownership and governance rights through direct blockchain interaction.",
      },
      {
        question: "Are my funds insured?",
        answer: "While not FDIC insured (as with traditional banks), funds are protected through: smart contract escrow with multi-signature security, Chainlink oracle verification of property values, legal property-holding LLC structures, and the 3% APR guaranteed return on failed funding.",
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
        question: "Can international investors participate?",
        answer: "Yes, international investors can participate in Phase 4 (International) of each offering. You must complete KYC verification and comply with your local securities regulations. Some countries may have restrictions - check with a local advisor.",
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
