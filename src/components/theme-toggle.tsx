"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "@phosphor-icons/react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.style.backgroundColor = "#0a0a0a";
      html.style.color = "#fafafa";
      html.setAttribute("data-theme", "dark");
    } else {
      html.style.backgroundColor = "#fafafa";
      html.style.color = "#0f0f0f";
      html.setAttribute("data-theme", "light");
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    applyTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-[4px] transition-colors"
      style={{ color: "var(--color-text-3)" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
        (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
      }}
      aria-label="Cambiar tema"
    >
      {isDark ? (
        <Sun size={18} weight="regular" />
      ) : (
        <Moon size={18} weight="regular" />
      )}
    </button>
  );
}