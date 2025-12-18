import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { Wallet, TrendingUp, Coins, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// todo: remove mock functionality
const portfolioData = [
  { name: "Etowah Wellness Village", value: 4200, color: "hsl(217, 91%, 35%)" },
  { name: "Historic Mill Reuse", value: 2500, color: "hsl(187, 71%, 32%)" },
  { name: "Main Street District", value: 1800, color: "hsl(156, 72%, 28%)" },
  { name: "Downtown Revival", value: 1500, color: "hsl(43, 74%, 38%)" },
];

const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);

export function PortfolioOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Value"
          value={`$${totalValue.toLocaleString()}`}
          change={12.5}
          icon={Wallet}
        />
        <StatCard
          title="Total Tokens"
          value="142"
          change={8.3}
          icon={Coins}
        />
        <StatCard
          title="Est. Annual Yield"
          value="7.8%"
          change={0.5}
          icon={TrendingUp}
        />
        <StatCard
          title="Next Dividend"
          value="$89.50"
          icon={Calendar}
          description="Jan 15, 2025"
        />
      </div>

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
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
