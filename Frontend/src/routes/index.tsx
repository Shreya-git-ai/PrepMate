import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Loader2, Upload, MessageCircleQuestion, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { materials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrepMate — Upload your notes and study smarter" },
      {
        name: "description",
        content:
          "Upload PDF notes to PrepMate and turn them into summaries, quizzes and revision plans built around your weak topics.",
      },
      { property: "og:title", content: "PrepMate — Upload your notes and study smarter" },
      {
        property: "og:description",
        content: "Turn your lecture PDFs into summaries, quizzes and targeted revision.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [dragging, setDragging] = useState(false);

  return (
    <AppShell
      title="Welcome back, Aanya 👋"
      subtitle="Upload notes, then let PrepMate do the heavy lifting."
      action={
        <Button asChild className="hidden rounded-xl font-semibold sm:inline-flex">
          <Link to="/quiz">Start a quiz</Link>
        </Button>
      }
    >
      <div className="mx-auto grid max-w-5xl gap-6">
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          className={cn(
            "rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center shadow-soft transition-colors",
            dragging && "border-primary bg-accent",
          )}
        >
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Upload className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold">Drop your PDF notes here</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Lecture slides, handwritten scans or textbook chapters — up to 50 MB each.
          </p>
          <Button className="mt-5 rounded-xl font-semibold">Browse files</Button>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Materials", value: "4" },
            { label: "Topics found", value: "25" },
            { label: "Quiz accuracy", value: "64%" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-card p-5 shadow-soft">
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-3 text-base font-bold">Your materials</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {materials.map((m) => (
              <article key={m.id} className="rounded-2xl bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold">{m.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.subject} · {m.pages} pages · {m.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  {m.status === "ready" ? (
                    <Badge className="rounded-lg bg-success text-success-foreground">
                      {m.topics} topics ready
                    </Badge>
                  ) : (
                    <Badge className="rounded-lg bg-warning text-warning-foreground">
                      <Loader2 className="mr-1 size-3 animate-spin" /> Processing
                    </Badge>
                  )}
                  <div className="flex gap-1">
                    <Button asChild variant="ghost" size="sm" className="rounded-lg font-semibold">
                      <Link to="/ask">
                        <MessageCircleQuestion className="size-4" /> Ask
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="rounded-lg font-semibold">
                      <Link to="/topics">
                        <Sparkles className="size-4" /> Topics
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
