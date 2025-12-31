import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Vote, TrendingUp, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NudgeType = "vote" | "invest" | "engage" | "bonus";

interface NudgeConfig {
  icon: typeof Vote;
  title: string;
  description: string;
  action: string;
  color: string;
  bgColor: string;
}

const nudgeConfigs: Record<NudgeType, NudgeConfig> = {
  vote: {
    icon: Vote,
    title: "Your Vote Matters",
    description: "Cast your vote on Proposal #12 to earn +0.5% bonus APR this quarter",
    action: "Vote Now",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  invest: {
    icon: TrendingUp,
    title: "Phase 1 Closing Soon",
    description: "County residents get 1.5x voting power. 3 days left at $12.50/token",
    action: "Invest Now",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  engage: {
    icon: Users,
    title: "Community Milestone",
    description: "We're 5 votes away from reaching quorum. Your participation unlocks rewards",
    action: "Join Vote",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  bonus: {
    icon: Zap,
    title: "Bonus APR Unlocked",
    description: "You've earned +1.2% bonus APR this month through active governance",
    action: "View Rewards",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
};

interface BehavioralNudgeProps {
  type?: NudgeType;
  show?: boolean;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function BehavioralNudge({ 
  type = "vote", 
  show = true,
  onAction,
  onDismiss 
}: BehavioralNudgeProps) {
  const [isVisible, setIsVisible] = useState(show);
  const config = nudgeConfigs[type];
  const Icon = config.icon;

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleAction = () => {
    onAction?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
          data-testid={`nudge-${type}`}
        >
          <Card className="border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">{config.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 -mt-1 -mr-1"
                      onClick={handleDismiss}
                      data-testid="button-dismiss-nudge"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {config.description}
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3 h-8 text-xs"
                    onClick={handleAction}
                    data-testid="button-nudge-action"
                  >
                    {config.action}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useNudgeSystem() {
  const [activeNudge, setActiveNudge] = useState<NudgeType | null>(null);
  const [dismissed, setDismissed] = useState<Set<NudgeType>>(new Set());

  const showNudge = (type: NudgeType) => {
    if (!dismissed.has(type)) {
      setActiveNudge(type);
    }
  };

  const dismissNudge = () => {
    if (activeNudge) {
      setDismissed(prev => new Set(prev).add(activeNudge));
    }
    setActiveNudge(null);
  };

  return {
    activeNudge,
    showNudge,
    dismissNudge,
    isVisible: activeNudge !== null,
  };
}
