import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LearnCard, type LearnArticle } from "@/components/LearnCard";
import { StateComplianceTable } from "@/components/StateComplianceTable";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Coins, Scale, Building2, Vote, Shield, BookOpen } from "lucide-react";
import { useState } from "react";

const learnArticles: LearnArticle[] = [
  {
    id: "what-is-tokenization",
    title: "What is Real Estate Tokenization?",
    description: "Learn how blockchain technology enables fractional ownership of real-world properties and why it matters for community development.",
    category: "Basics",
    readTime: 8,
    difficulty: "beginner",
    icon: Coins,
  },
  {
    id: "how-to-invest",
    title: "How to Make Your First Investment",
    description: "Step-by-step guide to connecting your wallet, browsing properties, and purchasing your first community tokens.",
    category: "Getting Started",
    readTime: 12,
    difficulty: "beginner",
    icon: Building2,
  },
  {
    id: "understanding-governance",
    title: "Understanding DAO Governance",
    description: "How decentralized governance works, voting power, proposal creation, and making your voice heard in community decisions.",
    category: "Governance",
    readTime: 15,
    difficulty: "intermediate",
    icon: Vote,
  },
  {
    id: "legal-compliance",
    title: "Securities Law and Compliance",
    description: "Overview of SEC regulations, Reg D exemptions, and how tokenized real estate maintains legal compliance.",
    category: "Legal",
    readTime: 20,
    difficulty: "advanced",
    icon: Scale,
  },
  {
    id: "state-regulations",
    title: "State-by-State Regulatory Guide",
    description: "Comprehensive guide to blockchain and real estate regulations across all 50 states, including Blue Sky laws.",
    category: "Legal",
    readTime: 25,
    difficulty: "advanced",
    icon: Shield,
  },
  {
    id: "smart-contracts",
    title: "Smart Contracts Explained",
    description: "How smart contracts automate token distribution, dividend payments, and governance voting on EVM-compatible blockchains.",
    category: "Technology",
    readTime: 18,
    difficulty: "intermediate",
    icon: BookOpen,
  },
];

export default function Learn() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredArticles = learnArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "all" || article.category.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(learnArticles.map((a) => a.category.toLowerCase())))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Learn</h1>
            <p className="text-muted-foreground">
              Everything you need to know about community-owned real estate tokenization
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-articles"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="flex-wrap">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="capitalize"
                  data-testid={`tab-category-${category}`}
                >
                  {category === "all" ? "All Topics" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredArticles.map((article) => (
              <LearnCard key={article.id} article={article} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 mb-12">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}

          <div id="states" className="pt-8">
            <h2 className="text-2xl font-semibold mb-6">State Regulatory Overview</h2>
            <StateComplianceTable />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
