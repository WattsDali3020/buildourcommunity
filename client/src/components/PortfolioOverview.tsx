import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { Wallet, TrendingUp, Coins, Calendar, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { TokenHolding } from "@shared/schema";

const COLORS = [
  "hsl(217, 91%, 35%)",
  "hsl(187, 71%, 32%)",
  "hsl(156, 72%, 28%)",
  "hsl(43, 74%, 38%)",
  "hsl(280, 65%, 45%)",
  "hsl(350, 70%, 45%)",
];

interface HoldingWithProperty extends TokenHolding {
  propertyName?: string;
}

export function PortfolioOverview() {
  const { data: holdings = [], isLoading } = useQuery<HoldingWithProperty[]>({
    queryKey: ["/api/user/holdings"],
  });

  const totalValue = holdings.reduce((sum, h) => {
    const value = h.tokenCount * parseFloat(h.averagePurchasePrice || "0");
    return sum + value;
  }, 0);

  const totalTokens = holdings.reduce((sum, h) => sum + h.tokenCount, 0);
  const totalVotingPower = holdings.reduce((sum, h) => sum + (h.votingPower || 0), 0);

  const portfolioData = holdings.map((h, index) => ({
    name: h.propertyName || `Property ${index + 1}`,
    value: h.tokenCount * parseFloat(h.averagePurchasePrice || "0"),
    color: COLORS[index % COLORS.length],
  })).filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You don't have any token holdings yet.</p>
            <p className="text-sm mt-2">Browse properties to start investing in your community.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Value"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
        />
        <StatCard
          title="Total Tokens"
          value={totalTokens.toString()}
          icon={Coins}
        />
        <StatCard
          title="Voting Power"
          value={totalVotingPower.toString()}
          icon={TrendingUp}
        />
        <StatCard
          title="Properties"
          value={holdings.length.toString()}
          icon={Calendar}
          description="Active investments"
        />
      </div>

      {portfolioData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Value"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
