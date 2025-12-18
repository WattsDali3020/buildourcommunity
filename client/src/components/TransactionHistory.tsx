import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowUpRight, ArrowDownRight, Coins } from "lucide-react";

// todo: remove mock functionality
const transactions = [
  {
    id: "tx-1",
    type: "purchase",
    property: "Etowah Wellness Village",
    tokens: 10,
    amount: 1000,
    date: new Date("2024-12-15"),
    txHash: "0x1234...5678",
    status: "confirmed",
  },
  {
    id: "tx-2",
    type: "dividend",
    property: "Historic Mill Reuse",
    tokens: 0,
    amount: 45.50,
    date: new Date("2024-12-01"),
    txHash: "0xabcd...efgh",
    status: "confirmed",
  },
  {
    id: "tx-3",
    type: "purchase",
    property: "Main Street District",
    tokens: 5,
    amount: 750,
    date: new Date("2024-11-20"),
    txHash: "0x9876...5432",
    status: "confirmed",
  },
  {
    id: "tx-4",
    type: "dividend",
    property: "Downtown Revival",
    tokens: 0,
    amount: 32.25,
    date: new Date("2024-11-01"),
    txHash: "0xijkl...mnop",
    status: "confirmed",
  },
];

export function TransactionHistory() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Transaction History</CardTitle>
        <Button variant="outline" size="sm" data-testid="button-export-transactions">
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-4 p-4 rounded-md bg-muted/30"
              data-testid={`transaction-${tx.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  tx.type === "purchase" ? "bg-chart-1/10 text-chart-1" : "bg-chart-3/10 text-chart-3"
                }`}>
                  {tx.type === "purchase" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tx.property}</span>
                    <Badge variant="outline" className="text-xs">
                      {tx.type === "purchase" ? "Purchase" : "Dividend"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tx.date.toLocaleDateString()}
                    {tx.tokens > 0 && ` - ${tx.tokens} tokens`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${
                  tx.type === "dividend" ? "text-chart-3" : ""
                }`}>
                  {tx.type === "dividend" ? "+" : "-"}${tx.amount.toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  data-testid={`button-view-tx-${tx.id}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
