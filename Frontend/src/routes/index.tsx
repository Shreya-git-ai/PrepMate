import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Upload, MessageCircleQuestion, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getToken, getDocuments, uploadDocument } from "@/lib/api";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Client-only state -- server render ke waqt yeh hamesha false rehta hai,
  // taaki localStorage ko render ke dauraan kabhi touch na karein.
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate({ to: "/login" });
    } else {
      setHasToken(true);
    }
  }, [navigate]);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
    enabled: hasToken,
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      setUploadError("Only PDF files are supported.");
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      await uploadDocument(file);
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell
      title="Welcome back 👋"
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
            handleFiles(e.dataTransfer.files);
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

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            className="mt-5 rounded-xl font-semibold"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Uploading…
              </>
            ) : (
              "Browse files"
            )}
          </Button>

          {uploadError && (
            <p className="mt-3 text-sm font-medium text-destructive">{uploadError}</p>
          )}
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Materials", value: String(documents.length) },
            { label: "Processed", value: String(documents.filter((d) => d.status === "processed").length) },
            { label: "Pending", value: String(documents.filter((d) => d.status !== "processed").length) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-card p-5 shadow-soft">
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-3 text-base font-bold">Your materials</h2>

          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading your materials…</p>
          )}

          {!isLoading && documents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No materials yet — drop a PDF above to get started.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((m) => (
              <article key={m.id} className="rounded-2xl bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold">{m.filename}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(m.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  {m.status === "processed" ? (
                    <Badge className="rounded-lg bg-success text-success-foreground">
                      Ready
                    </Badge>
                  ) : m.status === "failed" ? (
                    <Badge className="rounded-lg bg-destructive text-destructive-foreground">
                      Failed
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