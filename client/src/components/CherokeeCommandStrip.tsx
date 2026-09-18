import { Link } from "wouter";
import { valves, COMPOSITE_SCORE, HEADLINE, SCORECARD_AS_OF } from "@/data/cherokee-command";

function barColor(id: string, value: number) {
  if (id === "DRAG") {
    if (value >= 60) return "bg-amber-500";
    return "bg-primary";
  }
  if (value >= 75) return "bg-primary";
  if (value >= 50) return "bg-sky-500";
  return "bg-amber-500";
}

export function CherokeeCommandStrip({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className="border-b bg-muted/20"
      data-testid="cherokee-command-strip"
      aria-label="Cherokee County command strip"
    >
      <div className="mx-auto px-5 md:px-10 py-4" style={{ maxWidth: "1100px" }}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-primary">
              Cherokee Command
            </p>
            <p className="font-serif text-lg md:text-xl tracking-tight">{HEADLINE}</p>
            <p className="text-xs text-muted-foreground">
              Now-cast {SCORECARD_AS_OF} · composite {COMPOSITE_SCORE} is secondary · valves are the signal
            </p>
          </div>
          {!compact && (
            <Link href="/command" className="text-xs font-medium text-primary hover:underline">
              Open full desk
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {valves.map((v) => (
            <div key={v.id} className="rounded-lg border bg-background/80 p-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-semibold tracking-wide">{v.short}</span>
                <span className="font-serif text-lg">{v.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${barColor(v.id, v.value)}`}
                  style={{ width: `${Math.min(100, v.value)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-snug">{v.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
