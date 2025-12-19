import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { CreditCard, Wallet, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import type { User } from "@shared/schema";

interface SimplePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  tokenSymbol: string;
  currentPhase: string;
  pricePerToken: number;
  maxTokensPerPerson: number;
  userTokensPurchased: number;
  user?: User | null;
}

export function SimplePurchaseModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  tokenSymbol,
  currentPhase,
  pricePerToken,
  maxTokensPerPerson,
  userTokensPurchased,
  user,
}: SimplePurchaseModalProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [tokenCount, setTokenCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "usdc">("card");

  const totalAmount = tokenCount * pricePerToken;
  const remainingTokens = maxTokensPerPerson - userTokensPurchased;
  const maxTokens = Math.max(1, remainingTokens);

  const phaseNames: Record<string, string> = {
    county: "County Phase",
    state: "State Phase",
    national: "National Phase",
    international: "International Phase",
  };

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/purchase", {
        propertyId,
        tokenCount,
        phase: currentPhase,
        paymentMethod,
        amount: totalAmount,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/user/holdings"] });
      toast({
        title: "Purchase Initiated",
        description: `Your purchase of ${tokenCount} ${tokenSymbol} tokens is being processed.`,
      });
      onClose();
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
  const hasWallet = !!user?.walletAddress || isConnected;
  const canPurchase = isKYCVerified && hasWallet && remainingTokens > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase {tokenSymbol} Tokens</DialogTitle>
          <DialogDescription>
            Invest in {propertyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Phase</span>
            <Badge variant="secondary">{phaseNames[currentPhase] || currentPhase}</Badge>
          </div>

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

          {isKYCVerified && !hasWallet && (
            <div className="flex items-start gap-2 p-3 bg-chart-4/10 rounded-md">
              <Wallet className="h-5 w-5 text-chart-4 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Wallet Connection Required</p>
                <p className="text-muted-foreground">
                  Connect your wallet to receive tokens on the Base network.
                </p>
              </div>
            </div>
          )}

          {isKYCVerified && hasWallet && (
            <>
              <div className="flex items-center gap-2 p-3 bg-chart-3/10 rounded-md">
                <CheckCircle className="h-5 w-5 text-chart-3" />
                <div className="text-sm">
                  <p className="font-medium text-chart-3">Ready to Purchase</p>
                  <p className="text-muted-foreground">
                    Your identity is verified and wallet is connected.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="tokenCount">Number of Tokens</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTokenCount(Math.max(1, tokenCount - 1))}
                    disabled={tokenCount <= 1}
                    data-testid="button-decrease-tokens"
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
                    data-testid="button-increase-tokens"
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {userTokensPurchased > 0 
                    ? `You've purchased ${userTokensPurchased} of ${maxTokensPerPerson} max tokens in this phase`
                    : `Max ${maxTokensPerPerson} tokens per person in this phase`
                  }
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
                      USDC (Base Network)
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
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-purchase">
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
