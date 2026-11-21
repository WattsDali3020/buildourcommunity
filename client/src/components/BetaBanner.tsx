import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm relative z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-4 flex-wrap">
        <span className="font-medium">
          Cherokee County design preview. Map pins are RevitaHub properties only, not every parcel.
        </span>
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
  );
}
