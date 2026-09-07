
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suggestedQuestions } from "@/lib/mock-data";
import * as api from "@/lib/api";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask your notes — PrepMate" },
      {
        name: "description",
        content: "Ask questions in plain English and get answers cited straight from your own uploaded notes.",
      },
      { property: "og:title", content: "Ask your notes — PrepMate" },
      {
        property: "og:description",
        content: "Answers from your own notes, with page-level citations.",
      },
    ],
  }),
  component: AskPage,
});

type Message = { id: string; role: "user" | "assistant"; text: string };

function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  const askMutation = useMutation({
    mutationFn: (question: string) => api.askQuestion(question),
  });

  const send = async (text: string) => {
    if (!text.trim() || askMutation.isPending) return;
    const id = Date.now().toString();
    setMessages((m) => [...m, { id, role: "user", text }]);
    setDraft("");

    try {
      const res = await askMutation.mutateAsync(text);
      setMessages((m) => [...m, { id: id + "-a", role: "assistant", text: res.answer }]);
    } catch (err) {
      const message = err instanceof api.ApiError ? err.message : "Something went wrong.";
      setMessages((m) => [...m, { id: id + "-err", role: "assistant", text: `⚠️ ${message}` }]);
    }
  };

  return (
    <AppShell title="Ask your notes" subtitle="Every answer is cited back to your uploads.">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Ask anything from your uploaded PDFs to get started.
            </p>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-lilac text-lilac-foreground">
                  <Sparkles className="size-4" />
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-card p-4 shadow-soft">
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ),
          )}
          {askMutation.isPending && (
            <p className="text-sm text-muted-foreground">PrepMate is thinking…</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="sticky bottom-4 flex gap-2 rounded-2xl bg-card p-2 shadow-lift"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything from your notes…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="icon" className="rounded-xl" aria-label="Send question">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}