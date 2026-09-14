
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

export const Route = createFileRoute("/progress")({
   validateSearch: (
    search: Record<string, unknown>
  ): {
    score: number | undefined;
    total: number | undefined;
    seconds: number | undefined;
    topic: string | undefined;
  } => ({
    score: search["score"] as number | undefined,
    total: search["total"] as number | undefined,
    seconds: search["seconds"] as number | undefined,
    topic: search["topic"] as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Results & weak topics — PrepMate" },
      {
        name: "description",
        content: "See your quiz score plus a breakdown of the weakest topics across every set of notes you've uploaded.",
      },
      { property: "og:title", content: "Results & weak topics — PrepMate" },
      { property: "og:description", content: "Score, accuracy trends and weak-topic breakdown across all materials." },
    ],
  }),
  component: ProgressPage,
});

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ProgressPage() {
  const { score, total, seconds } = useSearch({ from: "/progress" });
  const hasSessionResult = score !== undefined && total !== undefined && total > 0;

  const masteryQuery = useQuery({
    queryKey: ["mastery", "all"],
    queryFn: () => api.getAllMastery(),
  });

  const mastery = masteryQuery.data ?? [];

  const chartData = [...mastery]
    .sort((a, b) => a.mastery_score - b.mastery_score)
    .map((m) => ({
      name: m.topic.split(" ").slice(0, 2).join(" "),
      accuracy: Math.round(m.mastery_score * 100),
    }));

  const weakTopics = [...mastery]
    .filter((m) => m.mastery_score < 0.6)
    .sort((a, b) => a.mastery_score - b.mastery_score);

  const pct = hasSessionResult ? Math.round(((score as number) / (total as number)) * 100) : null;

  return (
    <AppShell
      title="Quiz results"
      subtitle={
        hasSessionResult
          ? `You scored ${score} out of ${total} — nice work, here's what to fix.`
          : "Here's a breakdown of your weakest topics so far."
      }
      action={
        <Button asChild variant="secondary" className="hidden rounded-xl font-semibold sm:inline-flex">
          <Link to="/quiz">Retake quiz</Link>
        </Button>
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {hasSessionResult && (
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft">
              <p className="text-4xl font-extrabold">{pct}%</p>
              <p className="mt-1 text-sm opacity-85">
                {score} of {total} correct
              </p>
            </div>
            <div className="rounded-3xl bg-card p-6 shadow-soft">
              <p className="text-4xl font-extrabold">{seconds !== undefined ? formatTime(seconds) : "—"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Time taken</p>
            </div>
            <div className="rounded-3xl bg-card p-6 shadow-soft">
              <p className="text-4xl font-extrabold">{mastery.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Topics tracked overall</p>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="font-bold">Accuracy by topic</h2>
          <p className="mb-4 text-sm text-muted-foreground">Across all uploaded materials, not just this quiz.</p>
          {masteryQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No quiz attempts yet — take a quiz to start building your accuracy breakdown.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={54}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="font-bold">Weak topics to attack next</h2>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {weakTopics.length === 0 && !masteryQuery.isPending && (
              <p className="py-3 text-sm text-muted-foreground">No weak topics yet — keep taking quizzes.</p>
            )}
            {weakTopics.map((t) => (
              <div key={t.topic} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.topic}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.total_attempts} questions attempted
                  </p>
                </div>
                <span className="rounded-lg bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
                  {Math.round(t.mastery_score * 100)}%
                </span>
                <Button asChild size="sm" variant="secondary" className="rounded-lg font-semibold">
                  <Link to="/revision">Revise</Link>
                </Button>
              </div>
            ))}
          </div>
          <Button asChild className="mt-5 w-full rounded-xl font-semibold sm:w-auto">
            <Link to="/revision">Build my revision plan</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}