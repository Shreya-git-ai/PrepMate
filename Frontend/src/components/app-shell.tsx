import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Home,
  LayoutList,
  MessageCircleQuestion,
  Menu,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/ask", label: "Ask", icon: MessageCircleQuestion },
  { to: "/quiz", label: "Quiz", icon: Sparkles },
  { to: "/progress", label: "Progress", icon: TrendingUp },
];

const secondary = [
  { to: "/topics", label: "Topics", icon: LayoutList },
  { to: "/revision", label: "Revision", icon: BookOpen },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/" }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
        >
          <item.icon className="size-[18px]" />
          {item.label}
        </Link>
      ))}
      <p className="mt-6 px-3 pb-1 text-[11px] font-bold tracking-widest text-muted-foreground/70 uppercase">
        Study tools
      </p>
      {secondary.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
        >
          <item.icon className="size-[18px]" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-1">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="size-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">PrepMate</span>
    </Link>
  );
}

function StreakCard() {
  return (
    <div className="rounded-2xl bg-lilac p-4 text-lilac-foreground">
      <p className="text-sm font-bold">🔥 6-day streak</p>
      <p className="mt-1 text-xs opacity-80">Two quizzes today keeps it alive.</p>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-border bg-surface p-4 lg:flex">
        <div className="flex flex-col gap-8">
          <Brand />
          <NavList />
        </div>
        <StreakCard />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col justify-between border-r border-border bg-surface p-4">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <StreakCard />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur md:px-8">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
        <main className={cn("px-4 py-6 md:px-8 md:py-8")}>{children}</main>
      </div>
    </div>
  );
}
