import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Flag, Users, Globe, CheckCircle, Clock, Lock } from "lucide-react";
import { getPhaseConfig } from "@shared/schema";

interface PhaseStatus {
  phase: "county" | "state" | "national" | "international";
  isActive: boolean;
  isCompleted: boolean;
  tokensSold: number;
  tokenAllocation: number;
  currentPrice: number;
}

interface TokenOfferingTimelineProps {
  phases: PhaseStatus[];
  propertyCounty: string;
  propertyState: string;
}

const phaseIcons = {
  county: MapPin,
  state: Flag,
  national: Users,
  international: Globe,
};

export function TokenOfferingTimeline({ phases, propertyCounty, propertyState }: TokenOfferingTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Staged access to the full supply</CardTitle>
        <p className="text-sm text-muted-foreground">
          County residents first, then the rest of the state, then the rest of the US. Each later stage sells only what is still unsold.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {phases.map((phaseStatus) => {
              const config = getPhaseConfig(phaseStatus.phase);
              const Icon = phaseIcons[phaseStatus.phase];
              const percent = phaseStatus.tokenAllocation > 0 
                ? Math.round((phaseStatus.tokensSold / phaseStatus.tokenAllocation) * 100)
                : 0;
              
              return (
                <div key={phaseStatus.phase} className="relative flex gap-4">
                  <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    phaseStatus.isCompleted 
                      ? "bg-chart-3 text-white"
                      : phaseStatus.isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {phaseStatus.isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : phaseStatus.isActive ? (
                      <Icon className="h-5 w-5" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium">{config?.name ?? phaseStatus.phase} stage</h4>
                      {phaseStatus.isActive && (
                        <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>
                      )}
                      {phaseStatus.isCompleted && (
                        <Badge variant="outline" className="text-xs">Completed</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {phaseStatus.phase === "county" && `Verified ${propertyCounty} County residents`}
                      {phaseStatus.phase === "state" && `Verified ${propertyState} residents, including the county`}
                      {phaseStatus.phase === "national" && "Other verified US residents"}
                      {phaseStatus.phase === "international" && "Not a sale stage"}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium ml-1">${phaseStatus.currentPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max:</span>
                        <span className="font-medium ml-1">Same allowance, not set</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vote:</span>
                        <span className="font-medium ml-1">{config ? `${config.voteWeight}x` : "—"}</span>
                      </div>
                    </div>
                    
                    {(phaseStatus.isActive || phaseStatus.isCompleted) && (
                      <div className="space-y-1">
                        <Progress value={percent} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          {phaseStatus.tokensSold.toLocaleString()} / {phaseStatus.tokenAllocation.toLocaleString()} tokens ({percent}%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-md bg-muted/30 border">
          <h5 className="font-medium text-sm mb-2">How access works</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Days 0–90 are limited to verified county residents. Days 91–180 open statewide.
            After day 180 the unsold remainder is open nationwide. The initial price is a
            parameter, not a ladder. Vote weight follows residency: 1.5, 1.0, then 0.75.
            Outside holders still vote. There is no cap on outside votes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
