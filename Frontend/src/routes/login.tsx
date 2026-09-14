import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Log in — PrepMate" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = mode === "login" ? await login(email, password) : await signup(email, password);
    if (ok) navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-soft"
      >
        <h1 className="text-xl font-bold">{mode === "login" ? "Log in" : "Create account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Welcome back to PrepMate." : "Start studying smarter."}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-5 w-full rounded-xl font-semibold">
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}