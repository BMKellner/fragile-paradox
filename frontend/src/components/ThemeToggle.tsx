"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className="relative inline-flex h-8 w-14 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/85 transition-colors duration-200 hover:bg-[var(--color-accent)]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
    >
      <span
        className={`pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow transition-transform duration-200 ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
