import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Flag, Users, Globe, CheckCircle, Clock, Lock } from "lucide-react";
import { PHASE_CONFIG } from "@shared/schema";

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
        <CardTitle className="text-lg">5-Phase Community-First Offering</CardTitle>
        <p className="text-sm text-muted-foreground">
          Local community members invest first at the lowest prices
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {phases.map((phaseStatus, index) => {
              const config = PHASE_CONFIG[phaseStatus.phase];
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
                      <h4 className="font-medium">{config.name} Phase</h4>
                      {phaseStatus.isActive && (
                        <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>
                      )}
                      {phaseStatus.isCompleted && (
                        <Badge variant="outline" className="text-xs">Completed</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {phaseStatus.phase === "county" && `${propertyCounty} County residents only`}
                      {phaseStatus.phase === "state" && `${propertyState} residents`}
                      {phaseStatus.phase === "national" && "All US residents"}
                      {phaseStatus.phase === "international" && "Global investors"}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium ml-1">${phaseStatus.currentPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max:</span>
                        <span className="font-medium ml-1">{config.maxTokensPerPerson} tokens</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Multiplier:</span>
                        <span className="font-medium ml-1">{config.priceMultiplier}x</span>
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
          <h5 className="font-medium text-sm mb-2">Why Community-First Pricing?</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This 5-phase system ensures local community members who will be most affected by development 
            can invest first at the lowest price ($12.50/token). As phases open to broader audiences, 
            prices increase algorithmically. This prevents wealthy outside investors from monopolizing 
            community assets and ensures local voices have governance power before external capital enters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
