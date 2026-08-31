import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShieldCheck,
  PieChart,
  ExternalLink,
  Info,
  Clock,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { isContractsDeployed } from "@/lib/contracts/addresses";

const treasuryBalance = 0;
const monthlyInflow = 0;
const monthlyOutflow = 0;
const founderCutPercent = 1;
const totalDisbursed = 0;
const founderCutAmount = 0;
const contractsLive = isContractsDeployed();

const allocationBreakdown = [
  { label: "Property Development", percentage: 40, amount: 0, color: "bg-primary" },
  { label: "Community Benefits", percentage: 20, amount: 0, color: "bg-chart-1" },
  { label: "Operating Reserve", percentage: 15, amount: 0, color: "bg-chart-3" },
  { label: "Maintenance Fund", percentage: 15, amount: 0, color: "bg-chart-4" },
  { label: "Emergency Reserve", percentage: 10, amount: 0, color: "bg-chart-5" },
];

interface Transaction {
  id: string;
  type: "inflow" | "outflow";
  description: string;
  amount: number;
  date: string;
  category: string;
  status: "confirmed" | "pending";
  txHash?: string;
  founderCut?: number;
}

const recentTransactions: Transaction[] = [];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Treasury() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredTransactions = recentTransactions.filter((tx) => {
    if (activeTab === "inflow") return tx.type === "inflow";
    if (activeTab === "outflow") return tx.type === "outflow";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2" data-testid="text-treasury-title">
                Community Treasury
              </h1>
              <p className="text-muted-foreground">
                2-of-3 multi-sig pass-through. Founder fee is paid by Escrow, not skimmed here.
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 self-start">
              <ShieldCheck className="h-3.5 w-3.5" />
              {contractsLive ? "On-chain addresses set" : "Not live on Base yet"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-xl font-semibold" data-testid="text-treasury-balance">
                    {formatCurrency(treasuryBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Inflow</p>
                  <p className="text-xl font-semibold text-chart-1" data-testid="text-monthly-inflow">
                    +{formatCurrency(monthlyInflow)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-chart-5/10 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-chart-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Outflow</p>
                  <p className="text-xl font-semibold" data-testid="text-monthly-outflow">
                    -{formatCurrency(monthlyOutflow)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Fund Allocation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex h-3 rounded-full overflow-hidden mb-6">
                  {allocationBreakdown.map((item) => (
                    <div key={item.label} className={`${item.color}`} style={{ width: `${item.percentage}%` }} />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allocationBreakdown.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color} mt-1 shrink-0`} />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage}% &middot; {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-3 rounded-md bg-primary/5 border border-primary/20 flex gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Pass-through:</span>{" "}
                    Treasury holds community funds. Allocations move only after governance. The founder 1% is not taken from this allocation table.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-founder-sustainability">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Founder economics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <p className="text-3xl font-bold text-primary" data-testid="text-founder-cut-percent">{founderCutPercent}%</p>
                  <p className="text-xs text-muted-foreground mt-1">of gross at funding, if impact ≥ 70</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">On-chain disbursed</span>
                    <span className="font-medium" data-testid="text-total-disbursed">{formatCurrency(totalDisbursed)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment 1 accrued</span>
                    <span className="font-medium text-primary" data-testid="text-founder-cut-amount">{formatCurrency(founderCutAmount)}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>Payment 1: 1% of gross in Escrow when the raise completes and Governance impact score is 70+.</p>
                  <p>Payment 2: 1% of quarterly property income after the asset produces cash flow.</p>
                  <p>No 24-month vest. No Treasury skim. No 5% platform cut.</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 border flex gap-2">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Figures stay at $0 until contracts are deployed to Base and a property actually funds.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="tab-tx-all">All</TabsTrigger>
                  <TabsTrigger value="inflow" data-testid="tab-tx-inflow">Inflows</TabsTrigger>
                  <TabsTrigger value="outflow" data-testid="tab-tx-outflow">Outflows</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No on-chain treasury transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between gap-4 p-4 rounded-md bg-muted/30" data-testid={`treasury-tx-${tx.id}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === "inflow" ? "bg-chart-1/10 text-chart-1" : "bg-chart-5/10 text-chart-5"}`}>
                          {tx.type === "inflow" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <span className="font-medium text-sm">{tx.description}</span>
                          {tx.status === "pending" && (
                            <Badge variant="secondary" className="text-xs ml-2"><Clock className="h-3 w-3" /> Pending</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold text-sm ${tx.type === "inflow" ? "text-chart-1" : ""}`}>
                          {tx.type === "inflow" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </span>
                        {tx.txHash && (
                          <Button variant="ghost" size="icon" onClick={() => window.open(`https://basescan.org/tx/${tx.txHash}`, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
