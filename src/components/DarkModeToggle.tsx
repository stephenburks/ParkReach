"use client";

import { useDarkMode } from "@/context/DarkModeProvider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-park-bark hover:bg-stone-200 dark:text-park-cream dark:hover:bg-stone-700"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
