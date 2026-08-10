import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { quizQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Practice quiz — PrepMate" },
      {
        name: "description",
        content: "Take a multiple-choice quiz generated from your own notes, one question at a time.",
      },
      { property: "og:title", content: "Practice quiz — PrepMate" },
      { property: "og:description", content: "MCQ practice generated from your uploaded materials." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const q = quizQuestions[index];
  if (!q) return null;
  const isLast = index === quizQuestions.length - 1;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AppShell
      title="Mixed practice quiz"
      subtitle="Generated from all 4 of your materials."
      action={
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground tabular-nums">
          <Clock className="size-4" />
          {mm}:{ss}
        </span>
      }
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <div className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Question {index + 1} of {quizQuestions.length}
            </span>
            <span>{q.topic}</span>
          </div>
          <Progress value={((index + (checked ? 1 : 0)) / quizQuestions.length) * 100} className="h-2" />
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold leading-snug">{q.prompt}</h2>
          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              const selected = choice === i;
              const correct = i === q.answerIndex;
              return (
                <button
                  key={opt}
                  disabled={checked}
                  onClick={() => setChoice(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 border-border bg-background px-4 py-3.5 text-left text-sm font-medium transition-colors",
                    !checked && "hover:border-primary/60",
                    selected && !checked && "border-primary bg-accent",
                    checked && correct && "border-success bg-success/12",
                    checked && selected && !correct && "border-destructive bg-destructive/10",
                  )}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {checked && correct && <Check className="size-4 text-success" />}
                  {checked && selected && !correct && <X className="size-4 text-destructive" />}
                </button>
              );
            })}
          </div>

          {checked && (
            <p className="mt-4 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
              <span className="font-bold">Why: </span>
              {q.explanation}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {!checked ? (
            <Button
              disabled={choice === null}
              onClick={() => setChecked(true)}
              className="rounded-xl px-6 font-semibold"
            >
              Submit answer
            </Button>
          ) : isLast ? (
            <Button asChild className="rounded-xl px-6 font-semibold">
              <Link to="/progress">See results</Link>
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIndex((i) => i + 1);
                setChoice(null);
                setChecked(false);
              }}
              className="rounded-xl px-6 font-semibold"
            >
              Next question
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
