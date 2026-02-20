import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { applyTheme, type ThemeName } from "../lib/themeTokens";
import { Sun, Moon } from "lucide-react";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      const s = localStorage.getItem("dscvr-theme") as ThemeName;
      return s === "light" || s === "dark" ? s : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem("dscvr-theme", theme);
    } catch {}
  }, [theme]);

  const setTheme = useCallback((t: ThemeName) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((p) => (p === "light" ? "dark" : "light")),
    []
  );
  const toggle = toggleTheme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      data-testid="theme-toggle"
      className="w-[34px] h-[34px] rounded-full flex items-center justify-center cursor-pointer hover-elevate transition-colors"
      style={{
        background: "var(--b2)",
        border: "1px solid var(--b)",
        color: "var(--t2)",
      }}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const options: { id: ThemeName; name: string; desc: string }[] = [
    { id: "light", name: "Light", desc: "White / Red / IBM Plex" },
    { id: "dark", name: "Dark", desc: "Navy / Teal / Original" },
  ];

  return (
    <div data-testid="theme-switcher">
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--t3)",
          marginBottom: "10px",
        }}
      >
        Colour Theme
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            aria-pressed={theme === o.id}
            data-testid={`theme-option-${o.id}`}
            style={{
              background: theme === o.id ? "var(--accent-tint)" : "var(--surface)",
              border: `2px solid ${theme === o.id ? "var(--accent)" : "var(--b)"}`,
              borderRadius: "10px",
              padding: "10px",
              cursor: "pointer",
              flex: 1,
              textAlign: "left",
              transition: "all 0.18s",
            }}
          >
            <div
              style={{
                display: "flex",
                borderRadius: "6px",
                overflow: "hidden",
                height: "48px",
                marginBottom: "8px",
                border: "1px solid var(--b)",
              }}
            >
              <div
                style={{
                  width: "28%",
                  background: o.id === "light" ? "#0F1923" : "#0A1628",
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: o.id === "light" ? "#F7F8FA" : "#07101E",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  padding: "5px",
                }}
              >
                <div
                  style={{
                    height: "8px",
                    background: o.id === "light" ? "#fff" : "#0C1A2E",
                    borderRadius: "2px",
                  }}
                />
                <div
                  style={{
                    height: "9px",
                    background: o.id === "light" ? "#fff" : "#0F2040",
                    border: o.id === "light" ? "1px solid rgba(0,0,0,0.07)" : "none",
                    borderRadius: "2px",
                  }}
                />
                <div
                  style={{
                    height: "9px",
                    width: "70%",
                    background: o.id === "light" ? "#fff" : "#0F2040",
                    border: o.id === "light" ? "1px solid rgba(0,0,0,0.07)" : "none",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--txt)",
                marginBottom: "2px",
              }}
            >
              {o.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--t3)",
              }}
            >
              {o.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
