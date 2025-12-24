import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TransactionHistory } from "@/components/TransactionHistory";
import { KYCVerification } from "@/components/KYCVerification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Wallet, TrendingUp, Vote, DollarSign } from "lucide-react";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import type { User, TokenHolding } from "@shared/schema";

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  const { data: holdings = [] } = useQuery<TokenHolding[]>({
    queryKey: ["/api/user/holdings"],
    enabled: !!user,
  });

  const totalValue = holdings.reduce((sum, h) => {
    const value = h.tokenCount * parseFloat(h.averagePurchasePrice || "0");
    return sum + value;
  }, 0);

  const totalTokens = holdings.reduce((sum, h) => sum + h.tokenCount, 0);
  const totalVotingPower = holdings.reduce((sum, h) => sum + (h.votingPower || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Investor Dashboard</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-xl font-semibold" data-testid="text-portfolio-value">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-xl font-semibold" data-testid="text-total-tokens">{totalTokens}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Vote className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voting Power</p>
                  <p className="text-xl font-semibold" data-testid="text-voting-power">{totalVotingPower}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet</p>
                  {isConnected ? (
                    <p className="text-sm font-mono" data-testid="text-wallet-address">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  ) : (
                    <WalletButton />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Dividend History</CardTitle>
                      <CardDescription>Your earnings from property investments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        No dividends yet. Dividends are distributed quarterly once properties are operational.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <KYCVerification user={user} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investor Protection</CardTitle>
                  <CardDescription>Your investment is protected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">100%</Badge>
                    <p className="text-muted-foreground">
                      Full funding required for loan issuance. If not met within 1 year, you receive a full refund plus 3% APR.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3% APR</Badge>
                    <p className="text-muted-foreground">
                      Compensation on refunds if the property fails to meet its funding goal.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Transfer</Badge>
                    <p className="text-muted-foreground">
                      Option to transfer your shares to another investor instead of receiving a refund.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
