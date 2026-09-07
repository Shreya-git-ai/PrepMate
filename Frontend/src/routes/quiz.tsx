import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Clock, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";

export const Route = createFileRoute("/quiz")({
  validateSearch: (search: Record<string, unknown>): { topic?: string | undefined } => ({
    topic: search["topic"] as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Practice quiz — PrepMate" },
      {
        name: "description",
        content: "Take a multiple-choice quiz generated from your own notes, one question at a time.",
      },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { topic: rawTopic } = useSearch({ from: "/quiz" });
  const topic = rawTopic || "General";

  const quizQuery = useQuery({
    queryKey: ["quiz", topic],
    queryFn: () => api.generateQuiz(topic, 5),
    retry: false,
  });

  const attemptMutation = useMutation({
    mutationFn: ({ questionId, selected }: { questionId: number; selected: string }) =>
      api.submitAttempt(questionId, selected),
  });

  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<api.AttemptResult | null>(null);

  const questions = quizQuery.data?.questions ?? [];
  const q = questions[index];

  if (quizQuery.isPending) {
    return (
      <AppShell title="Generating quiz…" subtitle={`Building questions for "${topic}"`}>
        <p className="text-center text-sm text-muted-foreground">This can take a few seconds…</p>
      </AppShell>
    );
  }

  if (quizQuery.isError) {
    const message =
      quizQuery.error instanceof api.ApiError ? quizQuery.error.message : "Failed to generate quiz.";
    return (
      <AppShell title="Couldn't generate quiz" subtitle={topic}>
        <p className="text-center text-sm text-destructive">{message}</p>
      </AppShell>
    );
  }

  if (!q) return null;

  const isLast = index === questions.length - 1;
  const checked = result !== null;

  const submitAnswer = () => {
    if (choice === null) return;
    const selectedOption = q.options[choice];
    if (selectedOption === undefined) return;
    attemptMutation.mutate(
      { questionId: q.id, selected: selectedOption },
      { onSuccess: (res) => setResult(res) }
    );
  };

  return (
    <AppShell
      title={`Quiz: ${topic}`}
      subtitle="Generated from your uploaded notes."
      action={
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">
          <Clock className="size-4" />
          {index + 1}/{questions.length}
        </span>
      }
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Progress value={((index + (checked ? 1 : 0)) / questions.length) * 100} className="h-2" />

        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold leading-snug">{q.question_text}</h2>
          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              const selected = choice === i;
              const isCorrectOption = checked && result?.correct_answer === opt;
              const isWrongSelection = checked && selected && !isCorrectOption;
              return (
                <button
                  key={opt}
                  disabled={checked}
                  onClick={() => setChoice(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 border-border bg-background px-4 py-3.5 text-left text-sm font-medium transition-colors",
                    !checked && "hover:border-primary/60",
                    selected && !checked && "border-primary bg-accent",
                    isCorrectOption && "border-success bg-success/12",
                    isWrongSelection && "border-destructive bg-destructive/10",
                  )}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrectOption && <Check className="size-4 text-success" />}
                  {isWrongSelection && <X className="size-4 text-destructive" />}
                </button>
              );
            })}
          </div>

          {checked && result?.explanation && (
            <p className="mt-4 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
              <span className="font-bold">Why: </span>
              {result.explanation}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {!checked ? (
            <Button
              disabled={choice === null || attemptMutation.isPending}
              onClick={submitAnswer}
              className="rounded-xl px-6 font-semibold"
            >
              {attemptMutation.isPending ? "Checking…" : "Submit answer"}
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
                setResult(null);
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