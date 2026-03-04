import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Send, Clock, CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ShareTransfer, TokenHolding } from "@shared/schema";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle },
  completed: { label: "Completed", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

export default function Transfers() {
  const { toast } = useToast();
  const [selectedOffering, setSelectedOffering] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const [tokenCount, setTokenCount] = useState("");

  const { data: holdings = [], isLoading: holdingsLoading } = useQuery<TokenHolding[]>({
    queryKey: ["/api/user/holdings"],
  });

  const { data: transfers = [], isLoading: transfersLoading } = useQuery<ShareTransfer[]>({
    queryKey: ["/api/user/transfers"],
  });

  const transferMutation = useMutation({
    mutationFn: async (data: { offeringId: string; recipientWalletAddress: string; tokenCount: number }) => {
      const res = await apiRequest("POST", "/api/transfers", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Transfer request submitted", description: "Your share transfer request is pending review." });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transfers"] });
      setSelectedOffering("");
      setRecipientWallet("");
      setTokenCount("");
    },
    onError: (error: Error) => {
      toast({ title: "Transfer failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering || !recipientWallet || !tokenCount) return;

    const count = parseInt(tokenCount, 10);
    if (isNaN(count) || count <= 0) {
      toast({ title: "Invalid token count", description: "Please enter a valid number of tokens.", variant: "destructive" });
      return;
    }

    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(recipientWallet)) {
      toast({ title: "Invalid wallet address", description: "Please enter a valid Ethereum wallet address.", variant: "destructive" });
      return;
    }

    transferMutation.mutate({
      offeringId: selectedOffering,
      recipientWalletAddress: recipientWallet,
      tokenCount: count,
    });
  };

  const selectedHolding = holdings.find(h => h.offeringId === selectedOffering);
  const maxTokens = selectedHolding?.tokenCount || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-transfers-title">Share Transfers</h1>
            <p className="text-muted-foreground">
              Transfer your property tokens to another investor. All transfers are off-chain records pending smart contract audit completion.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Initiate Transfer
                </CardTitle>
                <CardDescription>Transfer tokens to another wallet address</CardDescription>
              </CardHeader>
              <CardContent>
                {holdings.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-1" data-testid="text-no-holdings">No holdings available</p>
                    <p className="text-xs text-muted-foreground">
                      You need to own tokens before you can transfer them.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="offering">Select Property</Label>
                      <Select value={selectedOffering} onValueChange={setSelectedOffering}>
                        <SelectTrigger data-testid="select-offering">
                          <SelectValue placeholder="Choose a property holding" />
                        </SelectTrigger>
                        <SelectContent>
                          {holdings.map((h) => (
                            <SelectItem key={h.offeringId} value={h.offeringId}>
                              Property #{h.offeringId.slice(0, 8)} ({h.tokenCount} tokens)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Wallet Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        value={recipientWallet}
                        onChange={(e) => setRecipientWallet(e.target.value)}
                        data-testid="input-recipient-wallet"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tokenCount">Number of Tokens</Label>
                      <Input
                        id="tokenCount"
                        type="number"
                        min={1}
                        max={maxTokens}
                        placeholder={maxTokens > 0 ? `Max: ${maxTokens}` : "0"}
                        value={tokenCount}
                        onChange={(e) => setTokenCount(e.target.value)}
                        data-testid="input-token-count"
                      />
                      {selectedHolding && (
                        <p className="text-xs text-muted-foreground">
                          Available: {maxTokens} tokens @ ${parseFloat(selectedHolding.averagePurchasePrice || "0").toFixed(2)}/token
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-md bg-muted/30 border">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Transfer requests are recorded off-chain and will be executed on-chain once smart contract audits are complete. Transfers are subject to admin review.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!selectedOffering || !recipientWallet || !tokenCount || transferMutation.isPending}
                      data-testid="button-submit-transfer"
                    >
                      {transferMutation.isPending ? "Submitting..." : "Submit Transfer Request"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Transfer History
                </CardTitle>
                <CardDescription>Your share transfer requests and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {transfersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : transfers.length === 0 ? (
                  <div className="text-center py-8">
                    <ArrowRightLeft className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-1" data-testid="text-no-transfers">No transfers yet</p>
                    <p className="text-xs text-muted-foreground">
                      Your transfer history will appear here once you initiate a transfer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transfers.map((transfer, index) => {
                      const statusConfig = STATUS_CONFIG[transfer.status || "pending"];
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div
                          key={transfer.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/30 border"
                          data-testid={`transfer-${index}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <StatusIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {transfer.tokenCount} tokens
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {transfer.requestedAt ? new Date(transfer.requestedAt).toLocaleDateString() : "Pending"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-medium">
                              ${parseFloat(transfer.transferValue || "0").toFixed(2)}
                            </span>
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
