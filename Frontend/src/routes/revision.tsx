import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { revisionNotes } from "@/lib/mock-data";

export const Route = createFileRoute("/revision")({
  head: () => ({
    meta: [
      { title: "Revision notes for your weak topics — PrepMate" },
      {
        name: "description",
        content: "Short bullet-point revision notes covering only the topics you keep getting wrong, with one-tap re-tests.",
      },
      { property: "og:title", content: "Revision notes for your weak topics — PrepMate" },
      { property: "og:description", content: "Focused bullets for weak topics, plus a re-test for each one." },
    ],
  }),
  component: RevisionPage,
});

function RevisionPage() {
  return (
    <AppShell
      title="Revision plan"
      subtitle="Only your 4 weakest topics — roughly 20 minutes of reading."
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {revisionNotes.map((n) => (
          <article key={n.topic} className="rounded-3xl bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">{n.topic}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="size-3 shrink-0" />
                  {n.source}
                </p>
              </div>
              <span className="rounded-lg bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
                {n.accuracy}% accuracy
              </span>
            </div>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed marker:text-primary">
              {n.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Button asChild variant="secondary" className="mt-5 rounded-xl font-semibold">
              <Link to="/quiz">
                <RotateCcw className="size-4" /> Re-test this topic
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
