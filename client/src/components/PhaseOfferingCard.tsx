import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Users, MapPin, Globe, Flag, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

export interface Phase {
  id: string;
  phase: "county" | "state" | "national" | "international";
  phaseName: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  priceMultiplier: number;
  tokenAllocation: number;
  tokensSold: number;
  maxTokensPerPerson: number;
  eligibilityCounty?: string;
  eligibilityState?: string;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  userEligible: boolean;
  userTokensPurchased: number;
}

interface PhaseOfferingCardProps {
  phase: Phase;
  propertyName: string;
  onPurchase?: (phaseId: string, tokenCount: number) => void;
}

const phaseIcons = {
  county: MapPin,
  state: Flag,
  national: Users,
  international: Globe,
};

const phaseColors = {
  county: "bg-chart-3 text-white",
  state: "bg-chart-1 text-white",
  national: "bg-chart-4 text-white",
  international: "bg-chart-5 text-white",
};

export function PhaseOfferingCard({ phase, propertyName, onPurchase }: PhaseOfferingCardProps) {
  const [tokenCount, setTokenCount] = useState(1);
  const Icon = phaseIcons[phase.phase];
  const tokensRemaining = phase.tokenAllocation - phase.tokensSold;
  const userTokensRemaining = phase.maxTokensPerPerson - phase.userTokensPurchased;
  const maxPurchasable = Math.min(tokensRemaining, userTokensRemaining);
  const percentSold = Math.round((phase.tokensSold / phase.tokenAllocation) * 100);

  const handlePurchase = () => {
    if (onPurchase && tokenCount > 0 && tokenCount <= maxPurchasable) {
      onPurchase(phase.id, tokenCount);
    }
  };

  const getStatusBadge = () => {
    if (phase.isCompleted) {
      return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
    }
    if (phase.isActive) {
      return <Badge className={phaseColors[phase.phase]}>Active Now</Badge>;
    }
    if (phase.isLocked) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    return null;
  };

  return (
    <Card className={`relative overflow-hidden ${phase.isActive ? "ring-2 ring-primary" : ""} ${phase.isLocked ? "opacity-75" : ""}`}>
      {phase.isLocked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Opens after previous phase</p>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${phase.isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{phase.phaseName}</CardTitle>
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Token Price</p>
            <p className="text-xl font-bold" data-testid={`text-phase-price-${phase.phase}`}>
              ${phase.currentPrice.toFixed(2)}
            </p>
            {phase.priceMultiplier > 1 && (
              <p className="text-xs text-muted-foreground">{phase.priceMultiplier}x base price</p>
            )}
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Max Per Person</p>
            <p className="text-xl font-bold">{phase.maxTokensPerPerson}</p>
            <p className="text-xs text-muted-foreground">tokens</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Phase Progress</span>
            <span className="font-medium">{phase.tokensSold.toLocaleString()} / {phase.tokenAllocation.toLocaleString()}</span>
          </div>
          <Progress value={percentSold} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {tokensRemaining.toLocaleString()} tokens remaining
          </p>
        </div>

        {phase.eligibilityCounty && (
          <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Restricted to {phase.eligibilityCounty} County, {phase.eligibilityState}</span>
          </div>
        )}
        {phase.eligibilityState && !phase.eligibilityCounty && (
          <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <span>Restricted to {phase.eligibilityState} residents</span>
          </div>
        )}

        {phase.isActive && phase.userEligible && !phase.isCompleted && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-chart-3">
              <CheckCircle className="h-4 w-4" />
              <span>You are eligible to participate</span>
            </div>
            
            {phase.userTokensPurchased > 0 && (
              <div className="text-sm text-muted-foreground">
                You own {phase.userTokensPurchased} tokens ({userTokensRemaining} remaining allocation)
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`tokens-${phase.id}`}>Number of Tokens</Label>
              <div className="flex gap-2">
                <Input
                  id={`tokens-${phase.id}`}
                  type="number"
                  min={1}
                  max={maxPurchasable}
                  value={tokenCount}
                  onChange={(e) => setTokenCount(Math.min(Math.max(1, Number(e.target.value)), maxPurchasable))}
                  className="flex-1"
                  data-testid={`input-token-count-${phase.phase}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTokenCount(maxPurchasable)}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
              <div className="flex justify-between text-sm mb-1">
                <span>Tokens:</span>
                <span>{tokenCount}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Price per token:</span>
                <span>${phase.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                <span>Total:</span>
                <span>${(tokenCount * phase.currentPrice).toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handlePurchase}
              disabled={tokenCount < 1 || tokenCount > maxPurchasable}
              data-testid={`button-purchase-${phase.phase}`}
            >
              Purchase {tokenCount} Token{tokenCount !== 1 ? "s" : ""} for ${(tokenCount * phase.currentPrice).toFixed(2)}
            </Button>
          </div>
        )}

        {phase.isActive && !phase.userEligible && !phase.isCompleted && (
          <div className="flex items-center gap-2 text-sm p-3 rounded-md bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>You are not eligible for this phase based on your location</span>
          </div>
        )}

        {phase.isCompleted && (
          <div className="flex items-center gap-2 text-sm p-3 rounded-md bg-muted">
            <CheckCircle className="h-4 w-4 text-chart-3" />
            <span>This phase has completed. {phase.tokensSold.toLocaleString()} tokens sold.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
