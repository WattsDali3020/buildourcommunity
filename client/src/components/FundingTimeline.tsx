import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Clock, AlertTriangle, CheckCircle, ArrowRightLeft, RefreshCw, 
  TrendingUp, Calendar, DollarSign, Shield
} from "lucide-react";
import { useState } from "react";
import { FUNDING_TIMELINE_CONFIG } from "@shared/schema";

interface FundingTimelineProps {
  offeringId: string;
  fundingGoal: number;
  fundingRaised: number;
  minimumThreshold: number;
  deadline: Date;
  startDate: Date;
  currentPhase: string;
  status: "in_progress" | "funded" | "failed" | "refunded";
  userHoldings?: {
    tokenCount: number;
    investedAmount: number;
    purchaseDate: Date;
  };
}

export function FundingTimeline({
  offeringId,
  fundingGoal,
  fundingRaised,
  minimumThreshold,
  deadline,
  startDate,
  currentPhase,
  status,
  userHoldings,
}: FundingTimelineProps) {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedTransferProject, setSelectedTransferProject] = useState<string>("");

  const now = new Date();
  const totalDuration = deadline.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  const fundingProgress = Math.min(100, (fundingRaised / fundingGoal) * 100);
  const thresholdProgress = (minimumThreshold / fundingGoal) * 100;
  
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isCritical = fundingProgress < thresholdProgress && daysRemaining < 60;

  const calculateRefundWithInterest = () => {
    if (!userHoldings) return { interest: 0, total: 0 };
    const daysHeld = Math.floor((now.getTime() - userHoldings.purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const yearFraction = daysHeld / 365;
    const interest = Number((userHoldings.investedAmount * (FUNDING_TIMELINE_CONFIG.refundInterestRate / 100) * yearFraction).toFixed(2));
    return { interest, total: userHoldings.investedAmount + interest };
  };

  const refundDetails = calculateRefundWithInterest();

  const activeProjects: { id: string; name: string; fundingProgress: number }[] = [];

  return (
    <Card className={isCritical ? "border-destructive/50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Funding Timeline
            </CardTitle>
            <CardDescription>1-year distribution with community-first phases</CardDescription>
          </div>
          <Badge variant={status === "funded" ? "default" : status === "failed" ? "destructive" : "outline"}>
            {status === "funded" && <CheckCircle className="h-3 w-3 mr-1" />}
            {status === "failed" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {status === "in_progress" ? "Active" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Funding Progress</span>
            <span className="font-medium">${fundingRaised.toLocaleString()} / ${fundingGoal.toLocaleString()}</span>
          </div>
          <div className="relative">
            <Progress value={fundingProgress} className="h-3" />
            <div 
              className="absolute top-0 h-3 border-l-2 border-destructive" 
              style={{ left: `${thresholdProgress}%` }}
              title={`Minimum threshold: ${thresholdProgress}%`}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{fundingProgress.toFixed(1)}% funded</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Min {thresholdProgress}% required
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Time Remaining</span>
            <span className="font-medium">{daysRemaining} days left</span>
          </div>
          <Progress value={timeProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Started {startDate.toLocaleDateString()}</span>
            <span>Deadline {deadline.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 p-3 rounded-md bg-muted/50">
          {(["county", "state", "national", "international"] as const).map((phase) => {
            const config = FUNDING_TIMELINE_CONFIG.phaseDurations[phase];
            const isActive = currentPhase === phase;
            const isPast = ["county", "state", "national", "international"].indexOf(currentPhase) > 
                           ["county", "state", "national", "international"].indexOf(phase);
            
            return (
              <div 
                key={phase} 
                className={`text-center p-2 rounded ${isActive ? "bg-primary/10 border border-primary" : isPast ? "opacity-50" : ""}`}
              >
                <p className="text-xs font-medium capitalize">{phase}</p>
                <p className="text-xs text-muted-foreground">{config.daysMin}-{config.daysMax}d</p>
                {isActive && <Badge variant="default" className="mt-1 text-xs">Current</Badge>}
                {isPast && <CheckCircle className="h-4 w-4 mx-auto mt-1 text-chart-3" />}
              </div>
            );
          })}
        </div>

        {isCritical && status === "in_progress" && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Funding at Risk</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This project has not reached the minimum funding threshold of {thresholdProgress}% 
                  with only {daysRemaining} days remaining. If the threshold is not met, investors 
                  will be offered a full refund plus {FUNDING_TIMELINE_CONFIG.refundInterestRate}% interest 
                  or the option to transfer shares to another active project.
                </p>
              </div>
            </div>
          </div>
        )}

        {(status === "failed" || (isCritical && status === "in_progress")) && userHoldings && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Investor Protection Options
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 justify-start h-auto py-3"
                    data-testid="button-request-refund"
                  >
                    <RefreshCw className="h-5 w-5 text-chart-3" />
                    <div className="text-left">
                      <p className="font-medium">Request Refund</p>
                      <p className="text-xs text-muted-foreground">Get your investment back + interest</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Refund with Interest</DialogTitle>
                    <DialogDescription>
                      Your investment is protected. Receive your full amount plus earned interest.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-md bg-muted/50 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Investment</span>
                        <span className="font-medium">${userHoldings.investedAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Earned ({FUNDING_TIMELINE_CONFIG.refundInterestRate}% APR)</span>
                        <span className="font-medium text-chart-3">+${refundDetails.interest.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Refund</span>
                        <span className="font-semibold text-lg">${refundDetails.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                      <p>Refunds are processed automatically via smart contract within 24-48 hours.</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
                    <Button data-testid="button-confirm-refund">Confirm Refund</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 justify-start h-auto py-3"
                    data-testid="button-transfer-shares"
                  >
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Transfer Shares</p>
                      <p className="text-xs text-muted-foreground">Move investment to another project</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer to Another Project</DialogTitle>
                    <DialogDescription>
                      Move your shares to an active project at equivalent value plus any earned interest.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Destination Project</Label>
                      <Select value={selectedTransferProject} onValueChange={setSelectedTransferProject}>
                        <SelectTrigger data-testid="select-transfer-project">
                          <SelectValue placeholder="Choose a project..." />
                        </SelectTrigger>
                        <SelectContent>
                          {activeProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center justify-between gap-4 w-full">
                                <span>{project.name}</span>
                                <Badge variant="outline" className="text-xs">{project.fundingProgress}% funded</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 rounded-md bg-muted/50 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tokens to Transfer</span>
                        <span className="font-medium">{userHoldings.tokenCount} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transfer Value</span>
                        <span className="font-medium">${refundDetails.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-chart-3">
                        <span className="text-muted-foreground">Interest Bonus Included</span>
                        <span className="font-medium">+${refundDetails.interest.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p>Transferred shares keep your investment working toward community development.</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
                    <Button disabled={!selectedTransferProject} data-testid="button-confirm-transfer">
                      Transfer Shares
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
