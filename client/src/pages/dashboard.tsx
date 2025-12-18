import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Bell } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Track your investments, earnings, and community impact
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="portfolio" className="space-y-6">
            <TabsList>
              <TabsTrigger value="portfolio" data-testid="tab-portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
              <TabsTrigger value="dividends" data-testid="tab-dividends">Dividends</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio">
              <PortfolioOverview />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="dividends">
              <div className="text-center py-12 text-muted-foreground">
                Dividend history and projections coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
