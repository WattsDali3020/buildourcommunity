import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Wallet, AlertCircle, Loader2 } from "lucide-react";
import type { TokenOffering, OfferingPhase, User } from "@shared/schema";

interface TokenPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering: TokenOffering;
  activePhase?: OfferingPhase;
  user?: User | null;
}

export function TokenPurchaseModal({
  open,
  onOpenChange,
  offering,
  activePhase,
  user,
}: TokenPurchaseModalProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [tokenCount, setTokenCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "usdc">("card");

  const pricePerToken = activePhase ? parseFloat(activePhase.pricePerToken) : 0;
  const totalAmount = tokenCount * pricePerToken;
  const maxTokens = activePhase?.maxTokensPerPerson || 100;

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/purchases", {
        offeringId: offering.id,
        phaseId: activePhase?.id,
        tokenCount,
        paymentMethod,
        walletAddress: address,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/user/holdings"] });
        toast({
          title: "Purchase Successful",
          description: `You purchased ${tokenCount} ${offering.tokenSymbol} tokens!`,
        });
        onOpenChange(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to process purchase",
        variant: "destructive",
      });
    },
  });

  const isKYCVerified = user?.kycStatus === "verified";
  const canPurchase = isKYCVerified && activePhase?.isActive;

  const getPhaseInfo = () => {
    if (!activePhase) return null;
    const phaseNames: Record<string, string> = {
      county: "County Phase",
      state: "State Phase",
      national: "National Phase",
      international: "International Phase",
    };
    return phaseNames[activePhase.phase] || activePhase.phase;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase {offering.tokenSymbol} Tokens</DialogTitle>
          <DialogDescription>
            Invest in {offering.tokenName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {activePhase && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Phase</span>
              <Badge variant="secondary">{getPhaseInfo()}</Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price per Token</span>
            <span className="font-semibold">${pricePerToken.toFixed(2)}</span>
          </div>

          {!isKYCVerified && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Verification Required</p>
                <p className="text-muted-foreground">
                  Complete identity verification in your dashboard before purchasing.
                </p>
              </div>
            </div>
          )}

          {isKYCVerified && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="tokenCount">Number of Tokens</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTokenCount(Math.max(1, tokenCount - 1))}
                    disabled={tokenCount <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="tokenCount"
                    type="number"
                    min={1}
                    max={maxTokens}
                    value={tokenCount}
                    onChange={(e) =>
                      setTokenCount(Math.min(maxTokens, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-24 text-center"
                    data-testid="input-token-count"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTokenCount(Math.min(maxTokens, tokenCount + 1))}
                    disabled={tokenCount >= maxTokens}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Max {maxTokens} tokens per person in this phase
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "card" | "usdc")}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover-elevate">
                    <RadioGroupItem value="card" id="card" data-testid="radio-payment-card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover-elevate">
                    <RadioGroupItem value="usdc" id="usdc" data-testid="radio-payment-usdc" />
                    <Label htmlFor="usdc" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-4 w-4" />
                      USDC (Crypto)
                      {!isConnected && (
                        <Badge variant="outline" className="ml-auto">Connect Wallet</Badge>
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span data-testid="text-total-amount">${totalAmount.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => purchaseMutation.mutate()}
            disabled={!canPurchase || purchaseMutation.isPending}
            data-testid="button-confirm-purchase"
          >
            {purchaseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
