"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  // next-themes reports `theme` as undefined until mounted (avoids a
  // hydration mismatch) — treat that as "not dark" rather than tracking a
  // separate mounted flag.
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2"
      aria-label="Cambiar tema"
    >
      {isDark ? (
        <Moon className="text-muted-foreground size-4" />
      ) : (
        <Sun className="text-muted-foreground size-4" />
      )}
      <span
        className="bg-secondary data-[on=true]:bg-primary relative h-6 w-10 shrink-0 rounded-full transition-colors"
        data-on={isDark}
      >
        <span
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: isDark ? "translateX(16px)" : "translateX(0)" }}
        />
      </span>
    </button>
  );
}
