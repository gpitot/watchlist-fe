import React, { useState } from "react";
import { useTheme, Theme } from "providers/theme_provider";
import classNames from "classnames";

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "light", label: "Light", icon: "☀️" },
  { value: "sunset", label: "Sunset", icon: "🌅" },
  { value: "ocean", label: "Ocean", icon: "🌊" },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-surface hover:bg-surface-hover border border-border-default hover:border-border-hover text-text-primary transition-all text-sm font-medium active:scale-95"
        aria-label="Switch theme"
      >
        <span className="text-base">{currentTheme.icon}</span>
        <span className="hidden xs:inline">{currentTheme.label}</span>
        <svg
          className={classNames(
            "w-3.5 h-3.5 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-bg-tertiary border border-border-default shadow-primary-lg z-20 overflow-hidden">
            <div className="p-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setTheme(t.value);
                    setIsOpen(false);
                  }}
                  className={classNames(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                    theme === t.value
                      ? "bg-primary/20 text-text-primary border border-primary/30"
                      : "hover:bg-surface-hover text-text-secondary"
                  )}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="font-medium text-sm">{t.label}</span>
                  {theme === t.value && (
                    <svg
                      className="w-4 h-4 ml-auto text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
