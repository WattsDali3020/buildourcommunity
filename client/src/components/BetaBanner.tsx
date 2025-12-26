import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitlistModal } from "./WaitlistModal";

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm relative z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-4 flex-wrap">
          <span className="font-medium">
            Beta Prototype - Join the waitlist for updates and early access
          </span>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setWaitlistOpen(true)}
            data-testid="button-join-waitlist-banner"
          >
            Join Waitlist
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-foreground/70"
            onClick={() => setDismissed(true)}
            data-testid="button-dismiss-banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
}
