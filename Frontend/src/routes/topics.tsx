import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import { topics } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/topics")({
  head: () => ({
    meta: [
      { title: "Key topics from your notes — PrepMate" },
      {
        name: "description",
        content: "PrepMate pulls the key topics out of every PDF you upload and summarises each one in a few bullets.",
      },
      { property: "og:title", content: "Key topics from your notes — PrepMate" },
      { property: "og:description", content: "Auto-generated topic summaries from your uploaded materials." },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
  const [open, setOpen] = useState<string | null>(topics[0]?.id ?? null);

  return (
    <AppShell title="Topic summaries" subtitle="25 topics detected across 4 materials.">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {topics.map((t) => {
          const isOpen = open === t.id;
          return (
            <article key={t.id} className="overflow-hidden rounded-2xl bg-card shadow-soft">
              <button
                onClick={() => setOpen(isOpen ? null : t.id)}
                className="flex w-full items-center gap-4 p-5 text-left"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold">{t.title}</h2>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <FileText className="size-3 shrink-0" />
                    {t.source}
                  </p>
                </div>
                <div className="hidden w-32 shrink-0 sm:block">
                  <Progress value={t.mastery} className="h-2" />
                  <p className="mt-1 text-right text-[11px] font-semibold text-muted-foreground">
                    {t.mastery}% mastered
                  </p>
                </div>
                <ChevronDown
                  className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                />
              </button>
              {isOpen && (
                <ul className="flex list-disc flex-col gap-2 border-t border-border px-5 py-4 pl-10 text-sm leading-relaxed marker:text-primary">
                  {t.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
