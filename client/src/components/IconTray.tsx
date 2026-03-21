import { type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface IconTrayItem {
  id: string;
  label: string;
  icon: ElementType;
}

interface IconTrayProps {
  items: IconTrayItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  maxItems?: number;
  className?: string;
}

export function IconTray({ items, activeId, onSelect, maxItems = 6, className }: IconTrayProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      data-testid="icon-tray"
    >
      {items.slice(0, maxItems).map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(isActive ? "" : item.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer select-none",
              isActive
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 shadow-sm"
                : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-muted-foreground/30"
            )}
            data-testid={`icon-tray-chip-${item.id}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
