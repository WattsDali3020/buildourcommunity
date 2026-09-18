import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CherokeeCommandStrip } from "@/components/CherokeeCommandStrip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  seedPriorities,
  TAG_LABEL,
  PUBLIC_FLOOR,
  type PriorityTag,
} from "@/data/cherokee-command";

const tagClass: Record<PriorityTag, string> = {
  "helps-r-cap": "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  "helps-c": "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "helps-i": "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "adds-drag": "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function CherokeeCommandPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CherokeeCommandStrip compact />
      <main className="flex-1">
        <div className="mx-auto px-5 md:px-10 py-10" style={{ maxWidth: "1100px" }}>
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary mb-2">
            Phase 1 seed order
          </p>
          <h1 className="font-serif text-3xl tracking-tight mb-3">Vote the missing workplace</h1>
          <p className="text-muted-foreground max-w-2xl mb-4">
            Locked order: workforce housing, trades/industrial, downtown mixed-use, service node,
            then distressed residential. House-only pins raise R and the I-575 drag.
          </p>
          <p className="text-xs text-muted-foreground mb-8">{PUBLIC_FLOOR}</p>

          <div className="space-y-4">
            {seedPriorities.map((p, i) => (
              <Card key={p.id} data-testid={`seed-priority-${p.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {i + 1} · {p.place}
                      </p>
                      <h2 className="font-serif text-xl mb-2">{p.title}</h2>
                      <p className="text-sm text-muted-foreground max-w-2xl">{p.summary}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">PhaseManager</p>
                      <p className="font-serif text-2xl">{p.phaseProgress}%</p>
                      <p className="text-[11px] text-muted-foreground">of 75% threshold</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-4">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, (p.phaseProgress / 75) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[11px] font-medium rounded-full border px-2 py-0.5 ${tagClass[t]}`}
                      >
                        {TAG_LABEL[t]}
                      </span>
                    ))}
                    <span className="text-[11px] text-muted-foreground ml-auto">{p.buyInHint}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/nominate">Nominate against a valve</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demand">Demand map</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/governance">Governance</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
