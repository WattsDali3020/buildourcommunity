import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowUpRight, ArrowDownRight, Loader2, Receipt } from "lucide-react";
import type { TokenPurchase } from "@shared/schema";

interface PurchaseWithDetails extends TokenPurchase {
  propertyName: string;
  tokenSymbol: string;
}

export function TransactionHistory() {
  const { data: purchases = [], isLoading } = useQuery<PurchaseWithDetails[]>({
    queryKey: ["/api/user/purchases"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet.</p>
            <p className="text-sm mt-2">Your purchase history will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {purchases.map((tx) => {
            const amount = parseFloat(tx.totalAmount);
            const date = tx.purchasedAt ? new Date(tx.purchasedAt) : new Date();
            const isConfirmed = tx.status === "confirmed";
            
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-4 p-4 rounded-md bg-muted/30"
                data-testid={`transaction-${tx.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-chart-1/10 text-chart-1">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{tx.propertyName}</span>
                      <Badge variant="outline" className="text-xs">
                        Purchase
                      </Badge>
                      <Badge 
                        variant={isConfirmed ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {date.toLocaleDateString()} - {tx.tokenCount} {tx.tokenSymbol} tokens
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    ${amount.toFixed(2)}
                  </span>
                  {tx.transactionHash && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://basescan.org/tx/${tx.transactionHash}`, "_blank")}
                      data-testid={`button-view-tx-${tx.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
