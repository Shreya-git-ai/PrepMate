import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialChat, suggestedQuestions, type ChatMessage } from "@/lib/mock-data";

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

function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [draft, setDraft] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = Date.now().toString();
    setMessages((m) => [
      ...m,
      { id, role: "user", text },
      {
        id: id + "-a",
        role: "assistant",
        text: "Here's what your notes say: the key idea is to compare the mechanisms step by step, then check which conditions stabilise the intermediate. Practise two problems on this before moving on.",
        citations: [
          { label: "Organic Chemistry — Unit 3", page: 21 },
          { label: "Cell Biology Lecture Slides", page: 8 },
        ],
      },
    ]);
    setDraft("");
  };

  return (
    <AppShell title="Ask your notes" subtitle="Every answer is cited back to your uploads.">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex flex-col gap-4">
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
                  {m.citations && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.citations.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[11px] font-semibold text-secondary-foreground"
                        >
                          <FileText className="size-3" />
                          {c.label} · p.{c.page}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
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
