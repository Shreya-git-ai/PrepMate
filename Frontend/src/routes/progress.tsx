import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { weakTopics } from "@/lib/mock-data";

export const Route = createFileRoute("/progress")({
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

const chartData = [...weakTopics]
  .sort((a, b) => a.accuracy - b.accuracy)
  .map((t) => ({ name: t.topic.split(" ").slice(0, 2).join(" "), accuracy: t.accuracy }));

function ProgressPage() {
  return (
    <AppShell
      title="Quiz results"
      subtitle="You scored 3 out of 5 — nice work, here's what to fix."
      action={
        <Button asChild variant="secondary" className="hidden rounded-xl font-semibold sm:inline-flex">
          <Link to="/quiz">Retake quiz</Link>
        </Button>
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft">
            <p className="text-4xl font-extrabold">60%</p>
            <p className="mt-1 text-sm opacity-85">3 of 5 correct</p>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <p className="text-4xl font-extrabold">4:12</p>
            <p className="mt-1 text-sm text-muted-foreground">Time taken</p>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <p className="text-4xl font-extrabold">+8%</p>
            <p className="mt-1 text-sm text-muted-foreground">vs. last attempt</p>
          </div>
        </section>

        <section className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="font-bold">Accuracy by topic</h2>
          <p className="mb-4 text-sm text-muted-foreground">Across all uploaded materials, not just this quiz.</p>
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
        </section>

        <section className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="font-bold">Weak topics to attack next</h2>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {weakTopics
              .filter((t) => t.accuracy < 60)
              .map((t) => (
                <div key={t.topic} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t.topic}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.source} · {t.attempts} questions attempted
                    </p>
                  </div>
                  <span className="rounded-lg bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
                    {t.accuracy}%
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
